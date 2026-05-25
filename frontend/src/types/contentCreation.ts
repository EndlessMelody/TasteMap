export type ComposerType = "post" | "reel";

export type PublishDestination = "foodie-feed" | "discover-reels";

export interface CreatePostPayload {
  review: string;
  rating: number | null;
  location_id: number | null;
  image_url: string | null;
  tags: string[] | null;
}

export interface CreateReelPayload {
  title: string;
  video_url: string;
  thumbnail_url: string | null;
}

interface CreatorStub {
  id: number;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface LocationStub {
  id: number;
  name: string;
}

export interface CreatedPostResponse {
  id: number;
  user?: CreatorStub | null;
  location?: LocationStub | null;
  review: string;
  rating?: number | null;
  image_url?: string | null;
  tags?: string[] | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at?: string | null;
}

export interface CreatedReelResponse {
  id: number;
  title: string;
  user?: CreatorStub | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  created_at?: string | null;
}

export interface ContentCreatedEvent {
  type: ComposerType;
  destination: PublishDestination;
  id: number;
  createdAt: string | null;
}
