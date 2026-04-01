"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  IconButton,
} from "@/components/OnceUI";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Sparkles,
  Clock,
  DollarSign,
  Route,
  Undo2,
  Map as MapIcon,
  User,
  Users,
  PieChart,
  Activity,
  Info,
  X,
  Bell,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Tour Builder tokens & components
import { surface, accent, text, border, radius, shadow } from "./tokens";
import {
  TimelineNode,
  TimelineConnector,
  StatPill,
  StatusBadge,
  RouteChip,
} from "./components";
import { useUserVector } from "@/context/UserVectorContext";
import { FloatingInsight, FlavorAura } from "@/components/FloatingInsight";
import { RouteChip as RouteChipComponent } from "./components/RouteChip";
import { StatusBadge as StatusBadgeComponent } from "./components/StatusBadge";
import { StopCard } from "./components/StopCard";
import { TourSkeleton } from "./components/TourSkeleton";
import ClientOnly from "@/components/common/ClientOnly";
import { MOCK_USER } from "@/constants/mock-data";

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: surface.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: radius.full,
          border: `2px solid ${border.medium}`,
          borderTopColor: accent.primary,
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  ),
});

// ═══════════ CARD DATA ═══════════ //
interface CardData {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  match: number;
  distance: string;
  price: string;
  img: string;
  color: string;
  location: [number, number];
}

const FOOD_CARDS: CardData[] = [
  {
    id: 1,
    title: "Bánh Mì Cô Thúy",
    subtitle: "Street Food • Dĩ An",
    tags: ["Street Food", "Budget", "Spicy"],
    match: 98,
    distance: "0.8km",
    price: "25k",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=900&fit=crop",
    color: "#FF6B35",
    location: [10.897, 106.772],
  },
  {
    id: 2,
    title: "Neon Ramen House",
    subtitle: "Japanese • District 1",
    tags: ["Spicy", "Group", "Nightlife"],
    match: 94,
    distance: "2.1km",
    price: "120k",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=900&fit=crop",
    color: "#E63946",
    location: [10.905, 106.773],
  },
  {
    id: 3,
    title: "Matcha Garden",
    subtitle: "Cafe • Thủ Đức",
    tags: ["Quiet", "Sweet", "Aesthetic"],
    match: 91,
    distance: "1.5km",
    price: "65k",
    img: "https://images.unsplash.com/photo-1582787895088-2ff176b668d2?w=600&h=900&fit=crop",
    color: "#2A9D8F",
    location: [10.898, 106.769],
  },
  {
    id: 4,
    title: "Sky Lounge",
    subtitle: "Cocktails • Rooftop",
    tags: ["Luxury", "Group", "Nightlife"],
    match: 87,
    distance: "3.2km",
    price: "200k",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=900&fit=crop",
    color: "#7B2FF7",
    location: [10.902, 106.778],
  },
  {
    id: 5,
    title: "Phở Sáng Sóm",
    subtitle: "Vietnamese • Bình Dương",
    tags: ["Street Food", "Quiet", "Breakfast"],
    match: 96,
    distance: "0.5km",
    price: "45k",
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=900&fit=crop",
    color: "#F4A261",
    location: [10.895, 106.771],
  },
  {
    id: 6,
    title: "BBQ Midnight",
    subtitle: "Grill • Late Night",
    tags: ["Group", "Spicy", "Nightlife"],
    match: 89,
    distance: "1.8km",
    price: "150k",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=900&fit=crop",
    color: "#E76F51",
    location: [10.899, 106.775],
  },
];

const TOTAL_NODES = 4;

