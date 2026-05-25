"""
Groups Service — Lobby management + Minimax Group Referee.

Implements ALL Group Lobby endpoints:
  - create_group: Tạo phòng, auto-join creator với is_host=True + clone session_vector
  - join_group: Tham gia phòng, clone user vector thành session_vector
  - leave_group, set_ready: Quản lý trạng thái
  - group_recommend: Minimax Referee đọc session_vector (KHÔNG đọc user vector gốc)
  - group_sync: Polling endpoint cho Frontend (starred cards, group vector, vault count)
  - group_vault: Lấy danh sách các quán đã được ít nhất 1 người LIKED/STARRED
  - group_finish: Host chốt danh sách, chạy Minimax lần cuối
  - group_undo: Rollback thẻ vừa quẹt + đảo ngược vector delta

Minimax formula: min(max_i∈Group |Score_i - Score_ideal|)
Implementation:
  1. Collect each member's SESSION VECTOR (not profile vector)
  2. Average vectors with compromise_score boost for members who were "sacrificed" last round
  3. Score all candidate locations for each member
  4. Pick the location that minimizes the maximum dissatisfaction
  5. Update compromise_score for the most-sacrificed member going forward
"""
import asyncio
import json
import random
import string
import numpy as np
from numpy.typing import NDArray
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_
from typing import Optional, List, Dict, Any

from src.groups.models import Group, GroupMember
from src.users.models import User
from src.interactions.models import Interaction
from src.locations.models import Location
from src.recommendations.service import _cosine_sim


# ─── Lobby Management ────────────────────────────────────────────────────

def _generate_invite_code() -> str:
    """Generate a human-friendly invite code like FEAST-4X2K."""
    words = ["FEAST", "TASTE", "YUMMY", "SPICY", "SQUAD", "NOMAD", "BITES", "CRISP"]
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{random.choice(words)}-{suffix}"


async def create_group(db: AsyncSession, data, creator_id: int) -> dict:
    """Tạo phòng nhóm mới. Creator tự động join với is_host=True."""
    payload = data.model_dump()
    desc = payload.pop("description", None)
    if desc and not payload.get("route_description"):
        payload["route_description"] = desc
    
    if not payload.get("is_public", True):
        # Generate unique invite code for private rooms
        for _ in range(10):
            code = _generate_invite_code()
            result = await db.execute(select(Group).where(Group.invite_code == code))
            exists = result.scalar_one_or_none()
            if not exists:
                payload["invite_code"] = code
                break
        else:
            raise HTTPException(status_code=500, detail="Failed to generate unique invite code")
    group = Group(**payload)
    db.add(group)
    await db.flush()

    # Load creator's vector to clone as session_vector
    result = await db.execute(select(User).where(User.id == creator_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    session_vec = list(user.food_vector) if user.food_vector is not None else [0.5] * 15

    member = GroupMember(
        group_id=group.id,
        user_id=creator_id,
        is_host=True,         # #6: Creator = Host
        session_vector=session_vec,  # #1: Clone vector gốc
    )
    db.add(member)

    try:
        await db.commit()
        await db.refresh(group)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return await _group_to_dict(db, group)


async def list_groups(db: AsyncSession, status: str = "active", limit: int = 10, public_only: bool = True) -> List[dict]:
    query = select(Group).where(Group.status == status)
    if public_only:
        query = query.where(Group.is_public == True)
    query = query.order_by(Group.created_at.desc()).limit(limit)
    result = await db.execute(query)
    groups = result.scalars().all()
    return [await _group_to_dict(db, g) for g in groups]


async def join_by_code(db: AsyncSession, invite_code: str, user_id: int) -> dict:
    """Join a private room using its invite code."""
    result = await db.execute(select(Group).where(Group.invite_code == invite_code.upper().strip()))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    if group.status != "active":
        raise HTTPException(status_code=400, detail="This room has ended")
    return await join_group(db, group.id, user_id)


async def get_group(db: AsyncSession, group_id: int) -> dict:
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Lobby không tìm thấy")
    return await _group_to_dict(db, group)


async def join_group(db: AsyncSession, group_id: int, user_id: int) -> dict:
    """Tham gia lobby. Clone user vector gốc thành session_vector."""
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Lobby không tồn tại")
    if group.status != "active":
        raise HTTPException(status_code=400, detail="Lobby đã kết thúc")

    members_q = await db.execute(select(GroupMember).where(GroupMember.group_id == group_id))
    members = members_q.scalars().all()

    if len(members) >= group.max_spots:
        raise HTTPException(status_code=400, detail="Lobby đã đầy")

    existing = next((m for m in members if m.user_id == user_id), None)
    if existing:
        return {"status": "already_joined"}

    # Clone user vector gốc thành session_vector
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    session_vec = list(user.food_vector) if user.food_vector is not None else [0.5] * 15

    new_member = GroupMember(
        group_id=group_id,
        user_id=user_id,
        is_host=False,
        session_vector=session_vec,
    )
    db.add(new_member)
    await db.commit()
    return {"status": "joined"}


async def leave_group(db: AsyncSession, group_id: int, user_id: int) -> dict:
    result = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
    )
    member = result.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Bạn không phải thành viên lobby này")
    await db.delete(member)
    await db.commit()
    return {"status": "left"}


async def delete_group(db: AsyncSession, group_id: int, user_id: int) -> dict:
    """Delete a group room. Only the room owner (host) can do this."""
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Lobby không tồn tại")

    member_q = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = member_q.scalars().first()
    if not member or not member.is_host:
        raise HTTPException(status_code=403, detail="Chỉ chủ phòng mới có quyền xóa lobby")

    await db.delete(group)
    await db.commit()
    return {"status": "deleted", "group_id": group_id}


async def set_ready(db: AsyncSession, group_id: int, user_id: int, is_ready: bool) -> dict:
    result = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
    )
    member = result.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Bạn không phải thành viên lobby này")
    member.is_ready = is_ready
    await db.commit()
    return {"is_ready": is_ready}


