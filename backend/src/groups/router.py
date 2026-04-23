from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.groups import service
from src.groups.schemas import (
    GroupCreate, ReadyUpdate,
    GroupRecommendRequest,
    FinishRequest,
    JoinByCodeRequest,
    ChatMessageCreate,
)
from src.core.dependencies import get_current_user_id
from src.groups.websocket import voice_manager, validate_ws_token
from typing import Optional

router = APIRouter()
import json


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
    public_only: bool = Query(True, description="Only return public rooms"),
    db: AsyncSession = Depends(get_db)
):
    return {"items": await service.list_groups(db, status, limit, public_only)}


@router.post("/join-by-code", summary="Join a private room using invite code", status_code=200)
async def join_by_code(
    body: JoinByCodeRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.join_by_code(db, body.invite_code, user_id)


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


@router.delete("/{group_id}", summary="Xóa lobby (chỉ chủ phòng)")
async def delete_group(
    group_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.delete_group(db, group_id, user_id)


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
    sort_by: str = Query("votes", pattern="^(votes|recent)$"),
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


@router.get("/{group_id}/messages", summary="Lấy tin nhắn chat", description="Lấy lịch sử tin nhắn trong phòng lobby")
async def get_group_messages(
    group_id: int,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return await service.get_group_messages(db, group_id, limit)


@router.post("/{group_id}/messages", summary="Gửi tin nhắn chat", description="Gửi tin nhắn vào phòng lobby")
async def create_group_message(
    group_id: int,
    body: ChatMessageCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.create_group_message(
        db, group_id, user_id, 
        content=body.content,
        content_type=body.content_type,
        media_url=body.media_url,
        media_meta=body.media_meta
    )


@router.websocket("/{group_id}/voice")
async def voice_websocket(
    websocket: WebSocket,
    group_id: int,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for voice chat signaling.
    
    Protocol:
    - Client -> Server: {type: "signal", payload: {...}}
    - Server -> Client: {type: "signal", payload: {...}}
    
    Signal types:
    - offer: WebRTC offer from one peer to another
    - answer: WebRTC answer
    - ice_candidate: ICE candidate for connection
    - mute_toggle: User muted/unmuted
    - speaking: User started/stopped speaking
    """
    # Accept first so close codes/reasons can be delivered to browser reliably.
    await websocket.accept()

    try:
        # Authenticate user
        user = await validate_ws_token(token, db)
        if not user:
            await websocket.send_json({
                "type": "voice_error",
                "payload": {
                    "code": "invalid_token",
                    "message": "Voice auth failed (invalid token)",
                },
            })
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        # Verify group membership
        is_member = await service.is_group_member(db, group_id, user.id)
        if not is_member:
            try:
                await service.join_group(db, group_id, user.id)
                is_member = True
            except HTTPException:
                is_member = False

            if not is_member:
                await websocket.send_json({
                    "type": "voice_error",
                    "payload": {
                        "code": "not_member",
                        "message": "You must join the room before voice chat",
                    },
                })
                await websocket.close(code=4002, reason="Not a group member")
                return
        
        # Join voice channel
        await voice_manager.join_voice(websocket, group_id, user.id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                msg_type = message.get("type")
                payload = message.get("payload", {})
                
                if msg_type == "signal":
                    target_user_id = payload.get("target_user_id")
                    signal_type = payload.get("signal_type")
                    
                    if target_user_id and signal_type:
                        await voice_manager.send_to_user(
                            group_id,
                            target_user_id,
                            {
                                "type": "signal",
                                "payload": {
                                    "from_user_id": user.id,
                                    "signal_type": signal_type,
                                    "data": payload.get("data")
                                }
                            }
                        )
                
                elif msg_type == "mute_toggle":
                    await voice_manager.broadcast_to_voice(
                        group_id,
                        {
                            "type": "mute_toggle",
                            "payload": {
                                "user_id": user.id,
                                "is_muted": payload.get("is_muted", False)
                            }
                        }
                    )
                
                elif msg_type == "speaking":
                    await voice_manager.broadcast_to_voice(
                        group_id,
                        {
                            "type": "speaking",
                            "payload": {
                                "user_id": user.id,
                                "is_speaking": payload.get("is_speaking", False)
                            }
                        },
                        exclude_user_id=user.id
                    )
                
        except WebSocketDisconnect:
            pass
        finally:
            voice_manager.leave_voice(group_id, user.id)
            await voice_manager.broadcast_to_voice(
                group_id,
                {
                    "type": "user_left_voice",
                    "payload": {"user_id": user.id}
                }
            )

    except Exception as e:
        import traceback
        print(f"Voice WebSocket FATAL CRASH: {e}\n{traceback.format_exc()}")
        try:
            await websocket.send_json({
                "type": "voice_error",
                "payload": {"code": "server_crash", "message": str(e)}
            })
            await websocket.close(code=4005, reason="Server crash")
        except:
            pass
