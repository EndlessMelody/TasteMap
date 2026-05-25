from sqlalchemy import create_engine, text

def main():
    try:
        engine = create_engine("postgresql://postgres:postgres@localhost:5432/tastemap")
        with engine.connect() as conn:
            res = conn.execute(text("SELECT email, supabase_uid FROM users")).fetchall()
            print("USERS:", res)
    except Exception as e:
        print("DB ERROR:", str(e))

if __name__ == "__main__":
    main()
