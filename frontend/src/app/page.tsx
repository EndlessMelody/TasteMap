"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Column, Row, Heading, Text, Button, IconButton, Input, Avatar } from '@/components/OnceUI';
import { Compass, Hand, MapPin, Users, Mic, Bell, MessageSquare, Plus, CloudRain, Flame, ChevronLeft, ChevronRight, Maximize2, X, PanelLeftClose, PanelLeftOpen, Play, Eye, Sun, Moon, Coffee, Wine, UtensilsCrossed, Sparkles, Navigation, Heart, MessageCircle, Bookmark, MoreHorizontal, Star, SlidersHorizontal, Beer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import MapWidget from '@/components/Map';
import PostModal, { PostData } from '@/components/PostModal';
import ReelModal, { ReelData } from '@/components/ReelModal';
import LobbyModal, { LobbyData } from '@/components/LobbyModal';

// Mock Data Arrays
const MOCK_REELS: ReelData[] = [
  { title: "Crispy Pork Belly ASMR 🔥", user: "@foodie_ramona", views: "1.2M", userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=700&fit=crop" },
  { title: "Hidden Ramen Spot in District 1", user: "@noodle_king", views: "890K", userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=700&fit=crop" },
  { title: "Vietnamese Coffee Art ☕", user: "@cafe_hunter", views: "2.1M", userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=700&fit=crop" },
  { title: "Street Bánh Mì at 3AM 🌙", user: "@midnight_bites", views: "567K", userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop", img: "https://images.unsplash.com/photo-1600454021915-de1c1cb0e91f?w=400&h=700&fit=crop" },
  { title: "Dragon Fruit Smoothie Bowl", user: "@healthy_vibes", views: "340K", userAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop", img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=700&fit=crop" },
  { title: "Seafood Hot Pot Mukbang 🦐", user: "@ocean_eats", views: "1.8M", userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=700&fit=crop" },
];

const MOCK_LOBBIES: LobbyData[] = [
  { name: "Spicy Noodle Challenge", route: "District 1 Mapping", time: "Tonight at 8 PM", spots: 4, bg: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=320&fit=crop", accent: "#ED1B24", members: [
    { name: "Ramona", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop", ready: true },
    { name: "Khoa", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop", ready: true },
    { name: "Linh", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop", ready: false },
  ]},
  { name: "Coffee Lovers", route: "Hidden cafes tour", time: "Tomorrow at 9 AM", spots: 6, bg: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=320&fit=crop", accent: "#F59E0B", members: [
    { name: "Tran", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop", ready: true },
    { name: "Vy", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop", ready: true },
    { name: "Minh", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop", ready: false },
    { name: "Bao", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop", ready: false },
    { name: "Duc", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop", ready: false },
  ]},
];

const MOCK_POSTS: PostData[] = [
  { name: "Minh T.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop", time: "2h", location: "Dĩ An", spotName: "Bún Bò O Trắng", rating: 4.8, review: "Tìm được quán bún bò chân ái mới ở Dĩ An! Nước dùng thanh, siêu nhiều thịt. Mọi người nên thử nhé. 🍜🔥", img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=680&h=480&fit=crop", tags: ['Street Food', 'Spicy'], likes: 42, comments: 8 },
  { name: "Lê Hương", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop", time: "5h", location: "Thủ Đức", spotName: "Cafe Rooftop Sunset", rating: 4.5, review: "View đẹp, cà phê ổn, giá hơi cao nhưng đáng để trải nghiệm vào chiều cuối tuần. Chỗ ngồi ngoài trời mát lắm! ☕🌅", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=680&h=480&fit=crop", tags: ['Cafe', 'Rooftop'], likes: 128, comments: 24 },
  { name: "Phúc Nguyễn", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&h=128&fit=crop", time: "8h", location: "Dĩ An", spotName: "Hủ Tiếu Nam Vang Chú Sáu", rating: 4.9, review: "Hủ tiếu khô ở đây xịn nhất vùng, nước lèo thơm béo, hoành thánh giòn tan. Quán đông nhưng phục vụ nhanh. Sẽ quay lại! 🤤", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=680&h=480&fit=crop", tags: ['Noodles', 'Budget'], likes: 89, comments: 15 },
  { name: "Thanh Vũ", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop", time: "12h", location: "Bình Dương", spotName: "BBQ Garden Night", rating: 4.3, review: "Thịt nướng ướp khói thơm phức, bia đá lạnh. Không gian ngoài trời thoáng mát, nhạc acoustic live nữa. 🍖🍻", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=680&h=480&fit=crop", tags: ['BBQ', 'Night Life'], likes: 67, comments: 11 },
];

const radarData = [
  { subject: 'Street Food', A: 120, fullMark: 150 },
  { subject: 'Spicy', A: 98, fullMark: 150 },
  { subject: 'Sweet', A: 86, fullMark: 150 },
  { subject: 'Luxury', A: 30, fullMark: 150 },
  { subject: 'Quiet', A: 65, fullMark: 150 },
  { subject: 'Group', A: 110, fullMark: 150 },
];

function getDynamicContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return { title: 'Morning Energy Boost', icon: <Sun size={20} color="#FBBF24" />, accent: '#FBBF24', tags: ['Breakfast', 'Coffee', 'Juice Bar', 'Bakery'] };
  } else if (hour >= 11 && hour < 15) {
    return { title: 'Lunch Power-Up', icon: <UtensilsCrossed size={20} color="#F97316" />, accent: '#F97316', tags: ['Rice', 'Noodles', 'Quick Bites', 'Healthy'] };
  } else if (hour >= 15 && hour < 19) {
    return { title: 'Afternoon Chill & Snacks', icon: <Coffee size={20} color="#A78BFA" />, accent: '#A78BFA', tags: ['Cafe', 'Dessert', 'Boba', 'Chill Spots'] };
  } else if (hour >= 19 && hour < 22) {
    return { title: 'Dinner & Unwind', icon: <Wine size={20} color="#F472B6" />, accent: '#F472B6', tags: ['BBQ', 'Hotpot', 'Fine Dining', 'Rooftop'] };
  } else {
    return { title: 'Late Night Cravings', icon: <Moon size={20} color="#60A5FA" />, accent: '#60A5FA', tags: ['Street Food', '24h Spots', 'Ramen', 'Midnight Snacks'] };
  }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isRightExpanded, setIsRightExpanded] = useState(false);

  // Modal States
  const [selectedReel, setSelectedReel] = useState<ReelData | null>(null);
  const [selectedLobby, setSelectedLobby] = useState<LobbyData | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  const handleComingSoon = () => toast("Will be updated in the next version 🚀");
  const router = useRouter();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const groupToursRef = useRef<HTMLDivElement>(null);
  const eatItAgainRef = useRef<HTMLDivElement>(null);

  const scrollList = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const sidebarWidth = isSidebarOpen ? 260 : 80;

  return (
    <Row fillWidth fillHeight style={{ height: '100vh', overflow: 'hidden', backgroundColor: '#08080C', paddingRight: '80px' }}>

      {/* ═══════════ 1. LEFT SIDEBAR ═══════════ */}
      <Column
        className="no-scrollbar"
        fillHeight
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          padding: isSidebarOpen ? '24px 20px' : '24px 12px',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          backgroundColor: '#121217',
          flexShrink: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          gap: '28px',
        }}
      >
        {/* Logo + Toggle */}
        <Row fillWidth style={{
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          alignItems: 'center',
          minHeight: '36px',
        }}>
          {isSidebarOpen && (
            <Heading variant="heading-strong-l" style={{ color: '#ED1B24', fontWeight: 900, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              TasteMap.
            </Heading>
          )}
          <IconButton
            icon={isSidebarOpen ? <PanelLeftClose size={18} color="rgba(255,255,255,0.7)" /> : <PanelLeftOpen size={18} color="rgba(255,255,255,0.7)" />}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'background-color 0.2s',
            }}
          />
        </Row>

        {/* Menu Section */}
        <Column style={{ gap: '4px', width: '100%' }}>
          {isSidebarOpen && (
            <Text variant="body-default-xs" style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', paddingLeft: '12px' }}>Menu</Text>
          )}
          <SidebarItem icon={<Compass size={20} />} label="Discover" active collapsed={!isSidebarOpen} onClick={() => {}} />
          <SidebarItem icon={<Hand size={20} />} label="Food Tour Builder" collapsed={!isSidebarOpen} onClick={() => router.push('/tour-builder')} />
          <SidebarItem icon={<MapPin size={20} />} label="Local Hot Routes" collapsed={!isSidebarOpen} onClick={handleComingSoon} />
        </Column>

        {/* Social Section */}
        <Column style={{ gap: '4px', width: '100%' }}>
          {isSidebarOpen && (
            <Text variant="body-default-xs" style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', paddingLeft: '12px' }}>Social</Text>
          )}
          <SidebarItem icon={<Users size={20} />} label="Foodies" collapsed={!isSidebarOpen} onClick={handleComingSoon} />
          <SidebarItem icon={<Mic size={20} />} label="Group Rooms" collapsed={!isSidebarOpen} onClick={handleComingSoon} />
        </Column>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Gamification Card */}
        {isSidebarOpen ? (
          <Column style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '16px',
            gap: '12px',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <Row style={{ alignItems: 'center', gap: '12px' }}>
              <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" size="m" />
              <Column>
                <Heading variant="heading-strong-s" style={{ color: 'white' }}>Taste Explorer</Heading>
                <Text variant="body-default-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Level 12 • Vector Map</Text>
              </Column>
            </Row>
            <div style={{ width: '100%', height: '150px', marginTop: '-4px', marginBottom: '-4px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Radar name="Taste" dataKey="A" stroke="#ED1B24" fill="#ED1B24" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <Button size="s" variant="secondary" fillWidth onClick={handleComingSoon}>Challenge Data</Button>
          </Column>
        ) : (
          <Column style={{ alignItems: 'center', width: '100%', paddingBottom: '8px' }}>
            <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" size="m" style={{ border: '2px solid #ED1B24', cursor: 'pointer' }} />
          </Column>
        )}
      </Column>

      {/* ═══════════ 2. CENTER PANEL ═══════════ */}
      <Column
        className="no-scrollbar"
        fillHeight
        style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}
      >
        {/* Sticky Glassmorphism Header */}
        <Row fillWidth style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(10, 10, 10, 0.65)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 40px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Row style={{ gap: '16px', alignItems: 'center' }}>
            {/* Location Pill */}
            <Row style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              gap: '8px',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}>
              <MapPin size={16} color="#ED1B24" />
              <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.82rem' }}>Dĩ An, Bình Dương</Text>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginLeft: '2px' }}>▼</span>
            </Row>
            {/* Command Palette Search */}
            <Row style={{ width: '420px', position: 'relative' }}>
              <Input placeholder="Search locations, tours, foodies..." style={{ borderRadius: '999px', padding: '10px 20px', width: '100%' }} />
              <Row style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                gap: '3px',
                alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.2,
                }}>Ctrl + K</span>
              </Row>
            </Row>
          </Row>
          <Row style={{ gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <IconButton icon={<Bell size={20} color={isNotifOpen ? '#FBBF24' : 'rgba(255,255,255,0.5)'} />} variant="tertiary" onClick={() => setIsNotifOpen(!isNotifOpen)} style={{ borderRadius: '10px', transition: 'all 0.2s' }} />
              {/* Notification dot */}
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ED1B24', border: '2px solid #08080C' }} />

              {/* Notification Panel */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{
                      position: 'absolute', top: '48px', right: 0, zIndex: 100,
                      width: '360px',
                      backgroundColor: 'rgba(18,18,23,0.95)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    <Column style={{ padding: '16px 20px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <Heading variant="heading-strong-s" style={{ color: 'white' }}>Notifications</Heading>
                    </Column>

                    {/* Social */}
                    <Column style={{ padding: '12px 20px', gap: '10px' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Social</Text>
                      <Row style={{ gap: '10px', alignItems: 'center' }}>
                        <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop" size="s" />
                        <Column style={{ gap: '2px', flex: 1 }}>
                          <Text style={{ color: 'white', fontSize: '0.8rem' }}><strong>Ramona</strong> checked in at Phở 36</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>2 min ago</Text>
                        </Column>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D1B2' }} />
                      </Row>
                      <Row style={{ gap: '10px', alignItems: 'center' }}>
                        <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" size="s" />
                        <Column style={{ gap: '2px', flex: 1 }}>
                          <Text style={{ color: 'white', fontSize: '0.8rem' }}><strong>Khoa</strong> invited you to Coffee Lovers lobby</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>15 min ago</Text>
                        </Column>
                      </Row>
                    </Column>

                    {/* Deals */}
                    <Column style={{ padding: '12px 20px', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Deals</Text>
                      <Row style={{ gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={16} color="#FBBF24" />
                        </div>
                        <Column style={{ gap: '2px', flex: 1 }}>
                          <Text style={{ color: 'white', fontSize: '0.8rem' }}>30% off at Matcha Garden today!</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Expires in 3h</Text>
                        </Column>
                      </Row>
                    </Column>

                    {/* System */}
                    <Column style={{ padding: '12px 20px 16px', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>System</Text>
                      <Row style={{ gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Compass size={16} color="#A855F7" />
                        </div>
                        <Column style={{ gap: '2px', flex: 1 }}>
                          <Text style={{ color: 'white', fontSize: '0.8rem' }}>Your Taste Vector updated</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>+3 Spicy, +2 Street Food</Text>
                        </Column>
                      </Row>
                    </Column>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <IconButton icon={<MessageSquare size={20} color="rgba(255,255,255,0.5)" />} variant="tertiary" onClick={handleComingSoon} style={{ borderRadius: '10px' }} />
            <Row style={{ alignItems: 'center', gap: '10px', marginLeft: '12px', cursor: 'pointer' }} onClick={handleComingSoon}>
              <Avatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop" size="m" />
              <Column>
                <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Ramona F.</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Level 12</Text>
              </Column>
            </Row>
          </Row>
        </Row>

        {/* Main Content */}
        <Column fillWidth style={{ gap: '40px', padding: '32px 40px 48px 40px' }}>

          {/* ═══ 1. HERO BENTO: Map + Banner ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}>
            <Row fillWidth style={{ gap: '20px', height: '320px' }}>
              {/* Map Box */}
              <Column style={{
                width: '320px',
                minWidth: '320px',
                height: '320px',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}>
                <MapWidget />
              </Column>

              {/* Hero Banner */}
              <Column style={{
                flex: 1,
                minWidth: 0,
                height: '320px',
                borderRadius: '20px',
                backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&h=600&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.5) 55%, transparent 100%)' }} />

                <Column style={{ position: 'relative', zIndex: 10, justifyContent: 'center', padding: '36px 40px', height: '100%', gap: '16px' }}>
                  {/* Tags */}
                  <Row style={{ gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ padding: '5px 12px', backgroundColor: 'rgba(245,158,11,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', color: '#FBBF24', fontSize: '0.7rem', fontWeight: 700 }}>Ad • Sponsored</span>
                    <span style={{ padding: '5px 12px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '6px', color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>100XP / spot</span>
                    <Row style={{ padding: '5px 12px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', gap: '5px', alignItems: 'center' }}>
                      <CloudRain size={12} color="#60A5FA" />
                      <Text style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60A5FA' }}>Light Rain • 1.2km</Text>
                    </Row>
                  </Row>

                  {/* Title */}
                  <Heading variant="display-strong-m" style={{ color: 'white', lineHeight: 1.1 }}>
                    Weekend Street<br/>Food Tour
                  </Heading>

                  {/* Avatars */}
                  <Row style={{ gap: '0px', alignItems: 'center' }}>
                    <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop" size="s" style={{ border: '2px solid rgba(10,10,10,0.9)' }} />
                    <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop" size="s" style={{ marginLeft: '-10px', border: '2px solid rgba(10,10,10,0.9)' }} />
                    <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop" size="s" style={{ marginLeft: '-10px', border: '2px solid rgba(10,10,10,0.9)' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginLeft: '10px' }}>+5 friends tracking</Text>
                  </Row>

                  {/* CTA */}
                  <Row style={{ gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                    <Button size="l" onClick={() => router.push('/tour-builder')} style={{ backgroundColor: '#ED1B24', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                      <span style={{ position: 'relative', zIndex: 1 }}>Book Now</span>
                      <motion.div
                        initial={{ x: '-200%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 2 }}
                        style={{
                          position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          transform: 'skewX(-20deg)',
                          zIndex: 0,
                        }}
                      />
                    </Button>
                    <IconButton icon={<Navigation size={20} color="white" />} onClick={handleComingSoon} style={{
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }} />
                  </Row>
                </Column>
              </Column>
            </Row>
          </motion.div>

          {/* ═══ AI PICKS FOR YOU ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}>
            <Column fillWidth style={{ gap: '16px' }}>
              <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Row style={{ alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={20} color="#A855F7" />
                  <Heading variant="heading-strong-l" weight="strong" style={{ color: 'white' }}>AI Picks For You</Heading>
                </Row>
                <Text onClick={handleComingSoon} style={{ color: '#A855F7', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Refresh</Text>
              </Row>
              <Row className="no-scrollbar" fillWidth style={{ gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { title: 'Bún Bò Huế Cô Giào', reason: 'Because you love Spicy + Street Food', match: 97, price: '35k', img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&h=200&fit=crop', color: '#E63946' },
                  { title: 'The Alley Boba', reason: 'Popular with your friends', match: 92, price: '55k', img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=300&h=200&fit=crop', color: '#2A9D8F' },
                  { title: 'Ramen Shin Tokyo', reason: 'Trending in your area', match: 89, price: '95k', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop', color: '#FF6B35' },
                  { title: 'Rooftop BBQ Night', reason: 'Matches your Night Owl profile', match: 85, price: '180k', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop', color: '#7B2FF7' },
                ].map((pick, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => router.push('/tour-builder')}
                    style={{
                      minWidth: '260px', borderRadius: '16px', overflow: 'hidden',
                      backgroundColor: '#121217', border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
                      <img src={pick.img} alt={pick.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${pick.color}30 100%)` }} />
                      <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '8px' }}>
                        <Text style={{ color: '#FBBF24', fontSize: '0.7rem', fontWeight: 700 }}>{pick.match}%</Text>
                      </div>
                    </div>
                    <Column style={{ padding: '14px 16px', gap: '6px' }}>
                      <Text style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{pick.title}</Text>
                      <Row style={{ gap: '6px', alignItems: 'center' }}>
                        <Sparkles size={10} color={pick.color} />
                        <Text style={{ color: pick.color, fontSize: '0.7rem', fontWeight: 600 }}>{pick.reason}</Text>
                      </Row>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>~{pick.price} VND</Text>
                    </Column>
                  </motion.div>
                ))}
              </Row>
            </Column>
          </motion.div>

          {/* ═══ 2. TRENDING REELS ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}>
            <Column fillWidth style={{ gap: '16px' }}>
              <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Row style={{ alignItems: 'center', gap: '10px' }}>
                  <Flame size={20} color="#ED1B24" />
                  <Heading variant="heading-strong-l" weight="strong" style={{ color: 'white' }}>Trending Reels</Heading>
                </Row>
                <Text onClick={handleComingSoon} style={{ color: '#ED1B24', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}>View all</Text>
              </Row>
            <Row className="no-scrollbar" fillWidth style={{ gap: '16px', overflowX: 'auto', paddingBottom: '4px', scrollBehavior: 'smooth' }}>
              {MOCK_REELS.map((reel, idx) => (
                <div key={idx} onClick={() => setSelectedReel(reel)} style={{ cursor: 'pointer' }}>
                  <ReelCard
                    title={reel.title}
                    user={reel.user}
                    views={reel.views}
                    avatar={reel.userAvatar}
                    img={reel.img}
                    delay={idx * 0.05}
                  />
                </div>
              ))}
            </Row>
            </Column>
          </motion.div>

          {/* ═══ 3. DYNAMIC CONTEXTUAL SUGGESTIONS ═══ */}
          {(() => {
            const ctx = getDynamicContext();
            return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}>
                <Column fillWidth style={{ gap: '16px' }}>
                  <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Row style={{ alignItems: 'center', gap: '10px' }}>
                      {ctx.icon}
                      <Heading variant="heading-strong-l" weight="strong" style={{ color: 'white' }}>{ctx.title}</Heading>
                      <Row style={{ gap: '6px', marginLeft: '8px' }}>
                      {ctx.tags.map((tag) => (
                        <span key={tag} style={{
                          padding: '3px 10px',
                          backgroundColor: `${ctx.accent}15`,
                          border: `1px solid ${ctx.accent}30`,
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: ctx.accent,
                        }}>{tag}</span>
                      ))}
                    </Row>
                  </Row>
                  <Row onClick={handleComingSoon} style={{ alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <Sparkles size={14} color={ctx.accent} />
                    <Text style={{ color: ctx.accent, fontSize: '0.85rem', fontWeight: 600 }}>AI Picks</Text>
                  </Row>
                </Row>
                <Row className="no-scrollbar" fillWidth style={{ gap: '16px', overflowX: 'auto', paddingBottom: '4px', scrollBehavior: 'smooth' }}>
                  <ContextCard
                    title="Phở Bò 36 Lý Quốc Sư"
                    subtitle="Open until 2AM • 0.8km away"
                    match={94}
                    accent={ctx.accent}
                    img="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=250&fit=crop"
                    delay={0}
                  />
                  <ContextCard
                    title="Bánh Tráng Trộn Cô Ba"
                    subtitle="Trending tonight • 1.2km away"
                    match={87}
                    accent={ctx.accent}
                    img="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop"
                    delay={0.05}
                  />
                  <ContextCard
                    title="Cơm Tấm Sườn Bì Chả"
                    subtitle="Crowded now • 0.5km away"
                    match={91}
                    accent={ctx.accent}
                    img="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=250&fit=crop"
                    delay={0.1}
                  />
                  <ContextCard
                    title="Kem Bơ Thanh Long"
                    subtitle="Just opened • 2.1km away"
                    match={78}
                    accent={ctx.accent}
                    img="https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=250&fit=crop"
                    delay={0.15}
                  />
                  <ContextCard
                    title="Bún Riêu Cua Đồng"
                    subtitle="Top rated • 1.5km away"
                    match={85}
                    accent={ctx.accent}
                    img="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=250&fit=crop"
                    delay={0.2}
                  />
                </Row>
                </Column>
              </motion.div>
            );
          })()}

          {/* ══ Live Group Lobbies ══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}>
            <Column fillWidth style={{ gap: '20px' }}>
              <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Row style={{ alignItems: 'center', gap: '10px' }}>
                  <Users size={20} color="#00D1B2" />
                  <Heading variant="heading-strong-l" weight="strong" style={{ color: 'white' }}>Live Group Lobbies</Heading>
                  <span style={{ padding: '2px 8px', backgroundColor: 'rgba(0,209,178,0.15)', border: '1px solid rgba(0,209,178,0.3)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, color: '#00D1B2' }}>4 Active</span>
              </Row>
              <Row style={{ gap: '8px' }}>
                <IconButton icon={<ChevronLeft size={18} color="rgba(255,255,255,0.6)" />} onClick={() => scrollList(groupToursRef, 'left')} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer' }} />
                <IconButton icon={<ChevronRight size={18} color="rgba(255,255,255,0.6)" />} onClick={() => scrollList(groupToursRef, 'right')} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer' }} />
              </Row>
            </Row>
            <Row ref={groupToursRef} className="no-scrollbar" fillWidth style={{ overflowX: 'auto', gap: '16px', paddingBottom: '8px', scrollBehavior: 'smooth' }}>
              {MOCK_LOBBIES.map((lobby, idx) => (
                <LobbyCard
                  key={idx}
                  title={lobby.name}
                  desc={lobby.route}
                  img={lobby.bg}
                  status={`${lobby.spots - lobby.members.length} spots left`}
                  members={lobby.members.length}
                  delay={idx * 0.05}
                  onJoin={() => setSelectedLobby(lobby)}
                />
              ))}
            </Row>
          </Column>
        </motion.div>

        {/* ══ The Taste Vault ══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}>
          <Column fillWidth style={{ gap: '20px' }}>
            <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Row style={{ alignItems: 'center', gap: '10px' }}>
                <Bookmark size={20} color="#FBBF24" />
                <Heading variant="heading-strong-l" weight="strong" style={{ color: 'white' }}>The Taste Vault</Heading>
              </Row>
              <Row style={{ gap: '8px' }}>
                <IconButton icon={<ChevronLeft size={18} color="rgba(255,255,255,0.6)" />} onClick={() => scrollList(eatItAgainRef, 'left')} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer' }} />
                <IconButton icon={<ChevronRight size={18} color="rgba(255,255,255,0.6)" />} onClick={() => scrollList(eatItAgainRef, 'right')} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer' }} />
              </Row>
            </Row>
            <Row ref={eatItAgainRef} className="no-scrollbar" fillWidth style={{ overflowX: 'auto', gap: '16px', paddingBottom: '8px', scrollBehavior: 'smooth' }}>
              <VaultCard title="Banh Mi Pho 古" xp="10XP" img="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=520&h=360&fit=crop" tags="Vietnamese • Street Food" rating={4.8} delay={0.05} />
              <VaultCard title="Neon Diner" xp="15XP" img="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=520&h=360&fit=crop" tags="American • Retro" rating={4.2} delay={0.1} />
              <VaultCard title="Matcha Room" xp="30XP" img="https://images.unsplash.com/photo-1582787895088-2ff176b668d2?w=520&h=360&fit=crop" tags="Japanese • Cafe" rating={4.6} delay={0.15} />
              <VaultCard title="Sky Bar" xp="10XP" img="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=520&h=360&fit=crop" tags="Cocktails • View" rating={4.4} delay={0.2} />
              <VaultCard title="Phở Sáng" xp="20XP" img="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=520&h=360&fit=crop" tags="Vietnamese • Breakfast" rating={4.9} delay={0.25} />
            </Row>
          </Column>
        </motion.div>

        {/* ═══════════ FOODIE FEED (Horizontal Carousel) ═══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}>
          <Column fillWidth style={{ gap: '20px' }}>
            {/* Feed Header */}
            <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Row style={{ alignItems: 'center', gap: '10px' }}>
                <MessageCircle size={20} color="#ED1B24" />
                <Heading variant="heading-strong-l" weight="strong" style={{ color: 'white' }}>Foodie Feed</Heading>
              </Row>
              <Row style={{ gap: '8px', alignItems: 'center' }}>
                <IconButton icon={<SlidersHorizontal size={18} color="rgba(255,255,255,0.5)" />} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '32px', height: '32px' }} />
                <Button size="s" variant="secondary" style={{ borderRadius: '10px' }}>Local: Dĩ An</Button>
              </Row>
            </Row>

            {/* Horizontal Feed Cards */}
            <Row className="no-scrollbar" fillWidth style={{ overflowX: 'auto', gap: '16px', paddingBottom: '8px', scrollBehavior: 'smooth' }}>
              {MOCK_POSTS.map((post, idx) => (
                <div key={idx} onClick={() => setSelectedPost(post)}>
                  <PostCard
                    {...post}
                    delay={idx * 0.05}
                  />
                </div>
              ))}
            </Row>
          </Column>
        </motion.div>
      </Column>

      {/* ═══ MINI STATUS BAR (Dashboard Footer) ═══ */}
          <Row fillWidth style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 40px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            backgroundColor: 'rgba(10,10,10,0.5)',
            flexShrink: 0,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>TasteMap v1.0.0-beta</Text>
            <Row style={{ alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00D1B2', boxShadow: '0 0 4px #00D1B260' }} />
              <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>All systems operational</Text>
            </Row>
            <Row style={{ gap: '16px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', cursor: 'pointer', transition: 'color 0.2s' }} onClick={handleComingSoon}>Feedback</Text>
              <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', cursor: 'pointer', transition: 'color 0.2s' }} onClick={handleComingSoon}>Terms</Text>
            </Row>
          </Row>
      </Column>

      {/* ═══════════ MODALS ═══════════ */}
      <AnimatePresence>
        {selectedReel && <ReelModal data={selectedReel as any} onClose={() => setSelectedReel(null)} />}
        {selectedLobby && <LobbyModal data={selectedLobby as any} onClose={() => setSelectedLobby(null)} />}
        {selectedPost && <PostModal data={selectedPost as any} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>

      {/* ═══════════ 3. RIGHT SIDEBAR (Social Tracking Panel) ═══════════ */}
      {(() => {
        const friends = [
          { name: 'Ramona F.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop', status: 'eating' as const, statusText: '🍜 On a Spicy Tour' },
          { name: 'Mai Linh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop', status: 'online' as const, statusText: '🟢 Online' },
          { name: 'Thảo Vy', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop', status: 'lobby' as const, statusText: '🎮 In Group Lobby' },
          { name: 'Hùng Đạt', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop', status: 'eating' as const, statusText: '☕ Cafe Hopping' },
          { name: 'Khôi Nguyên', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop', status: 'online' as const, statusText: '🟢 Online' },
        ];

        const statusDotColor = (s: typeof friends[0]['status']) =>
          s === 'eating' ? '#F59E0B' : s === 'lobby' ? '#A855F7' : '#00D1B2';
        const statusTextColor = (s: typeof friends[0]['status']) =>
          s === 'eating' ? '#F59E0B' : s === 'lobby' ? '#A855F7' : '#00D1B2';

        return (
          <Column
            onMouseEnter={() => setIsRightExpanded(true)}
            onMouseLeave={() => setIsRightExpanded(false)}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: isRightExpanded ? '280px' : '80px',
              zIndex: 50,
              backgroundColor: '#121217',
              borderLeft: '1px solid rgba(255,255,255,0.04)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              paddingTop: '24px',
            }}
          >
            {/* Top Action */}
            <Row style={{
              padding: '0 18px 20px 18px',
              alignItems: 'center',
              justifyContent: isRightExpanded ? 'space-between' : 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              paddingBottom: '20px',
              gap: '12px',
              minHeight: '44px',
            }}>
              {isRightExpanded && (
                <Heading variant="heading-strong-s" style={{ color: 'white', whiteSpace: 'nowrap', opacity: isRightExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s' }}>Friends</Heading>
              )}
              <IconButton
                icon={<Plus size={20} color="#ED1B24" />}
                onClick={() => setIsCreateRoomOpen(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  flexShrink: 0,
                }}
              />
            </Row>

            {/* Friend List */}
            <Column style={{ gap: '4px', paddingTop: '16px', overflowY: 'auto', flex: 1 }}>
              {friends.map((f) => (
                <Row
                  key={f.name}
                  style={{
                    padding: '10px 18px',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    margin: '0 8px',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { if (isRightExpanded) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Avatar with Status Dot */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar src={f.avatar} size="m" />
                    <div style={{
                      position: 'absolute', bottom: 1, right: -1,
                      width: '12px', height: '12px',
                      backgroundColor: statusDotColor(f.status),
                      borderRadius: '50%',
                      border: '2px solid #111111',
                      boxShadow: `0 0 6px ${statusDotColor(f.status)}60`,
                    }} />
                  </div>

                  {/* Expanded Details */}
                  <Row style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isRightExpanded ? 1 : 0,
                    transition: 'opacity 0.2s ease 0.1s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    minWidth: 0,
                  }}>
                    {/* Info */}
                    <Column style={{ gap: '2px', minWidth: 0 }}>
                      <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{f.name}</Text>
                      <Text style={{ color: statusTextColor(f.status), fontSize: '0.65rem', fontWeight: 500 }}>{f.statusText}</Text>
                    </Column>

                    {/* Actions */}
                    {isRightExpanded && (
                      <Row style={{ gap: '4px', flexShrink: 0 }}>
                        <IconButton
                          icon={<MessageCircle size={14} color="rgba(255,255,255,0.5)" />}
                          variant="tertiary"
                          style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)' }}
                        />
                        <IconButton
                          icon={<Beer size={14} color="#F59E0B" />}
                          variant="tertiary"
                          style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.08)' }}
                        />
                      </Row>
                    )}
                  </Row>
                </Row>
              ))}
            </Column>

            {/* Bottom Online Count */}
            <Row style={{
              padding: '16px 18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              alignItems: 'center',
              justifyContent: isRightExpanded ? 'flex-start' : 'center',
              gap: '8px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D1B2', boxShadow: '0 0 6px #00D1B260' }} />
              {isRightExpanded && (
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>3 friends online</Text>
              )}
            </Row>
          </Column>
        );
      })()}

      {/* ═══════════ MODAL ═══════════ */}
      <AnimatePresence>
        {isCreateRoomOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: '420px', backgroundColor: '#121217', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', padding: '32px' }}
            >
              <Row fillWidth style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Heading variant="heading-strong-l" style={{ color: 'white' }}>Start Group Room</Heading>
                <IconButton icon={<X size={18} color="rgba(255,255,255,0.6)" />} onClick={() => setIsCreateRoomOpen(false)} variant="tertiary" style={{ cursor: 'pointer' }} />
              </Row>
              <Column style={{ gap: '24px' }}>
                <Column style={{ gap: '8px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Room Name</Text>
                  <Input placeholder="e.g. Saturday Midnight Snacks" style={{ borderRadius: '12px', padding: '14px 16px' }} />
                </Column>
                <Column style={{ gap: '8px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Invite Foodies</Text>
                  <Row style={{ gap: '16px', flexWrap: 'wrap' }}>
                    <Column style={{ alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <Avatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop" size="m" />
                      <Text style={{ color: 'white', fontSize: '0.7rem' }}>Ramona</Text>
                    </Column>
                    <Column style={{ alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop" size="m" />
                      <Text style={{ color: 'white', fontSize: '0.7rem' }}>Jane</Text>
                    </Column>
                    <Column style={{ alignItems: 'center', gap: '6px', cursor: 'pointer', opacity: 0.4 }}>
                      <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop" size="m" />
                      <Text style={{ color: 'white', fontSize: '0.7rem' }}>Mike</Text>
                    </Column>
                  </Row>
                </Column>
                <Button size="l" onClick={() => setIsCreateRoomOpen(false)} style={{ marginTop: '8px', borderRadius: '12px' }}>Initialize Minimax Engine</Button>
              </Column>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Row>
  );
}

// ═══════════ SUB-COMPONENTS ═══════════ //

function SidebarItem({ icon, label, active = false, collapsed = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; collapsed?: boolean; onClick?: () => void }) {
  return (
    <Row onClick={onClick} style={{
      padding: collapsed ? '10px 0' : '10px 12px',
      borderRadius: '10px',
      backgroundColor: active ? 'rgba(255,255,255,0.06)' : 'transparent',
      cursor: 'pointer',
      borderLeft: active ? '3px solid #ED1B24' : '3px solid transparent',
      color: active ? 'white' : 'rgba(255,255,255,0.5)',
      transition: 'all 0.25s ease',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      gap: collapsed ? '0px' : '14px',
      overflow: 'hidden',
      minHeight: '42px',
    }}>
      <div style={{ color: 'inherit', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</div>
      {!collapsed && (
        <Text style={{ color: 'inherit', fontWeight: active ? 600 : 400, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{label}</Text>
      )}
    </Row>
  );
}

// ═════════ LOBBY CARD ═════════ //

const lobbyAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop',
];

function LobbyCard({ title, desc, img, status, members, delay, onJoin }: { title: string; desc: string; img: string; status: string; members: number; delay: number; onJoin?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 40px rgba(0,209,178,0.2)' }}
      style={{ borderRadius: '16px', flexShrink: 0 }}
    >
      <Column style={{
        minWidth: '300px', height: '165px', borderRadius: '16px',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        padding: '20px',
        justifyContent: 'space-between',
      }}>
        {/* Background image + heavy dark overlay for glassmorphism */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px) brightness(0.3)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }} />
        <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', pointerEvents: 'none' }} />

        {/* Top Row — Status */}
        <Row style={{ position: 'relative', zIndex: 2, justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Row style={{ alignItems: 'center', gap: '8px' }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D1B2' }}
            />
            <Text style={{ color: '#00D1B2', fontSize: '0.75rem', fontWeight: 700 }}>{status}</Text>
          </Row>
          <Users size={16} color="rgba(255,255,255,0.35)" />
        </Row>

        {/* Middle — Content */}
        <Column style={{ position: 'relative', zIndex: 2, gap: '2px' }}>
          <Text style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>{title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>{desc}</Text>
        </Column>

        {/* Bottom — Avatars + Join */}
        <Row style={{ position: 'relative', zIndex: 2, justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
          <Row style={{ alignItems: 'center' }}>
            {lobbyAvatars.slice(0, members).map((src, i) => (
              <Avatar key={i} src={src} size="s" style={{ border: '2px solid rgba(20,20,20,0.9)', marginLeft: i > 0 ? '-8px' : '0', zIndex: members - i }} />
            ))}
          </Row>
          <Button size="s" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onJoin?.(); }} style={{ backgroundColor: '#00D1B2', color: '#000', fontWeight: 700, borderRadius: '10px', padding: '6px 18px', fontSize: '0.8rem', border: 'none' }}>Join</Button>
        </Row>
      </Column>
    </motion.div>
  );
}

// ═════════ VAULT CARD ═════════ //

function VaultCard({ title, xp, img, tags, rating, delay }: { title: string; xp: string; img: string; tags: string; rating: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 40px rgba(251,191,36,0.2)' }}
      style={{ borderRadius: '16px', flexShrink: 0 }}
    >
      <Column style={{
        minWidth: '260px', height: '180px', borderRadius: '16px',
        position: 'relative', cursor: 'pointer', overflow: 'hidden',
      }}>
        {/* Full-cover image */}
        <img src={img} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Heavy gradient for text readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

        {/* XP badge — top left */}
        <Row style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 3,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          padding: '4px 10px', borderRadius: '8px', gap: '4px', alignItems: 'center',
          border: '1px solid rgba(251,191,36,0.3)',
        }}>
          <Sparkles size={10} color="#FBBF24" />
          <Text style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FBBF24' }}>{xp}</Text>
        </Row>

        {/* Rating badge — top right */}
        <Row style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 3,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          padding: '4px 8px', borderRadius: '8px', gap: '3px', alignItems: 'center',
        }}>
          <Star size={11} color="#FBBF24" fill="#FBBF24" />
          <Text style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FBBF24' }}>{rating}</Text>
        </Row>

        {/* Bottom content */}
        <Column style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 2, padding: '16px', gap: '3px' }}>
          <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{tags}</Text>
        </Column>
      </Column>
    </motion.div>
  );
}

function AvatarWithStatus({ src, status }: { src: string; status: 'online' | 'offline' | 'busy' | 'eating' | 'lobby' }) {
  const color = status === 'online' ? '#00D1B2' : status === 'eating' ? '#F59E0B' : status === 'lobby' ? '#A855F7' : status === 'busy' ? '#ED1B24' : 'rgba(255,255,255,0.2)';
  return (
    <div style={{ position: 'relative' }}>
      <Avatar src={src} size="m" />
      <div style={{ position: 'absolute', bottom: 1, right: -1, width: '11px', height: '11px', backgroundColor: color, borderRadius: '50%', border: '2px solid #111111', boxShadow: `0 0 6px ${color}60` }} />
    </div>
  );
}

// ═══════════ SKELETONS ═══════════ //

function SkeletonGroupCard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', minWidth: '240px', height: '130px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </motion.div>
  );
}

function ContextCard({ title, subtitle, match, accent, img, delay }: { title: string; subtitle: string; match: number; accent: string; img: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: `0 12px 40px ${accent}30` }}
      style={{ borderRadius: '16px', flexShrink: 0 }}
    >
      <Column style={{
        width: '260px',
        minWidth: '260px',
        borderRadius: '16px',
        backgroundColor: '#121217',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}>
        {/* Thumbnail */}
        <div style={{
          width: '100%',
          height: '140px',
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}>
          {/* Match badge */}
          <Row style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '8px',
            gap: '4px',
            alignItems: 'center',
            border: `1px solid ${accent}40`,
          }}>
            <Sparkles size={11} color={accent} />
            <Text style={{ fontSize: '0.7rem', fontWeight: 700, color: accent }}>{match}% match</Text>
          </Row>
          {/* Distance badge */}
          <Row style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '3px 8px',
            borderRadius: '6px',
            gap: '4px',
            alignItems: 'center',
          }}>
            <Navigation size={10} color="rgba(255,255,255,0.6)" />
            <Text style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Dĩ An</Text>
          </Row>
        </div>
        {/* Info */}
        <Column style={{ padding: '14px 16px', gap: '4px' }}>
          <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{subtitle}</Text>
        </Column>
      </Column>
    </motion.div>
  );
}

function SkeletonThumbnailCard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', minWidth: '300px', height: '180px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </motion.div>
  );
}

// ═════════ POST CARD (Compact Horizontal) ═════════ //

function PostCard({ name, avatar, time, location, spotName, rating, review, img, tags, likes, comments, delay }: {
  name: string; avatar: string; time: string; location: string; spotName: string;
  rating: number; review: string; img: string; tags: string[]; likes: number; comments: number; delay: number;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  return (
    <motion.div
      layout
      style={{ borderRadius: '16px', flexShrink: 0 }}
    >
      <motion.div
        layout
        whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 40px rgba(237,27,36,0.15)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ layout: { duration: 0.3, type: 'spring', bounce: 0.2 }, duration: 0.4, delay }}
        style={{
          minWidth: '340px',
          maxWidth: '340px',
          backgroundColor: '#121217',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Half — Image with overlays */}
        <Column style={{ height: '200px', width: '100%', position: 'relative' }}>
          <img src={img} alt={spotName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {/* Vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

          {/* User info overlay — top left */}
          <Row style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 3,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            padding: '5px 10px', borderRadius: '10px', gap: '8px', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Avatar src={avatar} size="s" />
            <Column>
              <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>{time} • {location}</Text>
            </Column>
          </Row>

          {/* Rating — top right */}
          <Row style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 3,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            padding: '4px 8px', borderRadius: '8px', gap: '3px', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Star size={11} color="#FBBF24" fill="#FBBF24" />
            <Text style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FBBF24' }}>{rating}</Text>
          </Row>
        </Column>

        {/* Bottom Half — Content */}
        <Column style={{ padding: '16px', gap: '12px' }}>
          {/* Location */}
          <Row style={{ alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="rgba(255,255,255,0.4)" />
            <Text style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{spotName}</Text>
          </Row>

          {/* Truncated Review */}
          <motion.div layout>
            <Text style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              ...(isExpanded ? {} : {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }),
            }}>{review}</Text>
          </motion.div>

          {/* Xem thêm Toggle */}
          <Text
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            style={{ color: '#ED1B24', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginTop: '-4px' }}
          >{isExpanded ? 'Ẩn bớt' : 'Xem thêm'}</Text>

          {/* Tags */}
          <Row style={{ gap: '6px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <span key={tag} style={{
                padding: '3px 8px',
                backgroundColor: 'rgba(237,27,36,0.08)',
                border: '1px solid rgba(237,27,36,0.15)',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#ED1B24',
              }}>{tag}</span>
            ))}
          </Row>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* Action Bar */}
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Row style={{ alignItems: 'center', gap: '4px' }}>
              <Row
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                style={{
                  alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: isLiked ? 'rgba(237,27,36,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Heart size={14} color={isLiked ? '#ED1B24' : 'rgba(255,255,255,0.45)'} fill={isLiked ? '#ED1B24' : 'none'} />
                <Text style={{ fontSize: '0.7rem', fontWeight: 600, color: isLiked ? '#ED1B24' : 'rgba(255,255,255,0.45)' }}>{isLiked ? likes + 1 : likes}</Text>
              </Row>
              <Row style={{ alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px' }}>
                <MessageCircle size={14} color="rgba(255,255,255,0.45)" />
                <Text style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>{comments}</Text>
              </Row>
            </Row>
            <Row
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsSaved(!isSaved); }}
              style={{
                alignItems: 'center', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer',
                backgroundColor: isSaved ? 'rgba(96,165,250,0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Bookmark size={14} color={isSaved ? '#60A5FA' : 'rgba(255,255,255,0.45)'} fill={isSaved ? '#60A5FA' : 'none'} />
            </Row>
          </Row>
        </Column>
      </motion.div>
    </motion.div>
  );
}



function ReelCard({ title, user, views, avatar, img, delay }: { title: string; user: string; views: string; avatar: string; img: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 40px rgba(237,27,36,0.2)' }}
      style={{ borderRadius: '16px', flexShrink: 0 }}
    >
      <Column style={{
        width: '180px',
        minWidth: '180px',
        height: '320px',
        borderRadius: '16px',
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}>
        {/* Dark vignette overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 100%)' }} />

        {/* Views badge — top right */}
        <Row style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: '6px',
          gap: '4px',
          alignItems: 'center',
        }}>
          <Eye size={10} color="rgba(255,255,255,0.7)" />
          <Text style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{views}</Text>
        </Row>

        {/* Center play button */}
        <Column style={{
          position: 'absolute',
          inset: 0,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 5,
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}>
            <Play size={18} color="white" fill="white" />
          </div>
        </Column>

        {/* Bottom content */}
        <Column style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          zIndex: 10,
          padding: '14px',
          gap: '8px',
        }}>
          <Text style={{
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{title}</Text>
          <Row style={{ alignItems: 'center', gap: '6px' }}>
            <Avatar src={avatar} size="xs" />
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', fontWeight: 500 }}>{user}</Text>
          </Row>
        </Column>
      </Column>
    </motion.div>
  );
}
