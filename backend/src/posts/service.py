"""Posts Service — Foodie Feed CRUD + Like toggle."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional

from src.posts.models import Post, PostLike, Comment
from src.users.models import User
from src.locations.models import Location
from src.posts.schemas import PostCreate, CommentCreate
from src.challenges import service as challenges_service


async def create_post(db: AsyncSession, user_id: int, data: PostCreate) -> dict:
    post = Post(user_id=user_id, **data.model_dump())
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    # Challenge Tracking Hook
    await challenges_service.track_user_action(
        db=db,
        user_id=user_id,
        action_type="post_create",
        ref_type="post",
        ref_id=post.id,
        metadata={
            "has_photo": bool(post.image_url),
            "has_rating": post.rating is not None,
            "rating": post.rating,
            "tags": post.tags or []
        }
    )
    
    return post 


from sqlalchemy.orm import selectinload

async def list_posts(
    db: AsyncSession,
    viewer_id: Optional[int],
    location_id: Optional[int],
    user_id_filter: Optional[int],
    limit: int,
    offset: int,
) -> dict:
    q = select(Post)
    if location_id:
        q = q.where(Post.location_id == location_id)
    if user_id_filter:
        q = q.where(Post.user_id == user_id_filter)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar_one() or 0

    # Eager load relationships to avoid N+1
    q = q.options(selectinload(Post.user), selectinload(Post.location))
    q = q.order_by(Post.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    posts = result.scalars().all()

    # Batch fetch likes
    liked_post_ids = set()
    if viewer_id and posts:
        post_ids = [p.id for p in posts]
        likes_result = await db.execute(
            select(PostLike.post_id)
            .where(PostLike.user_id == viewer_id, PostLike.post_id.in_(post_ids))
        )
        liked_post_ids = {row[0] for row in likes_result.all()}

    items = []
    for p in posts:
        location_data = None
        if p.location:
            location_data = {"id": p.location.id, "name": p.location.name}

        user_data = None
        if p.user:
            user_data = {"id": p.user.id, "display_name": p.user.display_name, "avatar_url": p.user.avatar_url}

        items.append({
            "id": p.id,
            "user": user_data,
            "location": location_data,
            "review": p.review,
            "rating": p.rating,
            "image_url": p.image_url,
            "tags": p.tags,
            "likes_count": p.likes_count,
            "comments_count": p.comments_count,
            "is_liked": p.id in liked_post_ids,
            "created_at": p.created_at,
        })

    return {"items": items, "total": total}


async def get_post(db: AsyncSession, post_id: int, viewer_id: Optional[int]) -> dict:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post không tồn tại")
    return await _post_to_dict(db, post, viewer_id)


async def delete_post(db: AsyncSession, post_id: int, user_id: int):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post không tồn tại")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Không có quyền xóa post này")
    await db.delete(post)
    await db.commit()
    return {"status": "deleted"}


from sqlalchemy import update

async def toggle_like(db: AsyncSession, post_id: int, user_id: int) -> dict:
    # Bắt đầu transaction
    result = await db.execute(select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user_id))
    like = result.scalars().first()
    
    post_q = await db.execute(select(Post.id).where(Post.id == post_id))
    post = post_q.first()
    if not post:
        raise HTTPException(status_code=404, detail="Post không tồn tại")

    if like:
        await db.delete(like)
        # Atomic update để tránh race condition
        update_stmt = update(Post).where(Post.id == post_id).values(
            likes_count=func.greatest(0, Post.likes_count - 1)
        ).returning(Post.likes_count)
        result = await db.execute(update_stmt)
        new_count = result.scalar_one()
        liked = False
    else:
        db.add(PostLike(post_id=post_id, user_id=user_id))
        # Atomic update
        update_stmt = update(Post).where(Post.id == post_id).values(
            likes_count=Post.likes_count + 1
        ).returning(Post.likes_count)
        result = await db.execute(update_stmt)
        new_count = result.scalar_one()
        liked = True
        
    await db.commit()
    return {"liked": liked, "likes_count": new_count}


async def list_comments(db: AsyncSession, post_id: int, limit: int, offset: int) -> dict:
    q = select(Comment).where(Comment.post_id == post_id)
    count_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_r.scalar_one() or 0
    q = q.order_by(Comment.created_at.asc()).offset(offset).limit(limit)
    result = await db.execute(q)
    comments = result.scalars().all()
    return {"items": [await _comment_to_dict(db, c) for c in comments], "total": total}


async def list_reel_comments(db: AsyncSession, reel_id: int, limit: int, offset: int) -> dict:
    q = select(Comment).where(Comment.reel_id == reel_id)
    count_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_r.scalar_one() or 0
    q = q.order_by(Comment.created_at.asc()).offset(offset).limit(limit)
    result = await db.execute(q)
    comments = result.scalars().all()
    return {"items": [await _comment_to_dict(db, c) for c in comments], "total": total}


async def add_comment(db: AsyncSession, user_id: int, data: CommentCreate, post_id: Optional[int] = None, reel_id: Optional[int] = None) -> dict:
    comment = Comment(user_id=user_id, content=data.content, post_id=post_id, reel_id=reel_id)
    db.add(comment)

    # Atomic update denormalized counter
    if post_id:
        update_stmt = update(Post).where(Post.id == post_id).values(comments_count=Post.comments_count + 1)
        await db.execute(update_stmt)

    if reel_id:
        from src.reels.models import Reel
        update_stmt = update(Reel).where(Reel.id == reel_id).values(comments_count=Reel.comments_count + 1)
        await db.execute(update_stmt)

    await db.commit()
    await db.refresh(comment)
    return await _comment_to_dict(db, comment)


async def delete_comment(db: AsyncSession, comment_id: int, user_id: int):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment không tồn tại")
    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Không có quyền xóa comment này")
        
    post_id = comment.post_id
    reel_id = comment.reel_id

    await db.delete(comment)
    
    # Atomic decrement
    if post_id:
        update_stmt = update(Post).where(Post.id == post_id).values(comments_count=func.greatest(0, Post.comments_count - 1))
        await db.execute(update_stmt)
        
    if reel_id:
        from src.reels.models import Reel
        update_stmt = update(Reel).where(Reel.id == reel_id).values(comments_count=func.greatest(0, Reel.comments_count - 1))
        await db.execute(update_stmt)

    await db.commit()
    return {"status": "deleted"}


async def _post_to_dict(db: AsyncSession, post: Post, viewer_id: Optional[int]) -> dict:
    user_q = await db.execute(select(User).where(User.id == post.user_id))
    user = user_q.scalars().first()
    loc = None
    if post.location_id:
        loc_q = await db.execute(select(Location).where(Location.id == post.location_id))
        loc = loc_q.scalars().first()

    is_liked = False
    if viewer_id:
        like_q = await db.execute(select(PostLike).where(PostLike.post_id == post.id, PostLike.user_id == viewer_id))
        is_liked = like_q.scalars().first() is not None

    return {
        "id": post.id,
        "user": {"id": user.id, "display_name": user.display_name, "avatar_url": user.avatar_url} if user else None,
        "location": {"id": loc.id, "name": loc.name} if loc else None,
        "review": post.review,
        "rating": post.rating,
        "image_url": post.image_url,
        "tags": post.tags,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "is_liked": is_liked,
        "created_at": post.created_at,
    }


async def _comment_to_dict(db: AsyncSession, comment: Comment) -> dict:
    user_q = await db.execute(select(User).where(User.id == comment.user_id))
    user = user_q.scalars().first()
    return {
        "id": comment.id,
        "user": {"id": user.id, "display_name": user.display_name, "avatar_url": user.avatar_url} if user else None,
        "content": comment.content,
        "created_at": comment.created_at,
    }
