import React from "react";

export interface ReelData {
  id: number;
  title: string;
  user: string;
  views: string;
  userAvatar: string;
  img: string;
  videoUrl?: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface PostData {
  id: number;
  name: string;
  avatar: string;
  user?: { 
    id: number; 
    display_name?: string; 
    avatar_url?: string;
    title?: string;
    level?: number;
    primary_badge?: {
      id: number;
      name: string;
      icon_name: string;
      accent_color: string;
    } | null;
  };
  time: string;
  location: string;
  spotName: string;
  rating: number;
  review: string;
  img: string;
  tags: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
  userTitle?: string;
  userLevel?: number;
  primaryBadge?: {
    id: number;
    name: string;
    icon_name: string;
    accent_color: string;
  } | null;
}

export interface AIPickData {
  title: string;
  reason: string;
  match: number;
  price: string;
  img: string;
  color: string;
}

export interface ContextOption {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
  tags: string[];
}

export interface HeroBannerData {
  title: string;
  description?: string;
  image: string;
  tags: string[];
  xpBonus?: string;
  ctaText: string;
  sponsored: boolean;
}

export interface ProBannerData {
  badge: string;
  subBadge: string;
  title: string;
  description: string;
  btnText: string;
  image?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  cover: string;
  bio: string;
  level: number;
  title: string;
  location: string;
  joined: string;
  stats: {
    reviews: number;
    visited: number;
    followers: number;
    following: number;
  };
  xp: number;
  nextLevelXp: number;
  badges: {
    icon: React.ReactNode;
    label: string;
    color: string;
  }[];
  radarData: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
  posts: {
    id: number;
    img: string;
    likes: number;
    comments: number;
  }[];
  topSpots: {
    name: string;
    img: string;
    rating: number;
    category: string;
  }[];
}
