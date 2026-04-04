from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from src.core.config import settings

# Supabase sử dụng pgBouncer ở transaction mode → không hỗ trợ server-side
# prepared statements. Tắt cache bằng connect_args để đảm bảo tương thích,
# phòng trường hợp URL không chứa sẵn tham số ?prepared_statement_cache_size=0.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ─── Import toàn bộ Models ở cuối file để Base đăng ký đầy đủ vào Registry ───
# Tránh lỗi InvalidRequestError khi SQLAlchemy mapper khởi tạo Class.
# THỨ TỰ QUAN TRỌNG: import bảng không có FK trước, bảng có FK sau.

# Tier 1 — Không phụ thuộc bảng nào
from src.users.models import User                          # noqa: F401
from src.locations.models import Location                  # noqa: F401

# Tier 2 — Phụ thuộc users / locations
from src.interactions.models import Interaction            # noqa: F401
from src.groups.models import Group, GroupMember           # noqa: F401
from src.social.models import Friendship                   # noqa: F401
from src.gamification.models import Badge, UserBadge       # noqa: F401

# Tier 3 — Social content (phụ thuộc users + locations)
from src.reels.models import Reel                          # noqa: F401
from src.posts.models import Post, PostLike, Comment       # noqa: F401  (Comment references Reel → Reel phải import trước)
from src.tours.models import Tour, TourStop                # noqa: F401
from src.bookmarks.models import Bookmark                  # noqa: F401
from src.notifications.models import Notification          # noqa: F401
from src.deals.models import Deal                          # noqa: F401
