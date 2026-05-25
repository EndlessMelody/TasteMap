-- Database optimizations for locations table
-- Run this in Supabase SQL Editor

-- Index for category filtering (used by feed API)
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category);

-- Composite index for category + id (used by cursor pagination)
CREATE INDEX IF NOT EXISTS idx_locations_category_id ON locations(category, id);

-- Index for coordinates (used by map/location-based queries)
CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON locations(lat, lng);

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'locations';
