[← Back to Index](README.md)


## Table `locations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `name` | `varchar` |  |
| `vector` | `vector` |  Nullable |
| `lat` | `float8` |  |
| `lng` | `float8` |  |
| `base_score` | `float8` |  Nullable |
| `category` | `varchar` |  Nullable |
| `image_url` | `varchar` |  Nullable |
| `address` | `varchar` |  Nullable |
| `city` | `varchar` |  Nullable |
| `characteristics` | `jsonb` |  Nullable |
| `price_range` | `varchar` |  Nullable |
| `open_hours` | `varchar` |  Nullable |
| `rating` | `float8` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `location_id` | `int4` |  Nullable |
| `review` | `text` |  |
| `rating` | `float8` |  Nullable |
| `image_url` | `varchar` |  Nullable |
| `tags` | `_varchar` |  Nullable |
| `likes_count` | `int4` |  Nullable |
| `comments_count` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `post_likes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `post_id` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `reels`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `title` | `varchar` |  |
| `video_url` | `varchar` |  Nullable |
| `thumbnail_url` | `varchar` |  Nullable |
| `views_count` | `int4` |  Nullable |
| `likes_count` | `int4` |  Nullable |
| `comments_count` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `reel_likes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `reel_id` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `post_id` | `int4` |  Nullable |
| `reel_id` | `int4` |  Nullable |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `deals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `location_id` | `int4` |  Nullable |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `discount_percent` | `int4` |  Nullable |
| `banner_image_url` | `varchar` |  Nullable |
| `xp_reward` | `int4` |  Nullable |
| `is_sponsored` | `bool` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `tours`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `int4` |  |
| `total_distance` | `float8` |  Nullable |
| `estimated_cost` | `int4` |  Nullable |
| `estimated_duration` | `int4` |  Nullable |
| `status` | `varchar` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `tour_stops`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `tour_id` | `int4` |  |
| `location_id` | `int4` |  |
| `stop_order` | `int4` |  |
| `added_at` | `timestamptz` |  Nullable |
