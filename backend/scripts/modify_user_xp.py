import asyncio
import os
import sys
import argparse

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal
from src.challenges.xp_service import award_xp

async def modify_xp(user_id: int, amount: int):
    async with AsyncSessionLocal() as db:
        print(f"--- Modifying XP for User ID: {user_id} ---")
        try:
            result = await award_xp(
                db=db,
                user_id=user_id,
                amount=amount,
                source_type="admin_modifier",
                description="Manually adjusted via script"
            )
            
            print(f"Success!")
            print(f"  Added: {result['amount']} XP")
            print(f"  New Total: {result['new_total']} XP")
            print(f"  New Level: {result['new_level']}")
            if result['leveled_up']:
                print(f"  *** LEVEL UP! ***")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Modify user XP and sync levels.")
    parser.add_argument("--id", type=int, required=True, help="User ID")
    parser.add_argument("--xp", type=int, required=True, help="Amount of XP to add (can be negative if logic supports it, though award_xp checks > 0)")
    
    args = parser.parse_args()
    
    asyncio.run(modify_xp(args.id, args.xp))
