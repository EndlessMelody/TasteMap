from supabase import create_client, Client
from src.core.config import settings

# Initialize Supabase client
# Priority: SERVICE_ROLE_KEY (bypasses RLS) > ANON_KEY
supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

supabase_storage: Client = create_client(
    settings.SUPABASE_URL, 
    supabase_key
)