export default function TourBuilderPage() {
  const pathname = usePathname();
  const [deck, setDeck] = useState<CardData[]>(FOOD_CARDS);
  const [filledNodes, setFilledNodes] = useState<(CardData | null)[]>(
    Array(TOTAL_NODES).fill(null),
  );
  const [isTourReady, setIsTourReady] = useState(false);
  const [discardDir, setDiscardDir] = useState<"left" | "right" | null>(null);
  const [lastDiscarded, setLastDiscarded] = useState<CardData | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { radarData, isPulsing, updateVector } = useUserVector();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // New Team/Curation states
  const [targetDishCount, setTargetDishCount] = useState(4);
  const [memberReadyCount, setMemberReadyCount] = useState(1); 
  const [totalMemberCount, setTotalMemberCount] = useState(1);

  const LOADING_MESSAGES = [
    "Brewing the perfect evening vibe...",
    "Optimizing your flavor discovery path...",
    "Consulting the taste stars for you...",
    "Syncing your cravings with the city...",
    "Almost there... making it extra delicious...",
  ];

  useEffect(() => {
    if (isGenerating) {
      let i = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      const interval = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[i]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const nextEmptyIndex = filledNodes.findIndex((n) => n === null);
  const activeCard = deck[0] ?? null;
  const activeColor = activeCard?.color ?? "#007AFF";

  // Dynamic Tour DNA calculation
  const getTourDNA = useCallback(() => {
    const selectedFoods = filledNodes.filter((n): n is CardData => n !== null);
    if (selectedFoods.length === 0) return [{ label: "Empty", value: 100, color: 'rgba(0,0,0,0.05)' }];
    
    const tagCounts: Record<string, number> = {};
    selectedFoods.forEach(food => {
      food.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const totalTags = Object.values(tagCounts).reduce((a, b) => a + b, 0);
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([label, count], i) => ({
        label,
        value: (count / totalTags) * 100,
        color: i === 0 ? accent.primary : i === 1 ? accent.secondary : accent.warning
      }));
      
    return topTags;
  }, [filledNodes]);

  const tourDNA = getTourDNA();

  // Auto-dismiss undo after 5s
  useEffect(() => {
    if (lastDiscarded) {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setLastDiscarded(null), 5000);
    }
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [lastDiscarded]);

  const handleUndo = useCallback(() => {
    if (!lastDiscarded) return;
    setDeck((prev) => [lastDiscarded, ...prev]);
    setLastDiscarded(null);
  }, [lastDiscarded]);

  const handleManualAction = useCallback((direction: "select" | "skip") => {
    if (!activeCard) return;
    const card = activeCard;

    if (direction === "select" && nextEmptyIndex !== -1) {
      updateVector(card.tags, "select");
      setDiscardDir("right");
      setFilledNodes((prev) => {
        const next = [...prev];
        next[nextEmptyIndex] = card;
        return next;
      });
      setTimeout(() => {
        setDeck((prev) => prev.slice(1));
        setDiscardDir(null);
      }, 300);
    } else if (direction === "skip") {
      updateVector(card.tags, "skip");
      setDiscardDir("left");
      setTimeout(() => {
        setDeck((prev) => prev.slice(1));
        setDiscardDir(null);
        setLastDiscarded(card);
      }, 300);
    }
  }, [activeCard, nextEmptyIndex, updateVector]);

  // ─── Drag Logic ─── //
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipeThreshold = 140;

      // Swipe RIGHT -> CHOOSE (SELECT)
      if (offset.x > swipeThreshold || velocity.x > 500) {
         handleManualAction('select');
         return;
      }

      // Swipe LEFT -> SKIP
      if (offset.x < -swipeThreshold || velocity.x < -500) {
         handleManualAction('skip');
         return;
      }
    },
    [handleManualAction],
  );

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGenerating || isTourReady) return;
      if (e.key === "ArrowRight") handleManualAction("select");
      if (e.key === "ArrowLeft") handleManualAction("skip");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualAction, isGenerating, isTourReady]);

  const x = useMotionValue(0);
  const skipGlowOpacity = useTransform(x, [0, -200], [0, 0.4]);
  const saveGlowOpacity = useTransform(x, [0, 200], [0, 0.5]);

  if (isTourReady) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%", height: "100%", position: "relative", backgroundColor: surface.page }}>
        <ClientOnly>
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <MapWidget 
              mapId="tour-final-background"
              points={filledNodes.filter((n): n is CardData => n !== null).map(n => n.location)}
              center={[10.897, 106.772]} zoom={13}
            />
          </div>
        </ClientOnly>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(248,250,255,0.1), rgba(248,250,255,0.6))", zIndex: 1 }} />
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", zIndex: 10, width: "680px", maxWidth: "92vw", backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(40px)", borderRadius: "32px", padding: "32px 40px", boxShadow: shadow.elevated, border: `1px solid ${border.medium}` }}>
          <Column style={{ gap: "24px" }}>
            <Row fillWidth horizontal="between" vertical="center" style={{ gap: "24px" }}>
              <Column style={{ flex: 1, gap: "4px" }}>
                <Heading variant="heading-strong-l">Your Tour is Ready!</Heading>
                <Text style={{ color: text.secondary, fontSize: "0.9rem" }}>{filledNodes.filter(Boolean).length} stops curated by your Taste Vector</Text>
              </Column>
              
              <Row horizontal="end" style={{ flex: 0 }}>
                <Link href="/">
                  <IconButton icon={<ChevronLeft size={20} />} style={{ borderRadius: "14px", border: `1px solid ${border.medium}` }} />
                </Link>
              </Row>
            </Row>
            <Row style={{ gap: "12px", justifyContent: "center", alignItems: 'center' }}>
              {filledNodes.map((node, i) => (
                <React.Fragment key={i}>
                  <TimelineNode
                    index={i}
                    imageUrl={node?.img}
                    color={node?.color}
                    isFilled={!!node}
                  />
                  {i < filledNodes.length - 1 && <TimelineConnector isActive={!!filledNodes[i + 1]} />}
                </React.Fragment>
              ))}
            </Row>
          </Column>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <Column fillHeight gap="0" style={{ flex: 1, backgroundColor: "#F8FAFF", overflow: "hidden", display: 'flex', flexDirection: 'column', paddingBottom: '0', paddingTop: '0', justifyContent: 'space-between' }}>
      <AnimatePresence>
        <motion.div key={activeColor} initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${activeColor}, transparent 70%)`, filter: "blur(100px)", pointerEvents: "none" }} />
      </AnimatePresence>

      {/* 1. TOP IDENTITY BAR - FLEX SHRINK 0 */}
      <div style={{ width: '100%', zIndex: 100, flexShrink: 0 }}>
        <Row 
          fillWidth 
          horizontal="between" 
          vertical="center" 
          style={{ 
            height: "80px", 
            paddingTop: "0",
            paddingBottom: "0",
            paddingLeft: "40px",
            paddingRight: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.65)", 
            backdropFilter: "blur(32px) saturate(180%)", 
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "rgba(0, 122, 255, 0.08)",
            borderRadius: '0 0 32px 32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.02)', 
            gap: '24px' 
          }}
        >
          {/* LEFT: Navigation & Status */}
          <Row style={{ flex: 1, alignItems: 'center', gap: '16px' }}>
            <Link href="/">
              <Row 
                vertical="center" 
                style={{ 
                  height: '44px', 
                  paddingTop: "0",
                  paddingBottom: "0",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(0, 122, 255, 0.1)', 
                  cursor: 'pointer',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ChevronLeft size={18} color={accent.primary} strokeWidth={2.5} />
                <Text style={{ fontWeight: 800, color: accent.primary, fontSize: '0.9rem' }}>
                  Lobby
                </Text>
              </Row>
            </Link>
            
            <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(0,0,0,0.06)', marginTop: "0", marginBottom: "0", marginLeft: "4px", marginRight: "4px" }} />
            
            <Row style={{ gap: '8px' }}>
              <IconButton 
                icon={<Bell size={18} color={accent.primary} />} 
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(0, 122, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  paddingTop: "0",
                  paddingBottom: "0",
                  paddingLeft: "0",
                  paddingRight: "0"
                }} 
              />
              <IconButton 
                icon={<MessageSquare size={18} color={accent.secondary} />} 
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(0, 122, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  paddingTop: "0",
                  paddingBottom: "0",
                  paddingLeft: "0",
                  paddingRight: "0"
                }} 
              />
            </Row>
          </Row>

          {/* CENTER: AI INSIGHT PILL (DYNAMIC ISLAND) */}
          <Row horizontal="center" style={{ flex: 2, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={filledNodes.filter(Boolean).length === 0 ? 'empty' : 'building'}
                initial={{ opacity: 0, y: -4, scale: 0.99 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  padding: '6px 28px 6px 14px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.45)', 
                  borderRadius: '100px', 
                  border: `1px solid rgba(0, 122, 255, 0.15)`, 
                  width: '100%', 
                  maxWidth: '580px', 
                  boxShadow: '0 4px 20px rgba(0, 122, 255, 0.08), inset 0 2px 4px rgba(255,255,255,0.8)', 
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Pulsing Backglow */}
                <motion.div
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 50%, ${accent.primary}20, transparent 70%)`, pointerEvents: 'none' }}
                />

                <div style={{ width: "38px", height: "38px", flexShrink: 0, position: "relative", display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                   <motion.div
                      animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                      transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
                      style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1.5px solid transparent`, borderTopColor: accent.primary, borderRightColor: accent.secondary, opacity: 0.5 }}
                   />
                   <ClientOnly><FlavorAura data={radarData} isPulsing={true} size={30} /></ClientOnly>
                </div>
                
                <Column style={{ gap: '1px', minWidth: 0, zIndex: 1 }}>
                  <Row vertical="center" style={{ gap: '8px' }}>
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.4, 1],
                        backgroundColor: [accent.primary, accent.secondary, accent.primary]
                      }} 
                      transition={{ duration: 2, repeat: Infinity }} 
                      style={{ width: '5px', height: '5px', borderRadius: '50%' }} 
                    />
                    <Text style={{ fontSize: '0.6rem', fontWeight: 900, color: accent.primary, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                      AI Thought Engine
                    </Text>
                  </Row>
                  <Text style={{ fontSize: '0.85rem', fontWeight: 700, color: text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.2px' }}>
                    {filledNodes.filter(Boolean).length === 0 
                      ? "Analyzing your group's collective palate..." 
                      : filledNodes.filter(Boolean).length < TOTAL_NODES
                      ? "DNA Syncing. Optimizing route for maximum group satisfaction."
                      : "Route DNA Fully Sequenced. Ready to launch."}
                  </Text>
                </Column>
              </motion.div>
            </AnimatePresence>
          </Row>

          {/* RIGHT: ELITE PROFILE INFO */}
          <Row horizontal="end" style={{ flex: 1, alignItems: 'center', gap: '16px' }}>
            <Column style={{ gap: '2px', alignItems: 'flex-end', hide: 's' }}>
              <Text style={{ color: text.primary, fontSize: "0.9rem", fontWeight: 900, letterSpacing: '-0.3px' }}>
                {MOCK_USER.name}
              </Text>
              <Row vertical="center" style={{ gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00D1B2', boxShadow: '0 0 8px #00D1B2' }} />
                <Text style={{ color: "rgba(0,0,0,0.45)", fontSize: "0.7rem", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {MOCK_USER.title}
                </Text>
              </Row>
            </Column>
            
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1.5px dashed rgba(0, 122, 255, 0.2)' }}
              />
              <div style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '50%', 
                padding: '2px', 
                background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)'
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid white' }}>
                  <img src={MOCK_USER.avatar} alt={MOCK_USER.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </Row>
        </Row>
      </div>

      {/* 2. CINEMATIC STAGE */}
      <div style={{ 
        flexGrow: 1, 
        position: "relative", 
        zIndex: 10, 
        display: "grid", 
        placeItems: "center", 
        width: "100%", 
        minHeight: 0,
        overflow: "hidden" 
      }}>
        {/* SIDE INDICATORS */}
        <motion.div 
          style={{ 
            opacity: skipGlowOpacity, 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            bottom: 0, 
            width: '25%', 
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to right, rgba(0,0,0,0.06), transparent)',
            pointerEvents: 'none'
          }}
        >
          <Column vertical="center" horizontal="center" style={{ gap: '12px', transform: 'translateX(-20px)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)' }}>
              <Undo2 size={32} color="rgba(0,0,0,0.4)" />
            </div>
            <Text style={{ fontSize: '0.9rem', fontWeight: 900, color: 'rgba(0,0,0,0.4)', letterSpacing: '2px' }}>SKIP</Text>
          </Column>
        </motion.div>

        <motion.div 
          style={{ 
            opacity: saveGlowOpacity, 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bottom: 0, 
            width: '25%', 
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(to left, ${accent.primary}15, transparent)`,
            pointerEvents: 'none'
          }}
        >
          <Column vertical="center" horizontal="center" style={{ gap: '12px', transform: 'translateX(20px)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${accent.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent.primary}30` }}>
              <Star size={32} color={accent.primary} fill={accent.primary} />
            </div>
            <Text style={{ fontSize: '0.9rem', fontWeight: 900, color: accent.primary, letterSpacing: '2px' }}>CHOOSE</Text>
          </Column>
        </motion.div>

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
           <motion.div style={{ opacity: skipGlowOpacity, position: 'absolute', top: '50%', left: '-10%', transform: 'translateY(-50%)', width: '600px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
           <motion.div style={{ opacity: saveGlowOpacity, position: 'absolute', top: '50%', right: '-10%', transform: 'translateY(-50%)', width: '600px', height: '800px', borderRadius: '50%', background: `radial-gradient(circle, ${accent.primary}25 0%, transparent 70%)`, filter: 'blur(100px)' }} />
        </div>

        <div style={{ position: "relative", width: "760px", height: "480px", zIndex: 20 }}>
          <AnimatePresence>
            {deck.length > 0 ? (
              <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {deck[1] && (
                  <motion.div 
                    key={`bg-${deck[1].id}`} 
                    initial={{ scale: 0.94, opacity: 0 }} 
                    animate={{ scale: 0.94, y: -20, opacity: 0.15 }} 
                    style={{ position: "absolute", width: "100%", height: "100%", zIndex: 1, borderRadius: "48px", overflow: "hidden", backgroundColor: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }} 
                  >
                    <StopCard card={deck[1]} />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }} />
                  </motion.div>
                )}
                <DraggableCard key={`card-${deck[0].id}`} card={deck[0]} onDragEnd={handleDragEnd} x={x} />
              </div>
            ) : (
              <motion.div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
                <Activity size={64} color={accent.primary} />
                <Heading variant="display-strong-s">Exploration Complete</Heading>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. FUNCTIONAL FOOTER - FLEX SHRINK 0 */}
      <div style={{ width: '100%', zIndex: 100, flexShrink: 0, paddingTop: '8px', paddingBottom: '8px', paddingLeft: '60px', paddingRight: '60px', backgroundColor: 'white', backdropFilter: 'blur(40px)', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'rgba(0,0,0,0.08)', borderRadius: '24px 24px 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,0.04)' }}>
        <Row fillWidth horizontal="between" vertical="center" style={{ height: '100px', gap: '48px' }}>
            {/* LEFT: STATUS */}
            <Row style={{ gap: '20px', alignItems: 'center', width: '380px' }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: '#F0F9FF', borderRadius: '16px', border: `1px solid ${accent.primary}20` }}>
                <Row vertical="center" style={{ gap: '8px' }}>
                   <Users size={16} color={accent.primary} />
                   <Text style={{ fontSize: '0.85rem', fontWeight: 900, color: accent.primary }}>1 MEMBER</Text>
                </Row>
                <Text style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', textAlign: 'center' }}>ACTIVE GROUP</Text>
              </motion.div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(0,0,0,0.08)' }} />
              <Column style={{ gap: '4px' }}>
                <Text style={{ fontSize: '0.85rem', fontWeight: 900, color: text.primary }}>{filledNodes.filter(Boolean).length} FOODS SELECTED</Text>
                <Text style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Open-ended Exploration</Text>
              </Column>
            </Row>

            {/* CENTER: ACTIONS */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "8px", paddingBottom: "8px", paddingLeft: "16px", paddingRight: "16px", backgroundColor: "rgba(0,0,0,0.03)", borderRadius: "100px", border: `2px solid rgba(0,0,0,0.05)` }}>
              <IconButton icon={<Undo2 size={22} color="white" />} onClick={handleUndo} style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#64748B", paddingTop: "0", paddingBottom: "0", paddingLeft: "0", paddingRight: "0" }} />
              <Button onClick={() => handleManualAction('skip')} style={{ borderRadius: '30px', backgroundColor: '#F3E8FF', color: '#7E22CE', border: 'none', fontWeight: 900, paddingTop: '0', paddingBottom: '0', paddingLeft: '28px', paddingRight: '28px', height: '48px' }}>SKIP</Button>
              <Button onClick={() => handleManualAction('select')} style={{ borderRadius: '30px', backgroundColor: accent.primary, color: 'white', fontWeight: 900, paddingTop: '0', paddingBottom: '0', paddingLeft: '32px', paddingRight: '32px', height: '48px' }}>CHOOSE</Button>
              <IconButton 
                 icon={<Star size={24} color="white" fill={filledNodes.some(n => n !== null) ? "white" : "none"} />} 
                 onClick={() => {
                    if (filledNodes.some(n => n !== null)) {
                      setIsGenerating(true);
                      setTimeout(() => { setIsGenerating(false); setIsTourReady(true); }, 3000);
                    }
                 }}
                 style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: filledNodes.some(n => n !== null) ? '#10B981' : 'rgba(0,0,0,0.1)' }} 
              />
            </div>

            {/* RIGHT: MAP & DNA */}
            <Row style={{ gap: '24px', alignItems: 'center', width: '380px', justifyContent: 'flex-end' }}>
              <Column style={{ gap: '8px', width: '180px' }}>
                <Row horizontal="between" vertical="center" style={{ width: '100%' }}>
                  <Text style={{ fontSize: '0.65rem', fontWeight: 850 }}>TOUR DNA PROFILE</Text>
                  <Text style={{ fontSize: '0.6rem', color: accent.secondary, fontWeight: 800 }}>LIVE</Text>
                </Row>
                <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                   {tourDNA.map((segment) => (
                      <motion.div key={segment.label} initial={{ width: 0 }} animate={{ width: `${segment.value}%` }} style={{ height: '100%', backgroundColor: segment.color }} />
                   ))}
                </div>
              </Column>
              <div style={{ width: '150px', height: '80px', borderRadius: '16px', backgroundColor: '#F8FAFF', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', position: 'relative' }}>
                 <ClientOnly>
                    <MapWidget 
                      mapId="tour-curation-footer"
                      points={filledNodes.filter((n): n is CardData => n !== null).map(n => n.location)}
                      center={activeCard ? activeCard.location : [10.897, 106.772]} zoom={14} showBanner={false}
                    />
                 </ClientOnly>
              </div>
            </Row>
          </Row>
        </div>

      {/* ═══════════ IMMERSIVE GENERATOR LOADING ═══════════ */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)", transition: { duration: 0.8 } }} 
            style={{ 
              position: "fixed", 
              inset: 0, 
              zIndex: 999999, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              backgroundColor: "rgba(255,255,255,0.7)", 
              backdropFilter: "blur(80px) saturate(180%)",
              overflow: "hidden"
            }}
          >
            {/* Drifting Bio-Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 - 50 + "%", 
                  y: Math.random() * 100 - 50 + "%",
                  opacity: 0 
                }}
                animate={{ 
                  x: [null, Math.random() * 100 - 50 + "%"],
                  y: [null, Math.random() * 100 - 50 + "%"],
                  opacity: [0, 0.4, 0]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 10, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{
                  position: "absolute",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: accent.primary,
                  boxShadow: `0 0 10px ${accent.primary}`,
                  zIndex: 0
                }}
              />
            ))}

            <div style={{ position: 'relative', zIndex: 10 }}>
              {/* Scanning Aura */}
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: `radial-gradient(circle, ${accent.primary}40 0%, transparent 70%)`, zIndex: -1 }}
              />
              
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Activity size={64} color={accent.primary} style={{ filter: `drop-shadow(0 0 20px ${accent.primary}40)` }} />
              </motion.div>
            </div>

            <Column horizontal="center" style={{ gap: '16px', marginTop: '40px', zIndex: 10, width: '100vw' }}>
               <AnimatePresence mode="wait">
                  <motion.div
                    key={loadingMessage}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heading variant="display-strong-s" style={{ textAlign: 'center', background: `linear-gradient(90deg, ${text.primary}, ${accent.primary}, ${text.primary})`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>
                      {loadingMessage}
                    </Heading>
                  </motion.div>
               </AnimatePresence>
               
               <div style={{ width: '200px', height: '1px', backgroundColor: 'rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
                 <motion.div
                   animate={{ left: ['-100%', '100%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: `linear-gradient(90deg, transparent, ${accent.primary}, transparent)` }}
                 />
               </div>
            </Column>
          </motion.div>
        )}
      </AnimatePresence>
    </Column>
  );
}

function DraggableCard({ card, onDragEnd, x }: { card: CardData; onDragEnd: (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void; x: any; }) {
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-400, 400], [-8, 8]);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-400, 400], [-10, 10]);
  const scale = useTransform(y, [0, 300], [1, 0.85]);

  return (
    <div style={{ perspective: '2000px', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.6} onDragEnd={onDragEnd}
        style={{ x, y, rotate, rotateX, rotateY, scale, width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
      >
        <StopCard card={card as any} />
      </motion.div>
    </div>
  );
}
