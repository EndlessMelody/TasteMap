"use client";

import React from 'react';
import { Column, Row, Heading, Text, Button, Avatar, IconButton } from '@/components/OnceUI';
import { X, Users, MapPin, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export interface LobbyData {
  name: string;
  route: string;
  time: string;
  spots: number;
  members: { name: string; avatar: string; ready: boolean }[];
  bg: string;
  accent: string;
}

interface LobbyModalProps {
  data: LobbyData;
  onClose: () => void;
}

export default function LobbyModal({ data, onClose }: LobbyModalProps) {
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
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          width: '480px', maxWidth: '95vw',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#121217',
        }}
      >
        {/* Hero Image */}
        <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
          <img src={data.bg} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), ${data.accent}40)`,
          }} />
          <IconButton
            icon={<X size={18} color="white" />}
            onClick={onClose}
            variant="tertiary"
            style={{
              position: 'absolute', top: '12px', right: '12px',
              backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
              width: '32px', height: '32px', cursor: 'pointer',
            }}
          />
          <Column style={{ position: 'absolute', bottom: '16px', left: '20px', zIndex: 2 }}>
            <Heading variant="heading-strong-m" style={{ color: 'white' }}>{data.name}</Heading>
          </Column>
        </div>

        {/* Content */}
        <Column style={{ padding: '24px', gap: '20px' }}>
          {/* Route Info */}
          <Column style={{ gap: '8px' }}>
            <Row style={{ alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="rgba(255,255,255,0.5)" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{data.route}</Text>
            </Row>
            <Row style={{ gap: '16px' }}>
              <Row style={{ alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="rgba(255,255,255,0.4)" />
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{data.time}</Text>
              </Row>
              <Row style={{ alignItems: 'center', gap: '6px' }}>
                <Users size={14} color="rgba(255,255,255,0.4)" />
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{data.members.length}/{data.spots} joined</Text>
              </Row>
            </Row>
          </Column>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* Participants */}
          <Column style={{ gap: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participants</Text>
            <Row style={{ gap: '12px', flexWrap: 'wrap' }}>
              {data.members.map((m) => (
                <Column key={m.name} style={{ alignItems: 'center', gap: '6px', width: '64px' }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar src={m.avatar} size="l" />
                    {m.ready && (
                      <div style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: '18px', height: '18px', borderRadius: '50%',
                        backgroundColor: '#121217', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle size={14} color="#00D1B2" fill="#00D1B2" />
                      </div>
                    )}
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', textAlign: 'center' }}>{m.name}</Text>
                </Column>
              ))}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, data.spots - data.members.length) }).map((_, i) => (
                <Column key={`empty-${i}`} style={{ alignItems: 'center', gap: '6px', width: '64px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Users size={18} color="rgba(255,255,255,0.15)" />
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>Open</Text>
                </Column>
              ))}
            </Row>
          </Column>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* Status + CTA */}
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row style={{ alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#00D1B2', boxShadow: '0 0 6px #00D1B260',
              }} />
              <Text style={{ color: '#00D1B2', fontSize: '0.8rem', fontWeight: 600 }}>Lobby Open</Text>
            </Row>
            <Button
              size="m"
              onClick={() => toast("Will be updated in the next version 🚀")}
              style={{
                backgroundColor: data.accent,
                color: 'white',
                fontWeight: 700,
                borderRadius: '12px',
                padding: '10px 28px',
                cursor: 'pointer',
                border: 'none',
              }}
            >Confirm Join</Button>
          </Row>
        </Column>
      </motion.div>
    </motion.div>
  );
}
