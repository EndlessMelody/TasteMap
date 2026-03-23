"use client";

import React from 'react';
import { Column, Row, Text, Avatar, IconButton } from '@/components/OnceUI';
import { X, Heart, Share2, MessageCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ReelData {
  title: string;
  user: string;
  userAvatar: string;
  views: string;
  img: string;
}

interface ReelModalProps {
  data: ReelData;
  onClose: () => void;
}

export default function ReelModal({ data, onClose }: ReelModalProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          width: '400px', height: '80vh', maxHeight: '700px',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Full Image Background */}
        <img
          src={data.img}
          alt={data.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Top Gradient */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }} />

        {/* Bottom Gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }} />

        {/* Close */}
        <IconButton
          icon={<X size={20} color="white" />}
          onClick={onClose}
          variant="tertiary"
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
          }}
        />

        {/* Play button center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <Play size={24} color="white" fill="white" />
        </div>

        {/* Bottom Info */}
        <Column style={{
          position: 'absolute', bottom: '20px', left: '20px', right: '70px', zIndex: 10,
          gap: '10px',
        }}>
          <Row style={{ alignItems: 'center', gap: '10px' }}>
            <Avatar src={data.userAvatar} size="m" />
            <Column>
              <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{data.user}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{data.views} views</Text>
            </Column>
          </Row>
          <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{data.title}</Text>
        </Column>

        {/* Right action bar */}
        <Column style={{
          position: 'absolute', right: '16px', bottom: '80px', zIndex: 10,
          gap: '20px', alignItems: 'center',
        }}>
          <Column style={{ alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setIsLiked(!isLiked)}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: isLiked ? 'rgba(237,27,36,0.2)' : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <Heart size={20} color={isLiked ? '#ED1B24' : 'white'} fill={isLiked ? '#ED1B24' : 'none'} />
            </div>
            <Text style={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>12.4K</Text>
          </Column>
          <Column style={{ alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageCircle size={20} color="white" />
            </div>
            <Text style={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>342</Text>
          </Column>
          <Column style={{ alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Share2 size={20} color="white" />
            </div>
            <Text style={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>Share</Text>
          </Column>
        </Column>
      </motion.div>
    </motion.div>
  );
}
