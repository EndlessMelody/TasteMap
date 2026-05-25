from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.social import service
from src.social.schemas import FriendRequest
from src.core.dependencies import get_current_user_id

router = APIRouter()


@router.get("/", summary="Danh sách bạn bè")
async def list_friends(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_friends(db, user_id)


@router.post("/request", summary="Gửi lời mời kết bạn")
async def send_request(body: FriendRequest, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.send_request(db, user_id, body.friend_id)


@router.patch("/{friendship_id}/accept", summary="Chấp nhận lời mời")
async def accept(friendship_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.accept_request(db, friendship_id, user_id)


@router.patch("/{friendship_id}/block", summary="Block")
async def block(friendship_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.block_friend(db, friendship_id, user_id)


@router.delete("/{friendship_id}", summary="Hủy kết bạn / hủy lời mời")
async def delete(friendship_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.delete_friendship(db, friendship_id, user_id)


@router.get("/requests", summary="Lời mời kết bạn đang chờ")
async def pending_requests(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_pending_requests(db, user_id)


@router.get("/foodies", summary="Friends list with taste match scores")
async def list_foodies(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_friends_foodies(db, user_id)


@router.get("/sent", summary="Outgoing pending friend requests")
async def sent_requests(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_sent_requests(db, user_id)


@router.get("/discover", summary="Discover foodies with high taste match (not yet friends)")
async def discover_foodies(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_discover_foodies(db, user_id)
