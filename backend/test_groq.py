import asyncio
import os
import json
from src.culture.service import generate_culture_story

async def test_groq():
    print("Testing Groq API...")
    res = await generate_culture_story(food_name='Pho', language='en')
    print("Groq API Response:\n")
    print(json.dumps(res, indent=2))

asyncio.run(test_groq())
