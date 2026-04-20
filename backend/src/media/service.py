"""
Media Service — File upload handler.
Saves files to Supabase Storage and returns the public URL.
"""
import os
import uuid
from fastapi import UploadFile, HTTPException
from supabase import create_client, Client

from src.core.config import settings

# Initialize Supabase Client
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

# Only create client if URL and KEY are present
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET_NAME = "tastemap-media"

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm"}
ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/x-wav",
    "audio/mp3",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/aac",
}
MAX_IMAGE_SIZE_MB = 10
MAX_VIDEO_SIZE_MB = 100
MAX_CHAT_MEDIA_MB = 25  # Images, voice, video messages


CONTENT_TYPE_EXTENSION_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/mp4": "mp4",
    "audio/x-m4a": "m4a",
    "audio/aac": "aac",
}


def normalize_content_type(content_type: str) -> str:
    return content_type.split(";", 1)[0].strip().lower()


async def upload_file(file: UploadFile, upload_type: str, base_url: str) -> dict:
    if not supabase:
        raise HTTPException(
            status_code=500, detail="Supabase client not initialized. Check configuration."
        )

    raw_content_type = file.content_type or ""
    content_type = normalize_content_type(raw_content_type)

    if upload_type in ("avatar", "cover", "post"):
        allowed = ALLOWED_IMAGE_TYPES
        max_mb = MAX_IMAGE_SIZE_MB
    elif upload_type == "reel":
        allowed = ALLOWED_VIDEO_TYPES
        max_mb = MAX_VIDEO_SIZE_MB
    elif upload_type == "chat":
        # Chat supports images, audio (voice), and short videos
        allowed = ALLOWED_IMAGE_TYPES | ALLOWED_AUDIO_TYPES | ALLOWED_VIDEO_TYPES
        max_mb = MAX_CHAT_MEDIA_MB
    else:
        raise HTTPException(
            status_code=400, detail="type phải là 'avatar', 'cover', 'post', 'reel', hoặc 'chat'"
        )

    if content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{raw_content_type or content_type}' không được phép cho '{upload_type}'",
        )

    contents = await file.read()
    size_bytes = len(contents)

    if size_bytes > max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail=f"File quá lớn. Tối đa {max_mb}MB cho '{upload_type}'"
        )

    ext = CONTENT_TYPE_EXTENSION_MAP.get(content_type, content_type.split("/")[-1])
    filename = f"{upload_type}_{uuid.uuid4().hex}.{ext}"
    
    # Path in bucket: e.g., reels/reel_123.mp4, chat/chat_123.webm
    if upload_type == "reel":
        folder = "reels"
    elif upload_type == "chat":
        folder = "chat"
    else:
        folder = upload_type
    file_path = f"{folder}/{filename}"

    try:
        # Uploading to Supabase
        res = supabase.storage.from_(BUCKET_NAME).upload(
            file_path, 
            contents,
            file_options={"content-type": content_type}
        )
        
        # Get public url securely
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi upload lên Supabase: {str(e)}")

    return {"url": public_url, "file_type": content_type, "size_bytes": size_bytes}
