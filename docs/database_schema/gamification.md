# Database Schema Design

[← Back to Index](README.md)

## Table `badges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `name` | `varchar` |  |
| `icon_name` | `varchar` |  |
| `rarity` | `varchar` |  |
| `accent_color` | `varchar` |  |
| `is_hidden` | `bool` |  |

## Table `challenge_progress_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `challenge_id` | `int4` |  |
| `action_type` | `varchar` |  |
| `action_ref_id` | `int4` |  Nullable |
| `action_ref_type` | `varchar` |  Nullable |
| `delta` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `challenges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `title` | `varchar` |  |
| `description` | `text` |  |
| `category` | `varchar` |  |
| `difficulty` | `varchar` |  |
| `xp_reward` | `int4` |  |
| `badge_id` | `int4` |  Nullable |
| `target_count` | `int4` |  |
| `action_type` | `varchar` |  |
| `action_filter` | `json` |  Nullable |
| `icon` | `varchar` |  |
| `accent_color` | `varchar` |  |
| `duration_days` | `int4` |  Nullable |
| `start_date` | `timestamptz` |  Nullable |
| `end_date` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |
| `is_recurring` | `bool` |  |
| `sort_order` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |


## Table `level_configs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `level` | `int4` | Primary |
| `xp_required` | `int4` |  |
| `title` | `varchar` |  Nullable |
| `icon_url` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `user_badges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `badge_id` | `int4` |  |
| `earned_at` | `timestamptz` |  Nullable |

## Table `user_challenges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `challenge_id` | `int4` |  |
| `progress` | `int4` |  |
| `status` | `varchar` |  |
| `started_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `claimed_at` | `timestamptz` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `last_progress_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `user_streaks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `current_streak` | `int4` |  |
| `longest_streak` | `int4` |  |
| `last_active_date` | `timestamptz` |  |
| `streak_start_date` | `timestamptz` |  Nullable |
| `timezone_offset` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `xp_transactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `amount` | `int4` |  |
| `source_type` | `varchar` |  |
| `source_id` | `int4` |  Nullable |
| `description` | `varchar` |  Nullable |
| `balance_after` | `int4` |  |
| `level_after` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

