# Social Schema

[← Back to Index](README.md)

## Table `friendships`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `friend_id` | `int4` |  |
| `status` | `varchar` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `groups`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `name` | `varchar` |  |
| `status` | `varchar` |  |
| `created_at` | `timestamptz` |  Nullable |
| `route_description` | `varchar` |  Nullable |
| `scheduled_time` | `timestamptz` |  Nullable |
| `max_spots` | `int4` |  Nullable |
| `cover_image_url` | `varchar` |  Nullable |
| `accent_color` | `varchar` |  Nullable |
| `is_public` | `bool` |  |
| `invite_code` | `varchar` |  Nullable Unique |

## Table `group_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `group_id` | `int4` |  |
| `user_id` | `int4` |  |
| `compromise_score` | `float8` |  Nullable |
| `joined_at` | `timestamptz` |  Nullable |
| `is_ready` | `bool` |  Nullable |
| `is_host` | `bool` |  Nullable |
| `session_vector` | `vector` |  Nullable |

## Table `chat_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `sender_id` | `int4` |  |
| `receiver_id` | `int4` |  |
| `text` | `text` |  Nullable |
| `is_read` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `content_type` | `varchar` |  |
| `media_url` | `varchar` |  Nullable |
| `media_meta` | `jsonb` |  |
| `reply_to_id` | `int4` |  Nullable |
| `is_edited` | `bool` |  |
| `is_deleted` | `bool` |  |

## Table `group_chat_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `group_id` | `int4` |  |
| `user_id` | `int4` |  |
| `content` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `content_type` | `varchar` |  |
| `media_url` | `varchar` |  Nullable |
| `media_meta` | `json` |  |


## Table `message_reactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `message_id` | `int4` |  |
| `user_id` | `int4` |  |
| `emoji` | `varchar` |  |
| `created_at` | `timestamptz` |  |


## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `type` | `varchar` |  |
| `title` | `varchar` |  |
| `body` | `text` |  Nullable |
| `is_read` | `bool` |  Nullable |
| `reference_type` | `varchar` |  Nullable |
| `reference_id` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
