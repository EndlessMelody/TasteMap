# Interactions Schema

[← Back to Index](README.md)

## Table `interactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `location_id` | `int4` |  |
| `action` | `varchar` |  |
| `context_at_time` | `jsonb` |  Nullable |
| `timestamp` | `timestamptz` |  |
| `group_id` | `int4` |  Nullable |

## Table `bookmarks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `location_id` | `int4` |  |
| `xp_earned` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
