"""
Import locations_hcmc.csv vào Postgres (bảng public.locations)

Cài đặt:
    pip install pandas psycopg2-binary sqlalchemy tqdm

Chạy:
    python import_to_postgres.py
"""

import pandas as pd
import json
from sqlalchemy import create_engine, text
from tqdm import tqdm
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# CẤU HÌNH KẾT NỐI — SỬA LẠI CHO ĐÚNG
# ──────────────────────────────────────────────
DB_HOST     = "localhost"
DB_PORT     = 5432
DB_NAME     = "your_database"
DB_USER     = "your_user"
DB_PASSWORD = "your_password"

CSV_FILE    = "locations_hcmc.csv"
BATCH_SIZE  = 500   # insert bao nhiêu row 1 lần


def get_engine():
    url = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    return create_engine(url, pool_pre_ping=True)


def import_csv(csv_path: str, engine):
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    log.info(f"Loaded {len(df)} rows from {csv_path}")

    # Đảm bảo characteristics là valid JSON string hoặc None
    def fix_json(val):
        if pd.isna(val):
            return None
        try:
            json.loads(val)
            return val
        except Exception:
            return None

    df["characteristics"] = df["characteristics"].apply(fix_json)

    # Thay NaN → None
    df = df.where(pd.notna(df), None)

    insert_sql = text("""
        INSERT INTO public.locations
            (name, lat, lng, category, address, city,
             open_hours, price_range, rating, image_url,
             characteristics, base_score)
        VALUES
            (:name, :lat, :lng, :category, :address, :city,
             :open_hours, :price_range, :rating, :image_url,
             :characteristics::jsonb, :base_score)
        ON CONFLICT DO NOTHING
    """)

    rows = df.to_dict(orient="records")
    total = 0

    with engine.begin() as conn:
        for i in tqdm(range(0, len(rows), BATCH_SIZE), desc="Inserting"):
            batch = rows[i : i + BATCH_SIZE]
            conn.execute(insert_sql, batch)
            total += len(batch)

    log.info(f"✅ Inserted {total} rows vào public.locations")


def main():
    engine = get_engine()

    # Kiểm tra kết nối
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    log.info("✅ Kết nối Postgres thành công")

    import_csv(CSV_FILE, engine)


if __name__ == "__main__":
    main()
