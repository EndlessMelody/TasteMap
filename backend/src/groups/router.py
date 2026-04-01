from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.groups import service
from src.groups.schemas import (
    GroupCreate, ReadyUpdate,
    GroupRecommendRequest,
    FinishRequest,
)
from src.core.dependencies import get_current_user_id
from typing import Optional

router = APIRouter()


@router.post("/", summary="Tạo lobby nhóm mới", status_code=201)
async def create_group(
    body: GroupCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.create_group(db, body, user_id)


@router.get("/", summary="Danh sách lobby")
async def list_groups(
    status: str = Query("active"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    return {"items": await service.list_groups(db, status, limit)}


@router.get("/{group_id}", summary="Chi tiết lobby")
async def get_group(group_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_group(db, group_id)


@router.post("/{group_id}/join", summary="Tham gia lobby")
async def join_group(
    group_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.join_group(db, group_id, user_id)


@router.post("/{group_id}/leave", summary="Rời lobby")
async def leave_group(
    group_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.leave_group(db, group_id, user_id)


@router.patch("/{group_id}/ready", summary="Toggle trạng thái ready")
async def set_ready(
    group_id: int,
    body: ReadyUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.set_ready(db, group_id, user_id, body.is_ready)


@router.post(
    "/{group_id}/recommend",
    summary="Minimax Referee — Gợi ý thẻ tiếp theo cho nhóm lướt",
    description="Đọc session_vector của các thành viên, loại trừ thẻ đã quẹt, ưu tiên starred cards.",
)
async def group_recommend(
    group_id: int,
    body: GroupRecommendRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.group_recommend(db, group_id, body, user_id)


@router.get(
    "/{group_id}/sync",
    summary="Polling — Lấy trạng thái mới nhất của phòng",
    description="Frontend gọi mỗi 3-5 giây. Trả về starred cards mới, group vector, vault count.",
)
async def group_sync(
    group_id: int,
    since_ts: Optional[str] = Query(None, description="ISO timestamp để chỉ lấy starred cards mới hơn"),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.group_sync(db, group_id, user_id, since_ts)


@router.get(
    "/{group_id}/vault",
    summary="Kho lưu trữ nhóm — Các địa điểm đã thích",
    description="Trả về toàn bộ quán đã được ít nhất 1 người LIKED/STARRED trong phòng.",
)
async def group_vault(
    group_id: int,
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("votes", regex="^(votes|recent)$"),
    db: AsyncSession = Depends(get_db)
):
    return await service.group_vault(db, group_id, limit, sort_by)


@router.post(
    "/{group_id}/finish",
    summary="Chốt danh sách — Kết thúc phiên khám phá",
    description="Chỉ Host mới gọi được. Chạy Minimax lần cuối, trả Top N kết quả chung cuộc.",
)
async def group_finish(
    group_id: int,
    body: FinishRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.group_finish(db, group_id, user_id, body.top_n)


@router.post(
    "/{group_id}/undo",
    summary="Hoàn tác — Rollback thẻ vừa quẹt",
    description="Đảo ngược phép tính vector, rút phiếu Vote nếu có.",
)
async def group_undo(
    group_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.group_undo(db, group_id, user_id)
