"""Posts Service — Foodie Feed CRUD + Like toggle."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update
from sqlalchemy.orm import selectinload
from typing import Optional

from src.posts.models import Post, PostLike, Comment
from src.users.models import User
from src.locations.models import Location
from src.bookmarks.models import Bookmark
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
    q = q.options(
        selectinload(Post.user).selectinload(User.primary_badge),
        selectinload(Post.location)
    )
    q = q.order_by(Post.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    posts = result.scalars().all()

    # Batch fetch likes
    liked_post_ids = set()
    bookmarked_post_ids = set()
    if viewer_id and posts:
        post_ids = [p.id for p in posts]
        likes_result = await db.execute(
            select(PostLike.post_id)
            .where(PostLike.user_id == viewer_id, PostLike.post_id.in_(post_ids))
        )
        liked_post_ids = {row[0] for row in likes_result.all()}
        bookmarks_result = await db.execute(
            select(Bookmark.post_id)
            .where(Bookmark.user_id == viewer_id, Bookmark.post_id.in_(post_ids))
        )
        bookmarked_post_ids = {row[0] for row in bookmarks_result.all() if row[0] is not None}

    items = []
    for p in posts:
        items.append({
            "id": p.id,
            "user": {
                "id": p.user.id,
                "display_name": p.user.display_name,
                "avatar_url": p.user.avatar_url,
                "primary_badge": p.user.primary_badge
            } if p.user else None,
            "location": {
                "id": p.location.id,
                "name": p.location.name,
                "address": p.location.address
            } if p.location else None,
            "review": p.review,
            "rating": p.rating,
            "image_url": p.image_url,
            "tags": p.tags,
            "likes_count": p.likes_count,
            "comments_count": p.comments_count,
            "is_liked": p.id in liked_post_ids,
            "is_bookmarked": p.id in bookmarked_post_ids,
            "created_at": p.created_at,
        })

    return {"items": items, "total": total}


async def get_post(db: AsyncSession, post_id: int, viewer_id: Optional[int]) -> dict:
    result = await db.execute(
        select(Post)
        .options(
            selectinload(Post.user).selectinload(User.primary_badge),
            selectinload(Post.location)
        )
        .where(Post.id == post_id)
    )
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


async def toggle_like(db: AsyncSession, post_id: int, user_id: int) -> dict:
    result = await db.execute(select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user_id))
    like = result.scalars().first()
    
    post_q = await db.execute(select(Post.id).where(Post.id == post_id))
    post = post_q.first()
    if not post:
        raise HTTPException(status_code=404, detail="Post không tồn tại")

    if like:
        await db.delete(like)
        update_stmt = update(Post).where(Post.id == post_id).values(
            likes_count=func.greatest(0, Post.likes_count - 1)
        ).returning(Post.likes_count)
        result = await db.execute(update_stmt)
        new_count = result.scalar_one()
        liked = False
    else:
        db.add(PostLike(post_id=post_id, user_id=user_id))
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
    return await _build_comment_tree(db, comments, total)


async def list_reel_comments(db: AsyncSession, reel_id: int, limit: int, offset: int) -> dict:
    q = select(Comment).where(Comment.reel_id == reel_id)
    count_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_r.scalar_one() or 0
    q = q.order_by(Comment.created_at.asc()).offset(offset).limit(limit)
    result = await db.execute(q)
    comments = result.scalars().all()
    return await _build_comment_tree(db, comments, total)


async def add_comment(db: AsyncSession, user_id: int, data: CommentCreate, post_id: Optional[int] = None, reel_id: Optional[int] = None) -> dict:
    parent_id = data.parent_id
    if parent_id:
        parent_q = await db.execute(select(Comment).where(Comment.id == parent_id))
        parent = parent_q.scalars().first()
        if not parent:
            raise HTTPException(status_code=404, detail="Comment không tồn tại")
        if post_id and parent.post_id != post_id:
            raise HTTPException(status_code=400, detail="Reply không thuộc post này")
        if reel_id and parent.reel_id != reel_id:
            raise HTTPException(status_code=400, detail="Reply không thuộc reel này")
        if parent.parent_id is not None:
            parent_id = parent.parent_id

    comment = Comment(
        user_id=user_id,
        content=data.content,
        post_id=post_id,
        reel_id=reel_id,
        parent_id=parent_id,
    )
    db.add(comment)

    if post_id:
        update_stmt = update(Post).where(Post.id == post_id).values(comments_count=Post.comments_count + 1)
        await db.execute(update_stmt)

    if reel_id:
        from src.reels.models import Reel
        update_stmt = update(Reel).where(Reel.id == reel_id).values(comments_count=Reel.comments_count + 1)
        await db.execute(update_stmt)

    await db.commit()
    await db.refresh(comment)
    user_q = await db.execute(
        select(User).options(selectinload(User.primary_badge)).where(User.id == user_id)
    )
    user = user_q.scalars().first()
    return _comment_to_dict(comment, user)


async def delete_comment(db: AsyncSession, comment_id: int, user_id: int):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment không tồn tại")
    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Không có quyền xóa comment này")
        
    post_id = comment.post_id
    reel_id = comment.reel_id

    subtree_count_q = await db.execute(
        select(func.count(Comment.id)).where(
            (Comment.id == comment_id) | (Comment.parent_id == comment_id)
        )
    )
    subtree_count = subtree_count_q.scalar_one() or 1

    await db.delete(comment)
    
    if post_id:
        update_stmt = update(Post).where(Post.id == post_id).values(
            comments_count=func.greatest(0, Post.comments_count - subtree_count)
        )
        await db.execute(update_stmt)
        
    if reel_id:
        from src.reels.models import Reel
        update_stmt = update(Reel).where(Reel.id == reel_id).values(
            comments_count=func.greatest(0, Reel.comments_count - subtree_count)
        )
        await db.execute(update_stmt)

    await db.commit()
    return {"status": "deleted"}


async def _post_to_dict(db: AsyncSession, post: Post, viewer_id: Optional[int]) -> dict:
    is_liked = False
    is_bookmarked = False
    if viewer_id:
        like_q = await db.execute(select(PostLike).where(PostLike.post_id == post.id, PostLike.user_id == viewer_id))
        is_liked = like_q.scalars().first() is not None
        bookmark_q = await db.execute(
            select(Bookmark).where(Bookmark.post_id == post.id, Bookmark.user_id == viewer_id)
        )
        is_bookmarked = bookmark_q.scalars().first() is not None

    return {
        "id": post.id,
        "user": {
            "id": post.user.id,
            "display_name": post.user.display_name,
            "avatar_url": post.user.avatar_url,
            "primary_badge": post.user.primary_badge
        } if post.user else None,
        "location": {
            "id": post.location.id,
            "name": post.location.name,
            "address": post.location.address
        } if post.location else None,
        "review": post.review,
        "rating": post.rating,
        "image_url": post.image_url,
        "tags": post.tags,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "is_liked": is_liked,
        "is_bookmarked": is_bookmarked,
        "created_at": post.created_at,
    }


async def _build_comment_tree(db: AsyncSession, comments: list[Comment], total: int) -> dict:
    user_ids = {comment.user_id for comment in comments}
    users_by_id: dict[int, User] = {}
    if user_ids:
        user_q = await db.execute(
            select(User)
            .options(selectinload(User.primary_badge))
            .where(User.id.in_(user_ids))
        )
        users_by_id = {user.id: user for user in user_q.scalars().all()}

    comment_map = {
        comment.id: _comment_to_dict(comment, users_by_id.get(comment.user_id))
        for comment in comments
    }
    root_items: list[dict] = []

    for comment in comments:
        item = comment_map[comment.id]
        if comment.parent_id and comment.parent_id in comment_map:
            comment_map[comment.parent_id]["replies"].append(item)
        else:
            root_items.append(item)

    return {"items": root_items, "total": total}


def _comment_to_dict(comment: Comment, user: Optional[User]) -> dict:
    return {
        "id": comment.id,
        "user": {
            "id": user.id,
            "display_name": user.display_name,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "title": user.title,
            "level": user.level,
            "primary_badge": user.primary_badge
        } if user else None,
        "content": comment.content,
        "parent_id": comment.parent_id,
        "created_at": comment.created_at,
        "replies": [],
    }
