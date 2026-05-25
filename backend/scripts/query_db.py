import asyncio
import sys
import os
from sqlalchemy import text

# Đưa thư mục 'backend' vào sys.path để Python có thể import namespace 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import các models & session từ core
from src.db.database import AsyncSessionLocal

def print_table(rows):
    if not rows:
        print("(0 rows returned)")
        return
    
    # Lấy danh sách tên cột
    keys = list(rows[0].keys())
    
    # Tính toán chiều rộng của từng cột để căn chỉnh sao cho đẹp
    widths = {k: len(str(k)) for k in keys}
    for row in rows:
        for k in keys:
            # Xử lý trường hợp dữ liệu có thể là list hoặc dict chứa giá trị None
            val_str = str(row[k]) if row[k] is not None else "NULL"
            widths[k] = max(widths[k], len(val_str))
    
    # Tạo format string với padding
    fmt = " | ".join(f"{{:<{widths[k]}}}" for k in keys)
    
    # In Header
    header_str = fmt.format(*keys)
    print("\n" + header_str)
    print("-" * len(header_str))
    
    # In từng dòng dữ liệu
    for row in rows:
        print(fmt.format(*(str(row[k]) if row[k] is not None else "NULL" for k in keys)))
    
    print(f"\n({len(rows)} rows returned)\n")


async def run_sql_cli():
    print("==================================================")
    print("      PostgreSQL - Raw SQL Interactive Shell      ")
    print("==================================================")
    print("Nhập lệnh SQL của bạn. Ví dụ: ")
    print(" -> SELECT * FROM users LIMIT 5;")
    print(" -> SELECT id, name FROM locations WHERE id = 1;")
    print("Gõ 'exit' hoặc 'quit' để thoát.\n")
    
    async with AsyncSessionLocal() as session:
        while True:
            try:
                # Nhận query từ người dùng
                query = input("SQL> ").strip()
                
                if not query:
                    continue
                if query.lower() in ('exit', 'quit', '\\q'):
                    print("Tạm biệt!")
                    break
                
                stmt = text(query)
                
                try:
                    result = await session.execute(stmt)
                    
                    if result.returns_rows:
                        rows = result.mappings().all()
                        print_table(rows)
                    else:
                        await session.commit()
                        print("Thành công (Không có dữ liệu trả về)\n")
                        
                except Exception as db_err:
                    await session.rollback()
                    print(f"Lỗi truy vấn SQL: {db_err}\n")
                    
            except KeyboardInterrupt:
                print("\nĐã tắt shell tương tác.")
                break
            except Exception as e:
                print(f"Lỗi hệ thống ngoài dự kiến: {e}\n")

if __name__ == "__main__":
    # Để tránh việc Windows in exception "Event loop is closed" khi exit
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    try:
        asyncio.run(run_sql_cli())
    except KeyboardInterrupt:
        pass