async def is_group_member(db: AsyncSession, group_id: int, user_id: int) -> bool:
    """Check whether a user belongs to a group."""
    result = await db.execute(
        select(GroupMember.id).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    return result.scalar_one_or_none() is not None


# ─── #4: Minimax Referee (Refactored — reads SESSION VECTOR) ────────────

async def group_recommend(db: AsyncSession, group_id: int, body, user_id: int) -> dict:
    """
    Minimax Referee — Lấy batch thẻ tiếp theo cho nhóm lướt.
    
    Key changes from original:
    1. Reads session_vector (NOT user.food_vector)
    2. Excludes locations already swiped by THIS user in THIS group
    3. Prioritizes starred cards from teammates
    4. Groups vectors with weighting based on compromise_score (loser boost)
    """
    # Validate group is active or in_progress
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group or group.status not in ("active", "in_progress"):
        raise HTTPException(status_code=400, detail="Lobby không hoạt động")

    # Get all members + their SESSION vectors
    members_q = await db.execute(
        select(GroupMember, User)
        .join(User, User.id == GroupMember.user_id)
        .where(GroupMember.group_id == group_id)
    )
    rows = members_q.all()
    if not rows:
        raise HTTPException(status_code=400, detail="Lobby trống")

    member_data = []
    for gm, user in rows:
        # ⚠️ CRITICAL: Đọc session_vector thay vì user.food_vector
        vec = gm.session_vector
        if vec is None:
            vec = user.food_vector if body.category == "food" else user.place_vector
        member_data.append({
            "user_id": user.id,
            "display_name": user.display_name or user.username,
            "vector": np.array(vec if vec is not None else [0.5] * 15, dtype=float),
            "compromise_score": gm.compromise_score or 0.0,
        })

    # Boost weights for members who were "sacrificed" most
    weights = np.array([1.0 + m["compromise_score"] for m in member_data])
    weights = weights / weights.sum()  # normalize
    # input shape: weights (N,), vectors (N, 15) → group_vector (15,)
    group_vector = sum(w * m["vector"] for w, m in zip(weights, member_data))

    # Get location IDs already swiped by THIS user in THIS group (exclude duplicates)
    swiped_q = await db.execute(
        select(Interaction.location_id).where(
            Interaction.group_id == group_id,
            Interaction.user_id == user_id,
        )
    )
    swiped_ids = set(row[0] for row in swiped_q.all())

    # Get starred cards from teammates (prioritize these)
    starred_q = await db.execute(
        select(Interaction.location_id).where(
            Interaction.group_id == group_id,
            Interaction.user_id != user_id,
            Interaction.action == "STARRED",
        )
    )
    starred_ids = set(row[0] for row in starred_q.all()) - swiped_ids

    # Candidate locations (excluding already swiped)
    locs_q = await db.execute(
        select(Location).where(Location.category == body.category).limit(200)
    )
    locations = locs_q.scalars().all()

    results = []
    starred_results = []

    for loc in locations:
        if loc.vector is None or loc.id in swiped_ids:
            continue
        P = np.array(loc.vector, dtype=float)
        group_score = float(_cosine_sim(group_vector, P))
        member_scores = [
            {"user_id": m["user_id"], "display_name": m["display_name"],
             "score": float(_cosine_sim(m["vector"], P)),
             "compromise": 0.0}
            for m in member_data
        ]
        # Compute compromise for each member (Minimax: |Score - Score_ideal|)
        ideal = 1.0  # Score_ideal = 1.0 per spec
        for s in member_scores:
            s["compromise"] = round(abs(ideal - s["score"]), 3)

        max_compromise = max(s["compromise"] for s in member_scores)
        most_compromised = max(member_scores, key=lambda x: x["compromise"])

        entry = {
            "place_id": loc.id, "name": loc.name, "group_score": round(group_score, 3),
            "image_url": loc.image_url,
            "price_range": loc.price_range,
            "rating": loc.rating,
            "address": loc.address,
            "member_scores": member_scores,
            "most_compromised_member": most_compromised["display_name"],
            "compensation_note": f"{most_compromised['display_name']} sẽ được ưu tiên ở lượt sau",
            "_max_compromise": max_compromise,  # internal sort key
        }

        if loc.id in starred_ids:
            starred_results.append(entry)
        else:
            results.append(entry)

    # Minimax sort: minimize max dissatisfaction
    results.sort(key=lambda x: x["_max_compromise"])
    starred_results.sort(key=lambda x: x["_max_compromise"])

    # Starred cards go FIRST in the deck, then Minimax-sorted regular cards
    final = starred_results + results

    # Clean internal keys before response
    for r in final:
        r.pop("_max_compromise", None)

    return {
        "group_vector": group_vector.tolist(),
        "recommendations": final[:body.top_n],
    }


# ─── #3: Sync (Polling endpoint) ─────────────────────────────────────────

async def group_sync(db: AsyncSession, group_id: int, user_id: int, since_ts: Optional[str] = None) -> dict:
    """
    Polling endpoint cho Frontend.
    Trả về: starred cards mới, group vector hiện tại, trạng thái members, vault count.
    Frontend gọi mỗi 3-5 giây.
    """
    # Validate group
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Lobby không tìm thấy")

    # Get all members + session vectors
    members_q = await db.execute(
        select(GroupMember, User)
        .join(User, User.id == GroupMember.user_id)
        .where(GroupMember.group_id == group_id)
    )
    rows = members_q.all()

    # Compute group vector (average of session vectors)
    session_vectors = []
    members_status = []
    for gm, user in rows:
        vec = gm.session_vector
        if vec is not None:
            session_vectors.append(np.array(vec, dtype=float))

        # Count swipes for this member in this group
        swipe_count_q = await db.execute(
            select(func.count()).where(
                Interaction.group_id == group_id,
                Interaction.user_id == user.id,
            )
        )
        swipe_count = swipe_count_q.scalar_one() or 0

        members_status.append({
            "user_id": user.id,
            "display_name": user.display_name or user.username,
            "swipe_count": swipe_count,
            "is_ready": gm.is_ready,
        })

    group_vector = []
    if session_vectors:
        # input shape: (N, 15) → output shape: (15,)
        avg = np.mean(session_vectors, axis=0)
        group_vector = [round(float(x), 4) for x in avg]

    # Starred cards from OTHER members (that THIS user hasn't swiped yet)
    swiped_q = await db.execute(
        select(Interaction.location_id).where(
            Interaction.group_id == group_id,
            Interaction.user_id == user_id,
        )
    )
    swiped_ids = set(row[0] for row in swiped_q.all())

    starred_filter = [
        Interaction.group_id == group_id,
        Interaction.user_id != user_id,
        Interaction.action == "STARRED",
    ]
    if since_ts:
        from datetime import datetime
        try:
            ts = datetime.fromisoformat(since_ts)
            starred_filter.append(Interaction.timestamp > ts)
        except ValueError:
            pass

    starred_q = await db.execute(
        select(Interaction, Location, User)
        .join(Location, Location.id == Interaction.location_id)
        .join(User, User.id == Interaction.user_id)
        .where(*starred_filter)
        .order_by(Interaction.timestamp.desc())
    )
    starred_rows = starred_q.all()

    starred_cards = []
    for inter, loc, star_user in starred_rows:
        if inter.location_id not in swiped_ids:
            starred_cards.append({
                "location_id": loc.id,
                "location_name": loc.name,
                "image_url": loc.image_url,
                "starred_by": star_user.display_name or star_user.username,
                "starred_at": inter.timestamp.isoformat() if inter.timestamp else None,
            })

    # Vault count
    vault_count_q = await db.execute(
        select(func.count(func.distinct(Interaction.location_id))).where(
            Interaction.group_id == group_id,
            Interaction.action.in_(["LIKED", "STARRED"]),
        )
    )
    vault_count = vault_count_q.scalar_one() or 0

    return {
        "starred_cards": starred_cards,
        "group_vector": group_vector,
        "members_status": members_status,
        "vault_count": vault_count,
    }


# ─── #7: Vault (Kho lưu trữ nhóm) ───────────────────────────────────────

async def group_vault(
    db: AsyncSession,
    group_id: int,
    limit: int = 50,
    sort_by: str = "votes",
) -> dict:
    """
    Trả về toàn bộ các địa điểm đã được ít nhất 1 người LIKED/STARRED trong phòng này.
    Query dựa trên Interaction.group_id + composite index (group_id, action).
    """
    # Get all LIKED/STARRED interactions in this group
    inter_q = await db.execute(
        select(Interaction, Location, User)
        .join(Location, Location.id == Interaction.location_id)
        .join(User, User.id == Interaction.user_id)
        .where(
            Interaction.group_id == group_id,
            Interaction.action.in_(["LIKED", "STARRED"]),
        )
        .order_by(Interaction.timestamp.desc())
    )
    rows = inter_q.all()

    # Aggregate by location
    location_map: Dict[int, dict] = {}
    for inter, loc, user in rows:
        if loc.id not in location_map:
            location_map[loc.id] = {
                "location_id": loc.id,
                "name": loc.name,
                "image_url": loc.image_url,
                "total_likes": 0,
                "liked_by": [],
                "_latest_ts": inter.timestamp,
            }
        entry = location_map[loc.id]
        entry["total_likes"] += 1
        entry["liked_by"].append({
            "user_id": user.id,
            "display_name": user.display_name or user.username,
            "action": inter.action,
        })

    items = list(location_map.values())

    # Sort
    if sort_by == "votes":
        items.sort(key=lambda x: x["total_likes"], reverse=True)
    else:  # "recent"
        items.sort(key=lambda x: x["_latest_ts"], reverse=True)

    # Clean internal keys + limit
    for item in items:
        item.pop("_latest_ts", None)

    return {"items": items[:limit]}


# ─── #7: Finish (Chốt danh sách) ─────────────────────────────────────────

async def group_finish(db: AsyncSession, group_id: int, user_id: int, top_n: int = 3) -> dict:
    """
    Chốt phiên khám phá. Chỉ Host mới gọi được.
    1. Kiểm tra quyền is_host
    2. Đổi group.status = 'completed'
    3. Chạy Minimax lần cuối trên session_vectors → Top N kết quả
    4. Cross-reference in_vault với bảng Interactions
    """
    # Check host permission
    member_q = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    host_member = member_q.scalars().first()
    if not host_member or not host_member.is_host:
        raise HTTPException(status_code=403, detail="Chỉ Host mới có quyền chốt danh sách")

    # Lock group
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Lobby không tìm thấy")
    if group.status == "completed":
        raise HTTPException(status_code=400, detail="Lobby đã được chốt rồi")

    group.status = "completed"

    # Collect session vectors of ALL members
    members_q = await db.execute(
        select(GroupMember, User)
        .join(User, User.id == GroupMember.user_id)
        .where(GroupMember.group_id == group_id)
    )
    rows = members_q.all()

    member_data = []
    for gm, user in rows:
        vec = gm.session_vector
        if vec is None:
            vec = user.food_vector if user.food_vector is not None else [0.5] * 15
        member_data.append({
            "user_id": user.id,
            "display_name": user.display_name or user.username,
            "vector": np.array(vec, dtype=float),
            "compromise_score": gm.compromise_score or 0.0,
        })

    # Get vault location IDs (for in_vault cross-reference)
    vault_q = await db.execute(
        select(func.distinct(Interaction.location_id)).where(
            Interaction.group_id == group_id,
            Interaction.action.in_(["LIKED", "STARRED"]),
        )
    )
    vault_ids = set(row[0] for row in vault_q.all())

    # Candidate locations — score all food locations
    locs_q = await db.execute(
        select(Location).where(Location.category == "food").limit(200)
    )
    locations = locs_q.scalars().all()

    results = []
    for loc in locations:
        if loc.vector is None:
            continue
        P = np.array(loc.vector, dtype=float)

        member_scores = []
        for m in member_data:
            score = float(_cosine_sim(m["vector"], P))
            compromise = round(abs(1.0 - score), 3)  # |Score - Score_ideal|
            member_scores.append({
                "user_id": m["user_id"],
                "score": round(score, 3),
                "compromise": compromise,
            })

        # Minimax criterion: minimize max compromise
        max_compromise = max(s["compromise"] for s in member_scores)
        group_score = round(float(np.mean([s["score"] for s in member_scores])), 3)

        results.append({
            "place_id": loc.id,
            "name": loc.name,
            "group_score": group_score,
            "image_url": loc.image_url,
            "member_scores": member_scores,
            "in_vault": loc.id in vault_ids,
            "_max_compromise": max_compromise,
        })

    # Minimax sort: minimize max dissatisfaction
    results.sort(key=lambda x: x["_max_compromise"])

    # Take top_n
    final = results[:top_n]
    for r in final:
        r.pop("_max_compromise", None)

    await db.commit()

    return {
        "status": "completed",
        "final_resolutions": final,
        "message": "Phiên khám phá đã kết thúc. Host có thể chọn 1 trong các địa điểm trên để tạo Tour.",
    }


# ─── #5: Undo (Rollback thẻ vừa quẹt) ───────────────────────────────────

async def group_undo(db: AsyncSession, group_id: int, user_id: int) -> dict:
    """
    Undo thẻ vừa quẹt trong group lobby.
    1. Tìm Interaction gần nhất của user trong group
    2. Lấy location vector, đảo ngược phép tính U ± α·P
    3. Cập nhật session_vector
    4. Xóa Interaction record (rút phiếu Vote nếu có)
    """
    # Validate group is active
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group or group.status not in ("active", "in_progress"):
        raise HTTPException(status_code=400, detail="Lobby không hoạt động hoặc đã kết thúc")

    # Find latest interaction of this user in this group
    inter_q = await db.execute(
        select(Interaction)
        .where(
            Interaction.group_id == group_id,
            Interaction.user_id == user_id,
        )
        .order_by(Interaction.timestamp.desc())
        .limit(1)
    )
    last_inter = inter_q.scalars().first()
    if not last_inter:
        raise HTTPException(status_code=404, detail="Không có thẻ nào để hoàn tác")

    # Get the location vector for reverse calculation
    loc_q = await db.execute(select(Location).where(Location.id == last_inter.location_id))
    loc = loc_q.scalars().first()

    # Get member's session_vector
    member_q = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = member_q.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Bạn không phải thành viên lobby này")

    undone_id = last_inter.id

    # Reverse the vector update if we have both vectors
    if loc and loc.vector is not None and member.session_vector is not None:
        ALPHA = 0.1  # Same learning rate as interactions service
        U = np.array(member.session_vector, dtype=float)
        P = np.array(loc.vector, dtype=float)

        # Reverse: if action was LIKED/STARRED (RIGHT swipe) → subtract
        #          if action was SKIPPED/DISLIKED (LEFT swipe) → add back
        if last_inter.action in ("LIKED", "STARRED"):
            U = U - ALPHA * P
        elif last_inter.action in ("SKIPPED", "DISLIKED"):
            U = U + ALPHA * P

        U = np.clip(U, 0.0, 1.0)
        member.session_vector = [round(float(x), 4) for x in U]

    # Delete the interaction record (rút phiếu Vote nếu có)
    await db.delete(last_inter)
    await db.commit()

    return {
        "status": "undone",
        "undone_interaction_id": undone_id,
        "reverted_vector": list(member.session_vector or []),
    }


# ─── Group Swipe (Session Vector Update) ────────────────────────────

ALPHA = 0.1  # Learning rate for session vector updates


async def group_swipe(
    db: AsyncSession,
    group_id: int,
    user_id: int,
    location_id: int,
    action: str,
) -> dict:
    """
    Process a swipe action within a group lobby.

    1. Validate group is in_progress and user is member
    2. Create Interaction record with group_id
    3. Update GroupMember.session_vector:
       - LIKED:   U_new = U_old + α·P
       - SKIPPED: U_new = U_old - α·P
       - STARRED: U_new = U_old + 2α·P (boost)
    4. Clip vector to [0, 1]
    """
    # Validate action
    valid_actions = ("LIKED", "SKIPPED", "DISLIKED", "STARRED")
    action = action.upper()
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")

    # Validate group is in_progress
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group or group.status not in ("active", "in_progress"):
        raise HTTPException(status_code=400, detail="Lobby không hoạt động")

    # Validate membership
    member_q = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = member_q.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Bạn không phải thành viên lobby này")

    # Check for duplicate swipe on same location in this group
    dup_q = await db.execute(
        select(Interaction).where(
            Interaction.group_id == group_id,
            Interaction.user_id == user_id,
            Interaction.location_id == location_id,
        )
    )
    if dup_q.scalars().first():
        raise HTTPException(status_code=400, detail="Bạn đã quẹt thẻ này rồi")

    # Get location vector
    loc_q = await db.execute(select(Location).where(Location.id == location_id))
    loc = loc_q.scalars().first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location không tồn tại")

    # Create Interaction record
    interaction = Interaction(
        user_id=user_id,
        location_id=location_id,
        group_id=group_id,
        action=action,
    )
    db.add(interaction)
    await db.flush()  # Get interaction.id

    # Update session_vector
    if loc.vector is not None and member.session_vector is not None:
        U = np.array(member.session_vector, dtype=float)
        P = np.array(loc.vector, dtype=float)

        if action == "STARRED":
            U = U + 2 * ALPHA * P  # Boost mạnh hơn
        elif action in ("LIKED",):
            U = U + ALPHA * P
        elif action in ("SKIPPED", "DISLIKED"):
            U = U - ALPHA * P

        U = np.clip(U, 0.0, 1.0)
        member.session_vector = [round(float(x), 4) for x in U]

    await db.commit()

    return {
        "status": "swiped",
        "interaction_id": interaction.id,
        "updated_session_vector": list(member.session_vector or []),
        "is_starred": action == "STARRED",
    }


# ─── Group Launch (Host starts swipe session) ───────────────────────

async def group_launch(db: AsyncSession, group_id: int, user_id: int) -> dict:
    """
    Host launches the swipe session.
    1. Validate caller is host
    2. Validate all members are ready
    3. Set group.status = 'in_progress'
    """
    # Check host permission
    member_q = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    host_member = member_q.scalars().first()
    if not host_member or not host_member.is_host:
        raise HTTPException(status_code=403, detail="Chỉ Host mới có quyền launch")

    # Get group
    group_q = await db.execute(select(Group).where(Group.id == group_id))
    group = group_q.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Lobby không tìm thấy")
    if group.status != "active":
        raise HTTPException(status_code=400, detail="Lobby không ở trạng thái active")

    # Check all members ready
    members_q = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group_id)
    )
    members = members_q.scalars().all()
    if not members:
        raise HTTPException(status_code=400, detail="Lobby trống")

    not_ready = [m for m in members if not m.is_ready]
    if not_ready:
        raise HTTPException(
            status_code=400,
            detail=f"Còn {len(not_ready)} thành viên chưa sẵn sàng"
        )

    # Transition to in_progress
    group.status = "in_progress"
    await db.commit()

    return {
        "status": "in_progress",
        "group_id": group.id,
        "message": "Phiên khám phá đã bắt đầu! Mọi người hãy bắt đầu lướt thẻ.",
    }


