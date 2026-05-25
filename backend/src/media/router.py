from fastapi import APIRouter, Depends, UploadFile, File, Query, Request
from src.media.service import upload_file

router = APIRouter()


@router.post(
    "/upload",
    summary="Upload ảnh, video, hoặc audio",
    description="Trả về URL để nhúng vào User/Post/Reel/Group/Chat. type: 'avatar'|'cover'|'post'|'reel'|'chat'"
)
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    upload_type: str = Query(..., alias="type"),
):
    base_url = str(request.base_url).rstrip("/")
    return await upload_file(file, upload_type, base_url)
