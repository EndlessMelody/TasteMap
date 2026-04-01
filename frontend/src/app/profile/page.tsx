"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Column, Row, Heading, Text, Button, IconButton, Input, Avatar } from '@/components/OnceUI';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, X, Save, Lock, MapPin, Calendar, Star, Utensils, Award, Heart, Edit3, MessageCircle, Image as ImageIcon, Map as MapIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import ClientOnly from '@/components/common/ClientOnly';
import { MOCK_USER } from '@/constants/mock-data';

// ═══════════ PROFILE PAGE ═══════════ //

export default function ProfilePage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');

  // Form state
  const [formName, setFormName] = useState(MOCK_USER.name);
  const [formUsername, setFormUsername] = useState(MOCK_USER.username.replace('@', ''));
  const [formBio, setFormBio] = useState(MOCK_USER.bio);
  const [formEmail, setFormEmail] = useState('ramona.f@email.com');
  const [formPhone, setFormPhone] = useState('+84 901 234 567');

  const handleSave = () => {
    setIsEditModalOpen(false);
    toast.success('Profile updated successfully! ✨');
  };

  const handleComingSoon = () => toast('Will be updated in the next version 🚀');

  return (
    <Column fillWidth fillHeight className="no-scrollbar" style={{ 
      backgroundColor: '#FFFFFF', 
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: '120px'
    }}>

      {/* ═══ COVER PHOTO ═══ */}
      <div style={{ position: 'relative', width: '100%', height: '320px', flexShrink: 0 }}>
        <img src={MOCK_USER.cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%)' }} />

        {/* Back Button */}
        <Link href="/" style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex' }}>
          <IconButton
            icon={<ChevronLeft size={20} color="#1C1C1E" />}
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              borderRadius: '14px', width: '44px', height: '44px', cursor: 'pointer',
              borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
              borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
        </Link>

        {/* Header Actions */}
        <Row style={{ position: 'absolute', top: '24px', right: '24px', gap: '12px', alignItems: 'center' }}>
          <Button
            size="s"
            onClick={() => setIsEditModalOpen(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              borderRadius: '14px', color: '#1C1C1E', fontWeight: 700,
              paddingTop: '10px', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px', cursor: 'pointer',
              borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
              borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Row style={{ gap: '8px', alignItems: 'center' }}>
              <Edit3 size={16} color="#007AFF" /> 
              <Text style={{ fontSize: '0.85rem' }}>Edit Profile</Text>
            </Row>
          </Button>
          <IconButton
            icon={<Heart size={20} color="#007AFF" />}
            onClick={handleComingSoon}
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              borderRadius: '14px', width: '44px', height: '44px', cursor: 'pointer',
              borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
              borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
        </Row>
      </div>

      {/* ═══ PROFILE HEADER ═══ */}
      <Column fillWidth style={{ 
        maxWidth: '1200px', 
        marginLeft: 'auto', 
        marginRight: 'auto', 
        paddingLeft: '40px', 
        paddingRight: '40px', 
        marginTop: '-100px', 
        zIndex: 10 
      }}>

        {/* Avatar Area */}
        <Row fillWidth style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            <Avatar src={MOCK_USER.avatar} size="xl" style={{
              width: '160px', height: '160px', borderRadius: '50%',
              borderTopWidth: '6px', borderBottomWidth: '6px', borderLeftWidth: '6px', borderRightWidth: '6px',
              borderStyle: 'solid', borderColor: '#FFFFFF',
              boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
            }} />
            {/* Level Badge */}
            <div style={{
              position: 'absolute', bottom: '8px', right: '8px',
              backgroundColor: '#007AFF', borderRadius: '14px',
              paddingTop: '6px', paddingBottom: '6px', paddingLeft: '12px', paddingRight: '12px',
              borderTopWidth: '4px', borderBottomWidth: '4px', borderLeftWidth: '4px', borderRightWidth: '4px',
              borderStyle: 'solid', borderColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,122,255,0.3)',
            }}>
              <Text style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>LV {MOCK_USER.level}</Text>
            </div>
          </div>
        </Row>

        {/* Name + Info */}
        <Column style={{ gap: '10px', marginBottom: '32px' }}>
          <Heading variant="display-strong-s" style={{ color: '#1C1C1E', fontSize: '2.5rem' }}>{MOCK_USER.name}</Heading>
          
          <Row style={{ gap: '12px', alignItems: 'center' }}>
            <Text style={{ color: '#007AFF', fontWeight: 600, fontSize: '1rem' }}>{MOCK_USER.username} • {MOCK_USER.title}</Text>
            <div style={{ backgroundColor: '#EAF2FF', height: '14px', width: '2px' }} />
            <Row style={{ gap: '8px', alignItems: 'center' }}>
              <TrendingUp size={14} color="#007AFF" />
              <Text style={{ color: '#007AFF', fontSize: '0.85rem', fontWeight: 700 }}>Top 1% in Sài Gòn</Text>
            </Row>
          </Row>

          <Text style={{ color: '#636366', fontSize: '1rem', lineHeight: 1.6, maxWidth: '720px' }}>{MOCK_USER.bio}</Text>

          {/* Level Progress Bar */}
          <Column style={{ gap: '8px', maxWidth: '320px', marginTop: '8px' }}>
             <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: '#8E8E93', fontSize: '0.75rem', fontWeight: 600 }}>Level {MOCK_USER.level} Progress</Text>
                <Text style={{ color: '#1C1C1E', fontSize: '0.75rem', fontWeight: 700 }}>{MOCK_USER.xp} / {MOCK_USER.nextLevelXp} XP</Text>
             </Row>
             <div style={{ width: '100%', height: '6px', backgroundColor: '#EAF2FF', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(MOCK_USER.xp / MOCK_USER.nextLevelXp) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ height: '100%', backgroundColor: '#007AFF', borderRadius: '3px' }} 
                />
             </div>
          </Column>

          <Row style={{ gap: '24px', marginTop: '16px' }}>
            <Row style={{ gap: '8px', alignItems: 'center' }}>
              <MapPin size={16} color="#8E8E93" />
              <Text style={{ color: '#8E8E93', fontSize: '0.9rem' }}>{MOCK_USER.location}</Text>
            </Row>
            <Row style={{ gap: '8px', alignItems: 'center' }}>
              <Calendar size={16} color="#8E8E93" />
              <Text style={{ color: '#8E8E93', fontSize: '0.9rem' }}>Joined {MOCK_USER.joined}</Text>
            </Row>
          </Row>
        </Column>

        {/* ═══ TASTE DNA SECTION ═══ */}
        <Row fillWidth style={{ gap: '24px', marginBottom: '48px' }}>
          {/* Radar Chart Card */}
          <Column style={{
            flexGrow: 1.2, flexShrink: 1, flexBasis: '0%', backgroundColor: '#EAF2FF', borderRadius: '32px',
            paddingTop: '40px', paddingRight: '40px', paddingBottom: '40px', paddingLeft: '40px',
            borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
            borderStyle: 'solid', borderColor: 'rgba(0,122,255,0.08)',
            boxShadow: '0 12px 40px rgba(0,122,255,0.04)',
            height: '420px', position: 'relative'
          }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <Row style={{ gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    backgroundColor: '#007AFF', 
                    paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '10px', 
                    borderRadius: '12px' 
                  }}>
                    <TrendingUp size={20} color="white" />
                  </div>
                  <Column>
                    <Heading variant="heading-strong-m" style={{ color: '#1C1C1E', fontSize: '1.25rem' }}>Taste DNA</Heading>
                    <Text style={{ color: '#007AFF', fontSize: '0.85rem', fontWeight: 600 }}>Your Unique Flavor Profile</Text>
                  </Column>
               </Row>
               <Button size="s" variant="secondary" style={{ backgroundColor: 'white', borderRadius: '12px' }}>View Insights</Button>
            </Row>
            
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", width: '100%', minHeight: '280px' }}>
              <ClientOnly>
                <ResponsiveContainer width="100%" height={280} minWidth={100} debounce={50}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_USER.radarData}>
                    <PolarGrid stroke="rgba(0,122,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 600 }} />
                    <Radar
                      name="Taste"
                      dataKey="A"
                      stroke="#007AFF"
                      fill="#007AFF"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </Column>

          {/* Top Traits Card */}
          <Column style={{
            flexGrow: 1, flexShrink: 1, flexBasis: '0%', backgroundColor: '#FFFFFF', borderRadius: '32px',
            paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px',
            borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
            borderStyle: 'solid', borderColor: '#F2F2F7',
            boxShadow: '0 8px 32px rgba(0,0,0,0.02)',
            height: '420px'
          }}>
            <Heading variant="heading-strong-m" style={{ color: '#1C1C1E', marginBottom: '24px' }}>Top Highlights</Heading>
            <Column style={{ gap: '12px' }}>
              {[
                { icon: '🌶️', label: 'Spice Specialist', desc: 'Top 5% Spicy Reviewer', color: '#FFF5F5', bg: '#FFF5F5' },
                { icon: '🍜', label: 'Street Food Guru', desc: '142 local stalls visited', color: '#FDFCF2', bg: '#FDFCF2' },
                { icon: '💎', label: 'Hidden Gem Finder', desc: 'Discovered 12 hotspots', color: '#F5F3FF', bg: '#F5F3FF' },
              ].map(trait => (
                <Row key={trait.label} style={{
                  paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px', gap: '16px', alignItems: 'center',
                  borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                  borderStyle: 'solid', borderColor: trait.bg,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', 
                    backgroundColor: trait.bg, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' 
                  }}>
                    {trait.icon}
                  </div>
                  <Column style={{ gap: '2px' }}>
                    <Text style={{ color: '#1C1C1E', fontWeight: 700, fontSize: '0.95rem' }}>{trait.label}</Text>
                    <Text style={{ color: '#8E8E93', fontSize: '0.8rem', fontWeight: 500 }}>{trait.desc}</Text>
                  </Column>
                </Row>
              ))}
            </Column>
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%' }} />
            <Row style={{
              backgroundColor: '#F9F9FB', 
              paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', 
              borderRadius: '18px',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Text style={{ color: '#636366', fontSize: '0.85rem', fontWeight: 600 }}>Taste Match with Friends</Text>
              <Text style={{ color: '#007AFF', fontWeight: 800 }}>88%</Text>
            </Row>
          </Column>
        </Row>

        {/* ═══ TABS SECTION ═══ */}
        <Column fillWidth style={{ marginBottom: '64px' }}>
          {/* Tab Headers */}
          <Row style={{ 
            gap: '32px', 
            borderTopWidth: '0px',
            borderLeftWidth: '0px',
            borderRightWidth: '0px',
            borderBottomWidth: '2px', 
            borderBottomStyle: 'solid', 
            borderBottomColor: '#EAF2FF', 
            paddingBottom: '12px', 
            marginBottom: '32px' 
          }}>
            {['Posts', 'Reviews', 'Achievements', 'Visited'].map(tab => (
                <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer', 
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '4px',
                  paddingRight: '4px'
                }}
              >
                <Text style={{ 
                  color: activeTab === tab ? '#007AFF' : '#8E8E93', 
                  fontWeight: activeTab === tab ? 700 : 500,
                  fontSize: '1rem',
                  transition: 'color 0.2s'
                }}>
                  {tab}
                </Text>
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    style={{ 
                      position: 'absolute', bottom: '-13px', left: 0, right: 0,
                      height: '3px', backgroundColor: '#007AFF', borderRadius: '3px'
                    }} 
                  />
                )}
              </div>
            ))}
          </Row>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Posts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {MOCK_USER.posts.map(post => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.02 }}
                      style={{ 
                        aspectRatio: '1/1', borderRadius: '24px', overflow: 'hidden', 
                        position: 'relative', cursor: 'pointer',
                        backgroundColor: '#EAF2FF'
                      }}
                    >
                      <img src={post.img} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', 
                        opacity: 0, transition: 'opacity 0.2s', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', gap: '24px'
                      }} 
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                         <Row style={{ gap: '8px', alignItems: 'center' }}>
                            <Heart size={20} color="white" fill="white" />
                            <Text style={{ color: 'white', fontWeight: 700 }}>{post.likes}</Text>
                         </Row>
                         <Row style={{ gap: '8px', alignItems: 'center' }}>
                            <MessageCircle size={20} color="white" fill="white" />
                            <Text style={{ color: 'white', fontWeight: 700 }}>{post.comments}</Text>
                         </Row>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'Achievements' && (
                <Column style={{ gap: '32px' }}>
                  <Row style={{ gap: '16px', flexWrap: 'wrap' }}>
                    {MOCK_USER.badges.map(badge => (
                      <Row key={badge.label} style={{
                        gap: '16px', alignItems: 'center',
                        paddingTop: '18px', paddingBottom: '18px', paddingLeft: '32px', paddingRight: '32px',
                        backgroundColor: '#EAF2FF',
                        borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                        borderStyle: 'solid', borderColor: 'rgba(0,122,255,0.08)',
                        borderRadius: '24px',
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                        <Column>
                           <Text style={{ color: '#007AFF', fontWeight: 700, fontSize: '0.95rem' }}>{badge.label}</Text>
                           <Text style={{ color: 'rgba(0,122,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>Unlocked Mar 2025</Text>
                        </Column>
                      </Row>
                    ))}
                  </Row>
                </Column>
              )}

              {activeTab === 'Reviews' && (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {MOCK_USER.topSpots.map(spot => (
                      <Column key={spot.name} style={{
                        paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px',
                        backgroundColor: '#FFFFFF', borderRadius: '24px',
                        gap: '16px', 
                        borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                        borderStyle: 'solid', borderColor: '#EAF2FF',
                        boxShadow: '0 8px 24px rgba(0,122,255,0.04)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}>
                        <Row style={{ gap: '16px', alignItems: 'center' }}>
                          <img src={spot.img} alt={spot.name} style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }} />
                          <Column style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', gap: '4px' }}>
                            <Heading variant="heading-strong-s" style={{ fontSize: '1rem', color: '#1C1C1E' }}>{spot.name}</Heading>
                            <Row style={{ gap: '4px' }}>
                              {[1,2,3,4,5].map(i => <Star key={i} size={12} color={i <= 4 ? '#FBBF24' : '#E5E5EA'} fill={i <= 4 ? '#FBBF24' : '#E5E5EA'} />)}
                            </Row>
                          </Column>
                          <Text style={{ color: '#8E8E93', fontSize: '0.75rem', fontWeight: 600 }}>2d ago</Text>
                        </Row>
                        <Column style={{ gap: '12px' }}>
                          <div style={{ 
                            paddingTop: '4px', paddingBottom: '4px', paddingLeft: '10px', paddingRight: '10px', 
                            backgroundColor: '#EAF2FF', borderRadius: '8px', alignSelf: 'flex-start' 
                          }}>
                             <Text style={{ color: '#007AFF', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{spot.category}</Text>
                          </div>
                          <Text style={{ color: '#636366', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                            "The best {spot.category} in the area. Spicy level is perfect for my Taste DNA!"
                          </Text>
                        </Column>
                      </Column>
                    ))}
                 </div>
              )}

              {activeTab === 'Visited' && (
                <Column style={{ 
                  gap: '20px', 
                  height: '400px', 
                  backgroundColor: '#FFFFFF', 
                  borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                  borderStyle: 'solid', 
                  borderColor: '#EAF2FF', 
                  borderRadius: '32px', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                    <MapIcon size={48} color="#007AFF" style={{ opacity: 0.2 }} />
                    <Text style={{ color: '#007AFF', fontWeight: 600, opacity: 0.5 }}>Interactive Map Coming Soon 🗺️</Text>
                    <Button variant="secondary" size="s">View List instead</Button>
                </Column>
              )}
            </motion.div>
          </AnimatePresence>
        </Column>
      </Column>

      {/* ═══════════ EDIT PROFILE MODAL ═══════════ */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsEditModalOpen(false)}
            style={{
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              zIndex: 1000,
              backgroundColor: 'rgba(28, 28, 30, 0.4)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                width: '640px', maxWidth: '95vw', maxHeight: '90vh',
                backgroundColor: '#FFFFFF',
                borderTopWidth: '1px',
                borderBottomWidth: '1px',
                borderLeftWidth: '1px',
                borderRightWidth: '1px',
                borderTopStyle: 'solid',
                borderBottomStyle: 'solid',
                borderLeftStyle: 'solid',
                borderRightStyle: 'solid',
                borderTopColor: 'rgba(0, 122, 255, 0.1)',
                borderBottomColor: 'rgba(0, 122, 255, 0.1)',
                borderLeftColor: 'rgba(0, 122, 255, 0.1)',
                borderRightColor: 'rgba(0, 122, 255, 0.1)',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <Row style={{
                paddingTop: '24px', paddingRight: '32px', paddingBottom: '24px', paddingLeft: '32px',
                justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: '#EAF2FF', 
                borderTopWidth: '0px', borderLeftWidth: '0px', borderRightWidth: '0px',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(0, 122, 255, 0.08)',
                flexShrink: 0,
              }}>
                <Column style={{ gap: '4px' }}>
                  <Heading variant="heading-strong-m" style={{ color: '#1C1C1E' }}>Edit Profile</Heading>
                  <Text style={{ color: '#007AFF', fontSize: '0.8rem', fontWeight: 600 }}>Personalize your TasteMap identity</Text>
                </Column>
                <IconButton
                  icon={<X size={20} color="#007AFF" />}
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF', borderRadius: '14px',
                    width: '44px', height: '44px', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.1)',
                    borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(0, 122, 255, 0.05)',
                  }}
                />
              </Row>

              {/* Scrollable Body */}
              <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* Cover + Avatar Visual */}
                <Column style={{ paddingTop: '32px', paddingRight: '32px', paddingBottom: '0', paddingLeft: '32px', gap: '20px' }}>
                  {/* Cover Photo */}
                  <div style={{ position: 'relative', height: '140px', borderRadius: '18px', overflow: 'hidden' }}>
                    <img src={MOCK_USER.cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)' }} />
                    <div
                      onClick={handleComingSoon}
                      style={{
                        position: 'absolute', bottom: '12px', right: '12px',
                        width: '40px', height: '40px', borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                        borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Camera size={18} color="#1C1C1E" />
                    </div>
                  </div>

                  {/* Avatar */}
                  <Row style={{ marginTop: '-54px', marginLeft: '24px', zIndex: 2 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar src={MOCK_USER.avatar} size="xl" style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        borderTopWidth: '4px', borderBottomWidth: '4px', borderLeftWidth: '4px', borderRightWidth: '4px',
                        borderStyle: 'solid', borderColor: '#FFFFFF',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      }} />
                      <div
                        onClick={handleComingSoon}
                        style={{
                          position: 'absolute', bottom: '2px', right: '2px',
                          width: '32px', height: '32px', borderRadius: '50%',
                          backgroundColor: '#007AFF',
                          borderTopWidth: '3px', borderBottomWidth: '3px', borderLeftWidth: '3px', borderRightWidth: '3px',
                          borderStyle: 'solid',
                          borderColor: '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,122,255,0.3)',
                        }}
                      >
                        <Camera size={14} color="white" />
                      </div>
                    </div>
                  </Row>
                </Column>

                {/* Form Fields */}
                <Column style={{ paddingTop: '24px', paddingRight: '32px', paddingBottom: '48px', paddingLeft: '32px', gap: '24px' }}>

                  {/* Public Info */}
                  <Column style={{ gap: '24px' }}>
                    <Row style={{ gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '4px', height: '16px', backgroundColor: '#007AFF', borderRadius: '2px' }} />
                      <Text style={{ color: '#007AFF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Public Information</Text>
                    </Row>

                    {/* Display Name */}
                    <Column style={{ gap: '8px' }}>
                      <Text style={{ color: '#1C1C1E', fontSize: '0.85rem', fontWeight: 600 }}>Display Name</Text>
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        style={{
                          width: '100%', 
                          paddingTop: '14px', paddingRight: '20px', paddingBottom: '14px', paddingLeft: '20px',
                          backgroundColor: '#F9F9FB',
                          borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: '#E5E5EA',
                          borderRadius: '16px', color: '#1C1C1E',
                          fontSize: '0.95rem', outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = '#007AFF';
                          e.target.style.backgroundColor = '#FFFFFF';
                          e.target.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#E5E5EA';
                          e.target.style.backgroundColor = '#F9F9FB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </Column>

                    {/* Username */}
                    <Column style={{ gap: '8px' }}>
                      <Text style={{ color: '#1C1C1E', fontSize: '0.85rem', fontWeight: 600 }}>Username</Text>
                      <Row style={{
                        backgroundColor: '#F9F9FB',
                        borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#E5E5EA',
                        borderRadius: '14px', overflow: 'hidden', alignItems: 'center',
                      }}>
                        <span style={{
                          paddingTop: '14px',
                          paddingBottom: '14px',
                          paddingLeft: '20px',
                          paddingRight: '0px',
                          color: '#8E8E93',
                          fontSize: '0.95rem', userSelect: 'none',
                        }}>@</span>
                        <input
                          type="text"
                          value={formUsername}
                          onChange={e => setFormUsername(e.target.value)}
                          style={{
                            flexGrow: 1, 
                            flexShrink: 1,
                            flexBasis: '0%',
                            paddingTop: '14px',
                            paddingBottom: '14px',
                            paddingLeft: '8px',
                            paddingRight: '20px',
                            backgroundColor: 'transparent', 
                            borderTopWidth: '0px', borderBottomWidth: '0px', borderLeftWidth: '0px', borderRightWidth: '0px',
                            borderStyle: 'none',
                            color: '#1C1C1E', fontSize: '0.95rem', outline: 'none',
                          }}
                        />
                      </Row>
                    </Column>
                    
                    {/* Bio */}
                    <Column style={{ gap: '8px' }}>
                      <Text style={{ color: '#1C1C1E', fontSize: '0.85rem', fontWeight: 600 }}>Bio</Text>
                      <textarea
                        value={formBio}
                        onChange={e => setFormBio(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%', 
                          paddingTop: '16px', paddingRight: '20px', paddingBottom: '16px', paddingLeft: '20px',
                          backgroundColor: '#F9F9FB',
                          borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: '#E5E5EA',
                          borderRadius: '16px', color: '#1C1C1E',
                          fontSize: '0.95rem', outline: 'none',
                          resize: 'none', fontFamily: 'inherit',
                          lineHeight: 1.6,
                          transition: 'all 0.2s',
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = '#007AFF';
                          e.target.style.backgroundColor = '#FFFFFF';
                          e.target.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#E5E5EA';
                          e.target.style.backgroundColor = '#F9F9FB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </Column>
                  </Column>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#F2F2F7' }} />

                  {/* Private Info */}
                  <Column style={{ gap: '20px' }}>
                    <Row style={{ gap: '10px', alignItems: 'center' }}>
                      <Lock size={16} color="#AEAEB2" />
                      <Text style={{ color: '#AEAEB2', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Account Information</Text>
                    </Row>

                    {/* Email */}
                    <Column style={{ gap: '8px' }}>
                      <Text style={{ color: '#1C1C1E', fontSize: '0.85rem', fontWeight: 600 }}>Email Address</Text>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        style={{
                          width: '100%', 
                          paddingTop: '14px', paddingRight: '20px', paddingBottom: '14px', paddingLeft: '20px',
                          backgroundColor: '#F9F9FB',
                          borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: '#E5E5EA',
                          borderRadius: '16px', color: '#1C1C1E',
                          fontSize: '0.95rem', outline: 'none',
                        }}
                      />
                    </Column>

                    {/* Phone */}
                    <Column style={{ gap: '8px' }}>
                      <Text style={{ color: '#1C1C1E', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</Text>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={e => setFormPhone(e.target.value)}
                        style={{
                          width: '100%', 
                          paddingTop: '14px', paddingRight: '20px', paddingBottom: '14px', paddingLeft: '20px',
                          backgroundColor: '#F9F9FB',
                          borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: '#E5E5EA',
                          borderRadius: '16px', color: '#1C1C1E',
                          fontSize: '0.95rem', outline: 'none',
                        }}
                      />
                    </Column>
                  </Column>
                </Column>
              </div>

              {/* Modal Footer */}
              <Row style={{
                paddingTop: '24px', paddingRight: '32px', paddingBottom: '24px', paddingLeft: '32px',
                justifyContent: 'flex-end', gap: '16px',
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: 'rgba(0, 122, 255, 0.08)',
                borderLeftWidth: '0px', borderRightWidth: '0px', borderBottomWidth: '0px',
                flexShrink: 0,
                backgroundColor: '#EAF2FF',
              }}>
                <Button
                  size="m"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px', borderRightWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(0, 122, 255, 0.1)',
                    borderRadius: '16px', color: '#8E8E93',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    paddingLeft: '28px',
                    paddingRight: '28px',
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="m"
                  onClick={handleSave}
                  style={{
                    backgroundColor: '#007AFF', color: '#FFFFFF',
                    borderRadius: '16px', fontWeight: 700,
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    cursor: 'pointer',
                    borderTopWidth: '0px', borderBottomWidth: '0px', borderLeftWidth: '0px', borderRightWidth: '0px',
                    borderStyle: 'none',
                    boxShadow: '0 8px 24px rgba(0,122,255,0.3)',
                  }}
                >
                  <Save size={16} style={{ marginRight: '8px' }} /> Save Changes
                </Button>
              </Row>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Column>
  );
}
