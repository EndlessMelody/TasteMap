"use client";

import React from 'react';
import { Column, Row, Heading, Text, Avatar, IconButton, Input } from '@/components/OnceUI';
import { X, Heart, MessageCircle, Bookmark, Star, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PostData {
  name: string;
  avatar: string;
  time: string;
  location: string;
  spotName: string;
  rating: number;
  review: string;
  img: string;
  tags: string[];
  likes: number;
  comments: number;
}

interface PostModalProps {
  data: PostData;
  onClose: () => void;
}

export default function PostModal({ data, onClose }: PostModalProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          width: '900px', maxWidth: '95vw', height: '600px', maxHeight: '90vh',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          backgroundColor: '#121217',
        }}
      >
        {/* Left — Image (60%) */}
        <div style={{ width: '60%', height: '100%', position: 'relative' }}>
          <img
            src={data.img}
            alt={data.spotName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Rating badge */}
          <Row style={{
            position: 'absolute', top: '16px', right: '16px',
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            padding: '6px 12px', borderRadius: '10px', gap: '4px', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Star size={14} color="#FBBF24" fill="#FBBF24" />
            <Text style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FBBF24' }}>{data.rating}</Text>
          </Row>
        </div>

        {/* Right — Content (40%) */}
        <Column style={{ width: '40%', height: '100%', backgroundColor: '#121217' }}>
          {/* Header */}
          <Row style={{
            padding: '20px', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Row style={{ alignItems: 'center', gap: '12px' }}>
              <Avatar src={data.avatar} size="m" />
              <Column>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{data.name}</Text>
                <Row style={{ alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="rgba(255,255,255,0.4)" />
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{data.spotName} • {data.location}</Text>
                </Row>
              </Column>
            </Row>
            <IconButton
              icon={<X size={18} color="rgba(255,255,255,0.5)" />}
              onClick={onClose}
              variant="tertiary"
              style={{ borderRadius: '10px', cursor: 'pointer' }}
            />
          </Row>

          {/* Scrollable Caption + Comments */}
          <Column style={{ flex: 1, padding: '20px', gap: '16px', overflowY: 'auto' }}>
            {/* Caption */}
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', lineHeight: 1.7 }}>{data.review}</Text>

            {/* Tags */}
            <Row style={{ gap: '8px', flexWrap: 'wrap' }}>
              {data.tags.map((tag) => (
                <span key={tag} style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(237,27,36,0.08)',
                  border: '1px solid rgba(237,27,36,0.15)',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#ED1B24',
                }}>{tag}</span>
              ))}
            </Row>

            {/* Separator */}
            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {/* Mock comments */}
            <Column style={{ gap: '14px' }}>
              <Row style={{ gap: '10px', alignItems: 'flex-start' }}>
                <Avatar src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop" size="s" />
                <Column style={{ gap: '2px' }}>
                  <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Đức Anh</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Quán này ngon lắm, mình cũng hay ghé! 🔥</Text>
                </Column>
              </Row>
              <Row style={{ gap: '10px', alignItems: 'flex-start' }}>
                <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop" size="s" />
                <Column style={{ gap: '2px' }}>
                  <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Bảo Trân</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Save lại để cuối tuần rủ bạn bè đi 😍</Text>
                </Column>
              </Row>
              <Row style={{ gap: '10px', alignItems: 'flex-start' }}>
                <Avatar src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop" size="s" />
                <Column style={{ gap: '2px' }}>
                  <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Anh Khoa</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Giá bao nhiêu vậy bạn?</Text>
                </Column>
              </Row>
            </Column>
          </Column>

          {/* Action Bar */}
          <Row style={{
            padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Row style={{ gap: '4px' }}>
              <Row
                onClick={() => setIsLiked(!isLiked)}
                style={{
                  alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
                  backgroundColor: isLiked ? 'rgba(237,27,36,0.1)' : 'transparent', transition: 'all 0.2s',
                }}
              >
                <Heart size={18} color={isLiked ? '#ED1B24' : 'rgba(255,255,255,0.5)'} fill={isLiked ? '#ED1B24' : 'none'} />
                <Text style={{ fontSize: '0.8rem', fontWeight: 600, color: isLiked ? '#ED1B24' : 'rgba(255,255,255,0.5)' }}>{isLiked ? data.likes + 1 : data.likes}</Text>
              </Row>
              <Row style={{ alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px' }}>
                <MessageCircle size={18} color="rgba(255,255,255,0.5)" />
                <Text style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{data.comments + 3}</Text>
              </Row>
            </Row>
            <Row
              onClick={() => setIsSaved(!isSaved)}
              style={{
                padding: '6px 10px', borderRadius: '10px', cursor: 'pointer',
                backgroundColor: isSaved ? 'rgba(96,165,250,0.1)' : 'transparent', transition: 'all 0.2s',
              }}
            >
              <Bookmark size={18} color={isSaved ? '#60A5FA' : 'rgba(255,255,255,0.5)'} fill={isSaved ? '#60A5FA' : 'none'} />
            </Row>
          </Row>

          {/* Comment Input */}
          <Row style={{
            padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            gap: '10px', alignItems: 'center',
          }}>
            <Input placeholder="Add a comment..." style={{ flex: 1, borderRadius: '999px', padding: '8px 16px', fontSize: '0.8rem' }} />
            <IconButton
              icon={<Send size={16} color="#ED1B24" />}
              variant="tertiary"
              style={{ borderRadius: '10px', cursor: 'pointer' }}
            />
          </Row>
        </Column>
      </motion.div>
    </motion.div>
  );
}
