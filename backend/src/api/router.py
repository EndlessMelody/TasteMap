from fastapi import APIRouter

# ─── Core modules ─────────────────────────────────────────────
from src.users.router import router as users_router
from src.recommendations.router import router as recommendations_router
from src.sessions.router import router as sessions_router
from src.feed.router import router as feed_router
from src.interactions.router import router as interactions_router
# ─── Auth ────────────────────────────────────────────────────────────────
from src.auth.router import router as auth_router

# ─── Locations ───────────────────────────────────────────────────────────
from src.locations.router import router as locations_router

# ─── Groups / Lobbies ────────────────────────────────────────────────────
from src.groups.router import router as groups_router

# ─── Tours ───────────────────────────────────────────────────────────────
from src.tours.router import router as tours_router

# ─── Social content ──────────────────────────────────────────────────────
from src.posts.router import router as posts_router
from src.posts.router import comments_router
from src.reels.router import router as reels_router

# ─── User actions ────────────────────────────────────────────────────────
from src.bookmarks.router import router as bookmarks_router
from src.social.router import router as friends_router
from src.notifications.router import router as notifications_router

# ─── Deals & Gamification ────────────────────────────────────────────────
from src.deals.router import router as deals_router
from src.gamification.router import router as badges_router
from src.challenges.router import router as challenges_router

# ─── Settings ────────────────────────────────────────────────────────────
from src.users.settings_router import router as settings_router

# ─── Media ───────────────────────────────────────────────────────────────
from src.media.router import router as media_router

# ─── Messages ────────────────────────────────────────────────────────────────
from src.messages.router import router as messages_router

# ─── Culture Guide ────────────────────────────────────────────────────────
from src.culture.router import router as culture_router

# ─── Health ──────────────────────────────────────────────────────────────
from src.health.router import router as health_router

# ─── Router assembly ─────────────────────────────────────────────────────

api_router = APIRouter()

api_router.include_router(users_router,            prefix="/users",            tags=["users"])
api_router.include_router(health_router,           prefix="/health",           tags=["health"])
api_router.include_router(sessions_router,         prefix="/users",            tags=["sessions"])
api_router.include_router(feed_router,             prefix="/feed",             tags=["feed"])
api_router.include_router(interactions_router,     prefix="/interactions",     tags=["interactions"])
api_router.include_router(recommendations_router,  prefix="/recommendations",  tags=["recommendations"])
api_router.include_router(auth_router,             prefix="/auth",             tags=["auth"])
api_router.include_router(locations_router,        prefix="/locations",        tags=["locations"])
api_router.include_router(groups_router,           prefix="/groups",           tags=["groups"])
api_router.include_router(tours_router,            prefix="/tours",            tags=["tours"])
api_router.include_router(posts_router,            prefix="/posts",            tags=["posts"])
api_router.include_router(comments_router,         prefix="/comments",         tags=["comments"])
api_router.include_router(reels_router,            prefix="/reels",            tags=["reels"])
api_router.include_router(bookmarks_router,        prefix="/bookmarks",        tags=["bookmarks"])
api_router.include_router(friends_router,          prefix="/friends",          tags=["social"])
api_router.include_router(notifications_router,    prefix="/notifications",    tags=["notifications"])
api_router.include_router(deals_router,            prefix="/deals",            tags=["deals"])
api_router.include_router(badges_router,           prefix="/badges",           tags=["gamification"])
api_router.include_router(challenges_router,                                      tags=["challenges"])
api_router.include_router(settings_router,         prefix="/settings",         tags=["settings"])
api_router.include_router(media_router,            prefix="/media",            tags=["media"])
api_router.include_router(messages_router,         prefix="/messages",         tags=["messages"])
api_router.include_router(culture_router,          prefix="/culture",          tags=["culture"])
