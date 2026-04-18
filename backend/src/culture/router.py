"""
Culture Router — Culinary Culture Guide API endpoints.
"""

import base64

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.database import get_db
from src.core.dependencies import get_current_user_id
from src.users.models import User
from src.culture.schemas import CultureQuery, CultureStoryResponse, CultureStorySection
from src.culture.service import identify_food_from_image, generate_culture_story, parse_food_vector

router = APIRouter()


@router.post("/story", response_model=CultureStoryResponse)
async def get_culture_story_by_name(
    query: CultureQuery,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Generate a cultural story for a food item by name."""
    user = await db.get(User, user_id)
    taste_profile = parse_food_vector(user.food_vector) if user else None

    result = await generate_culture_story(
        food_name=query.food_name,
        language=query.language,
        user_taste_profile=taste_profile,
    )

    return _to_response(result, identified_from_image=False)


@router.post("/identify", response_model=CultureStoryResponse)
async def identify_and_story(
    image_url: str | None = None,
    language: str = "vi",
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Identify food from an image URL and generate its cultural story."""
    if not image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    user = await db.get(User, user_id)
    taste_profile = parse_food_vector(user.food_vector) if user else None

    # Step 1: Identify the food
    identification = await identify_food_from_image(
        image_url=image_url,
        language=language,
    )

    food_name = identification.get("food_name", "Unknown")
    if food_name == "Unknown":
        raise HTTPException(
            status_code=422,
            detail="Could not identify the dish from the image. Try a clearer photo or use text search.",
        )

    # Step 2: Generate the story
    result = await generate_culture_story(
        food_name=food_name,
        food_name_local=identification.get("food_name_local"),
        language=language,
        user_taste_profile=taste_profile,
    )

    response = _to_response(result, identified_from_image=True)
    response.confidence = identification.get("confidence")
    response.image_url = image_url
    return response


@router.post("/identify-upload", response_model=CultureStoryResponse)
async def identify_from_upload(
    file: UploadFile = File(...),
    language: str = "vi",
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Identify food from an uploaded image file and generate its cultural story."""
    contents = await file.read()
    image_b64 = base64.b64encode(contents).decode("utf-8")

    user = await db.get(User, user_id)
    taste_profile = parse_food_vector(user.food_vector) if user else None

    # Step 1: Identify
    identification = await identify_food_from_image(
        image_base64=image_b64,
        language=language,
    )

    food_name = identification.get("food_name", "Unknown")
    if food_name == "Unknown":
        raise HTTPException(
            status_code=422,
            detail="Could not identify the dish from the image. Try a clearer photo or use text search.",
        )

    # Step 2: Story
    result = await generate_culture_story(
        food_name=food_name,
        food_name_local=identification.get("food_name_local"),
        language=language,
        user_taste_profile=taste_profile,
    )

    response = _to_response(result, identified_from_image=True)
    response.confidence = identification.get("confidence")
    return response


def _to_response(result: dict, identified_from_image: bool = False) -> CultureStoryResponse:
    """Convert raw Groq result dict to CultureStoryResponse."""
    sections = []
    for s in result.get("sections", []):
        sections.append(CultureStorySection(
            title=s.get("title", ""),
            content=s.get("content", ""),
            icon=s.get("icon"),
        ))

    return CultureStoryResponse(
        food_name=result.get("food_name", ""),
        food_name_local=result.get("food_name_local"),
        identified_from_image=identified_from_image,
        sections=sections,
        taste_tags=result.get("taste_tags", []),
        pairing_suggestions=result.get("pairing_suggestions", []),
        when_to_eat=result.get("when_to_eat"),
        fun_fact=result.get("fun_fact"),
    )
