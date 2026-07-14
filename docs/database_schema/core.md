# Core Schema

[← Back to Index](README.md)

## Table `alembic_version`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `version_num` | `varchar` | Primary |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `username` | `varchar` |  |
| `email` | `varchar` |  |
| `food_vector` | `vector` |  |
| `place_vector` | `vector` |  |
| `level` | `int4` |  Nullable |
| `password_hash` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `display_name` | `varchar` |  Nullable |
| `avatar_url` | `varchar` |  Nullable |
| `bio` | `text` |  Nullable |
| `cover_url` | `varchar` |  Nullable |
| `location` | `varchar` |  Nullable |
| `title` | `varchar` |  Nullable |
| `phone` | `varchar` |  Nullable |
| `settings` | `jsonb` |  Nullable |
| `supabase_uid` | `varchar` |  Nullable |
| `role` | `varchar` |  |
| `next_level_xp` | `int4` |  Nullable |
| `total_xp_earned` | `int4` |  Nullable |
| `membership_tier` | `varchar` |  Default `'bite'` |
| `equipped_frame_id` | `int4` |  Nullable |

> `membership_tier` and `equipped_frame_id` are part of the Membership system — see [`monetization.md`](./monetization.md) for the full tier/frame/payment schema and tier-resolution rules.
