from supabase import create_client, Client
from src.core.config import settings

# Initialize Supabase client
supabase_storage: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_ANON_KEY
)