# ─── Chat ─────────────────────────────────────────────────────────────────

async def get_group_messages(db: AsyncSession, group_id: int, limit: int = 50) -> dict:
    from src.groups.models import GroupChatMessage
    
    query = (
        select(GroupChatMessage, User)
        .join(User, User.id == GroupChatMessage.user_id)
        .where(GroupChatMessage.group_id == group_id)
        .order_by(GroupChatMessage.created_at.asc())
        .limit(limit)
    )
    result = await db.execute(query)
    rows = result.all()
    
    items = []
    for msg, user in rows:
        items.append({
            "id": msg.id,
            "group_id": msg.group_id,
            "user_id": msg.user_id,
            "username": user.display_name or user.username,
            "content": msg.content,
            "content_type": msg.content_type,
            "media_url": msg.media_url,
            "media_meta": msg.media_meta,
            "created_at": msg.created_at,
        })
    return {"items": items}

async def create_group_message(
    db: AsyncSession, group_id: int, user_id: int, 
    content: str | None = None,
    content_type: str = "text",
    media_url: str | None = None,
    media_meta: dict | None = None
) -> dict:
    from src.groups.models import GroupChatMessage
    
    msg = GroupChatMessage(
        group_id=group_id, 
        user_id=user_id, 
        content=content,
        content_type=content_type,
        media_url=media_url,
        media_meta=media_meta or {}
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    return {
        "id": msg.id,
        "group_id": msg.group_id,
        "user_id": msg.user_id,
        "username": user.display_name or user.username,
        "content": msg.content,
        "content_type": msg.content_type,
        "media_url": msg.media_url,
        "media_meta": msg.media_meta,
        "created_at": msg.created_at,
    }

# ─── Helper ──────────────────────────────────────────────────────────────


async def _group_to_dict(db: AsyncSession, group: Group) -> dict:
    members_q = await db.execute(
        select(GroupMember, User)
        .join(User, User.id == GroupMember.user_id)
        .where(GroupMember.group_id == group.id)
    )
    rows = members_q.all()
    members = [
        {
            "user_id": r[1].id,
            "display_name": r[1].display_name,
            "avatar_url": r[1].avatar_url,
            "is_host": r[0].is_host,
            "is_ready": r[0].is_ready,
        }
        for r in rows
    ]
    return {
        "id": group.id, "name": group.name, "status": group.status,
        "route_description": group.route_description,
        "scheduled_time": group.scheduled_time, "max_spots": group.max_spots,
        "cover_image_url": group.cover_image_url, "accent_color": group.accent_color,
        "is_public": group.is_public,
        "invite_code": group.invite_code,
        "created_at": group.created_at,
        "members": members,
        "spots_remaining": max(0, group.max_spots - len(members)),
    }
