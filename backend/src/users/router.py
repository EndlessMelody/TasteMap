from fastapi import APIRouter, Depends, Request, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.users.schemas import UserCreate, UserResponse, UserProfile, UserMe, UserUpdate, TopSpotResponse
from src.users.service import UserService
from src.core.dependencies import get_current_user_id
from src.db.supabase_client import supabase_storage
from typing import List
import uuid

router = APIRouter()


def get_user_service(request: Request, db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db=db, redis=request.app.state.redis)

@router.post(
    "/",
    response_model=UserResponse,
    summary="Đăng ký người dùng mới",
    description="Tạo tài khoản. Nếu có device_id, vector từ Redis (guest) sẽ được migrate sang Postgres."
)
async def register_user(user_in: UserCreate, service: UserService = Depends(get_user_service)):
    return await service.create_user(user_in)


@router.get(
    "/me",
    response_model=UserMe,
    summary="Lấy thông tin cá nhân (bao gồm private fields)",
    description="Yêu cầu header X-User-ID."
)
async def get_me(
    user_id: int = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    return await service.get_me(user_id)


async def upload_image_to_supabase(file: UploadFile, folder: str, user_id: int) -> str:
    content = await file.read()
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    path_name = f"{folder}/{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    
    res = supabase_storage.storage.from_("profiles").upload(
        path=path_name, 
        file=content, 
        file_options={"content-type": file.content_type}
    )
    url = supabase_storage.storage.from_("profiles").get_public_url(path_name)
    return url

@router.patch(
    "/me",
    response_model=UserMe,
    summary="Cập nhật profile",
    description="Chỉ gửi fields cần thay đổi."
)
async def update_me(
    display_name: str | None = Form(None),
    username: str | None = Form(None),
    bio: str | None = Form(None),
    location: str | None = Form(None),
    phone: str | None = Form(None),
    avatar_file: UploadFile | None = File(None),
    cover_file: UploadFile | None = File(None),
    user_id: int = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    update_data = {}
    if display_name is not None: update_data["display_name"] = display_name
    if username is not None: update_data["username"] = username
    if bio is not None: update_data["bio"] = bio
    if location is not None: update_data["location"] = location
    if phone is not None: update_data["phone"] = phone
    
    if avatar_file is not None:
        avatar_url = await upload_image_to_supabase(avatar_file, "avatars", user_id)
        update_data["avatar_url"] = avatar_url
        
    if cover_file is not None:
        cover_url = await upload_image_to_supabase(cover_file, "covers", user_id)
        update_data["cover_url"] = cover_url

    body = UserUpdate(**update_data)
    return await service.update_me(user_id, body)


@router.get(
    "/{user_id}",
    response_model=UserProfile,
    summary="Lấy public profile người dùng"
)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    return await service.get_profile(user_id)


@router.get(
    "/{user_id}/top-spots",
    response_model=List[TopSpotResponse],
    summary="Top địa điểm yêu thích nhất của user"
)
async def get_top_spots(user_id: int, limit: int = 3, service: UserService = Depends(get_user_service)):
    return await service.get_top_spots(user_id, limit)
