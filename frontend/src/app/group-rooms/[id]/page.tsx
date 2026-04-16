"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Crown,
  Check,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  Zap,
  Send,
  Lock,
  Globe,
  Copy,
  Play,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomMember {
  id: number;
  name: string;
  avatar: string;
  is_host: boolean;
  is_ready: boolean;
  is_speaking?: boolean;
  is_muted?: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  ts: string;
}

interface ApiMember {
  user_id: number;
  display_name?: string | null;
  avatar_url?: string | null;
  is_host: boolean;
  is_ready: boolean;
}

interface RoomData {
  id: number;
  name: string;
  status: string;
  route_description?: string | null;
  scheduled_time?: string | null;
  max_spots: number;
  cover_image_url?: string | null;
  accent_color?: string | null;
  is_public: boolean;
  invite_code?: string | null;
  members: ApiMember[];
  spots_remaining: number;
}

function mapMember(m: ApiMember): RoomMember {
  return {
    id: m.user_id,
    name: m.display_name ?? "Member",
    avatar:
      m.avatar_url ??
      `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.user_id}`,
    is_host: m.is_host,
    is_ready: m.is_ready,
    is_muted: false,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadyBar({ members }: { members: RoomMember[] }) {
  const readyCount = members.filter((m) => m.is_ready).length;
  const total = members.length;
  const allReady = readyCount === total && total > 0;
  const pct = total > 0 ? (readyCount / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#3C3C43]">
          Ready Status
        </span>
        <span
          className="text-[13px] font-bold"
          style={{ color: allReady ? "#34C759" : "#FF9500" }}
        >
          {readyCount} / {total} ready
        </span>
      </div>
      <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: allReady
              ? "linear-gradient(90deg, #34C759, #30D158)"
              : "linear-gradient(90deg, #FF9500, #FFB340)",
          }}
        />
      </div>
      {allReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
          style={{ backgroundColor: "rgba(52,199,89,0.1)" }}
        >
          <Zap size={14} className="text-[#34C759]" />
          <span className="text-[12px] font-bold text-[#1FAD45]">
            All ready! Host can launch the tour.
          </span>
        </motion.div>
      )}
    </div>
  );
}

function MemberRow({ member, isMe }: { member: RoomMember; isMe?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-colors hover:bg-[#F2F2F7]"
    >
      <div className="relative">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-9 h-9 rounded-full object-cover"
          style={{
            boxShadow: member.is_speaking
              ? "0 0 0 2.5px #34C759"
              : "0 0 0 2px rgba(0,0,0,0.06)",
          }}
        />
        {member.is_host && (
          <Crown
            size={10}
            className="absolute -top-1 -right-1 text-[#FBBF24] fill-[#FBBF24]"
          />
        )}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center"
          style={{ backgroundColor: member.is_ready ? "#34C759" : "#D1D1D6" }}
        >
          {member.is_ready && (
            <Check size={7} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#1C1C1E] truncate">
            {member.name}
          </span>
          {isMe && (
            <span className="text-[10px] font-bold text-[#8E8E93] bg-[#F2F2F7] px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
          {member.is_host && (
            <span className="text-[10px] font-bold text-[#FBBF24] bg-[#FFF9E6] px-1.5 py-0.5 rounded-full">
              Host
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#8E8E93]">
          {member.is_ready ? "✓ Ready" : "Not ready"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {member.is_muted ? (
          <MicOff size={14} className="text-[#FF3B30]" />
        ) : (
          <Mic size={14} className="text-[#34C759]" />
        )}
      </div>
    </motion.div>
  );
}

function ChatPanel({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E5EA]">
        <Hash size={15} className="text-[#8E8E93]" />
        <span className="text-[13px] font-bold text-[#3C3C43]">Room Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 no-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <img
              src={msg.avatar}
              alt={msg.user}
              className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
            />
            <div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[12px] font-bold text-[#1C1C1E]">
                  {msg.user}
                </span>
                <span className="text-[10px] text-[#C7C7CC]">{msg.ts}</span>
              </div>
              <p className="text-[13px] text-[#3C3C43] leading-snug">
                {msg.text}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-3 pt-1 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Send a message..."
          className="flex-1 px-3.5 py-2.5 rounded-[12px] text-[13px] bg-[#F2F2F7] border-none outline-none text-[#1C1C1E] placeholder-[#C7C7CC]"
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          className="w-9 h-9 rounded-[12px] flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #1A7AFF, #0057D9)" }}
        >
          <Send size={14} />
        </motion.button>
      </div>
    </div>
  );
}

function VoiceBar({
  isMuted,
  isInCall,
  onToggleMute,
  onToggleCall,
}: {
  isMuted: boolean;
  isInCall: boolean;
  onToggleMute: () => void;
  onToggleCall: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-3 border-t border-[#E5E5EA]"
      style={{ backgroundColor: "#F9F9FB" }}
    >
      <div
        className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-[10px]"
        style={{
          backgroundColor: isInCall
            ? "rgba(52,199,89,0.1)"
            : "rgba(0,0,0,0.04)",
          border: `1px solid ${isInCall ? "rgba(52,199,89,0.25)" : "transparent"}`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isInCall ? "#34C759" : "#C7C7CC",
            boxShadow: isInCall ? "0 0 6px #34C759" : "none",
          }}
        />
        <span
          className="text-[12px] font-semibold"
          style={{ color: isInCall ? "#1FAD45" : "#8E8E93" }}
        >
          {isInCall ? "Connected" : "Voice Chat"}
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggleMute}
        disabled={!isInCall}
        className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors disabled:opacity-40"
        style={{
          backgroundColor: isMuted
            ? "rgba(255,59,48,0.1)"
            : "rgba(52,199,89,0.1)",
          color: isMuted ? "#FF3B30" : "#34C759",
        }}
      >
        {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggleCall}
        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white transition-colors"
        style={{
          backgroundColor: isInCall ? "#FF3B30" : "#34C759",
        }}
      >
        {isInCall ? <PhoneOff size={14} /> : <Phone size={14} />}
      </motion.button>
    </div>
  );
}

function CountdownDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span className="font-mono font-bold text-[#FF9500]">
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function GroupRoomPage() {
  const params = useParams();
  const roomId = String(params?.id ?? "");
  const { user } = useAuth();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "members">("chat");
  const [meReady, setMeReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const myUserIdRef = useRef<number | null>(null);

  const voice = useVoiceRoom(roomId);

  // ── Fetch room + join on mount ──
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    (async () => {
      try {
        // Join the room (idempotent — server ignores duplicate joins)
        await apiPost(`/api/v1/groups/${roomId}/join`);
        const data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
        if (cancelled) return;
        setRoom(data);
        const mapped = data.members.map(mapMember);
        setMembers(mapped);
        myUserIdRef.current = user?.id ?? null;
        const myMember = data.members.find((m) => m.user_id === user?.id);
        if (myMember) setMeReady(myMember.is_ready);

        // Fetch messages
        try {
          const msgs = await apiGet<{items: any[]}>(`/api/v1/groups/${roomId}/messages`);
          setMessages(msgs.items.map(m => ({
            id: String(m.id),
            user: m.username,
            avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.user_id}`,
            text: m.content,
            ts: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          })));
        } catch (err) {
          // Ignore if messages fail
        }
      } catch (err: unknown) {
        if (!cancelled)
          toast.error(
            err instanceof Error ? err.message : "Failed to load room.",
          );
      } finally {
        if (!cancelled) setLoadingRoom(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // ── Real polling every 5s for member updates ──
  useEffect(() => {
    if (!roomId || loadingRoom) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
        setRoom(data);
        setMembers(data.members.map(mapMember));

        const msgs = await apiGet<{items: any[]}>(`/api/v1/groups/${roomId}/messages`);
        setMessages(msgs.items.map(m => ({
          id: String(m.id),
          user: m.username,
          avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.user_id}`,
          text: m.content,
          ts: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })));
      } catch {
        // silently ignore poll failures
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomId, loadingRoom]);

  const readyCount = members.filter((m) => m.is_ready).length;
  const allReady = readyCount === members.length && members.length > 0;
  const isHost = members.find((m) => m.is_host)?.id === myUserIdRef.current;

  // Toggle my ready state
  const handleToggleReady = useCallback(async () => {
    const next = !meReady;
    setMeReady(next);
    setMembers((ms) =>
      ms.map((m) =>
        myUserIdRef.current !== null && m.id === myUserIdRef.current
          ? { ...m, is_ready: next }
          : m,
      ),
    );
    try {
      await apiPatch(`/api/v1/groups/${roomId}/ready`, { is_ready: next });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update ready state.",
      );
      setMeReady(!next);
    }
  }, [meReady, roomId]);

  // Host launches countdown
  const handleLaunch = useCallback(() => {
    if (!allReady) {
      toast.error("Wait for everyone to be ready!");
      return;
    }
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(countdownRef.current!);
          toast.success("Launching Tour Builder! 🚀");
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }, [allReady]);

  const handleSendMessage = async (text: string) => {
    try {
      await apiPost(`/api/v1/groups/${roomId}/messages`, { content: text });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: user?.username || "You",
          avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.id ?? 0}`,
          text,
          ts: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err: unknown) {
      toast.error("Failed to send message.");
    }
  };

  const handleCopyCode = () => {
    if (room?.invite_code) {
      navigator.clipboard.writeText(room.invite_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loadingRoom || !room) {
    return (
      <div
        className="flex flex-col h-full items-center justify-center gap-4"
        style={{ backgroundColor: "#F2F2F7" }}
      >
        {loadingRoom ? (
          <>
            <div className="w-10 h-10 border-4 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
            <p className="text-[15px] text-[#8E8E93] font-medium">
              Joining room…
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl">&#128680;</div>
            <p className="text-[18px] font-bold text-[#1C1C1E]">
              Room not found
            </p>
            <Link
              href="/group-rooms"
              className="text-[14px] text-[#007AFF] font-semibold"
            >
              Back to rooms
            </Link>
          </>
        )}
      </div>
    );
  }

  const accentColor = room.accent_color ?? "#007AFF";
  const coverImage =
    room.cover_image_url ??
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop";

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#F2F2F7",
      }}
    >
      {/* ── COVER BANNER ── */}
      <div className="relative h-[140px] shrink-0 overflow-hidden">
        <img
          src={coverImage}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Back button */}
        <Link href="/group-rooms" className="absolute top-4 left-4">
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[14px] font-semibold"
            style={{
              backgroundColor: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ChevronLeft size={16} /> Group Rooms
          </motion.div>
        </Link>

        {/* Visibility badge */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{
            backgroundColor: room.is_public
              ? "rgba(52,199,89,0.75)"
              : "rgba(99,102,241,0.85)",
            color: "#fff",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {room.is_public ? <Globe size={10} /> : <Lock size={10} />}
          {room.is_public ? "Public" : "Private"}
        </div>

        {/* Room title */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white/70 text-[12px] font-semibold uppercase tracking-wider mb-0.5">
            {room.route_description ?? "Group Room"}
          </p>
          <h1 className="text-white text-[22px] font-extrabold tracking-tight leading-tight">
            {room.name}
          </h1>
        </div>
      </div>

      {/* ── MAIN BODY: left panel + right sidebar ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden border-r border-[#E5E5EA]"
          style={{ backgroundColor: "#fff" }}
        >
          {/* Room info bar */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-[#F2F2F7]">
            <div className="flex items-center gap-1.5 text-[13px] text-[#8E8E93]">
              <Users size={14} /> {members.length}/{room.max_spots} members
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-[#8E8E93]">
              <Clock size={14} /> Tonight at 8 PM
            </div>
            {!room.is_public && room.invite_code && (
              <button
                onClick={handleCopyCode}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                style={
                  codeCopied
                    ? { backgroundColor: "#D1FAE5", color: "#059669" }
                    : { backgroundColor: "#EEF0FF", color: "#6366F1" }
                }
              >
                {codeCopied ? (
                  <>
                    <Check size={12} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> {room.invite_code}
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── READY BAR + LAUNCH ── */}
          <div className="px-5 py-4 border-b border-[#F2F2F7] flex flex-col gap-3">
            <ReadyBar members={members} />

            <div className="flex items-center gap-2">
              {/* My ready toggle */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleToggleReady}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] text-[14px] font-bold border-2 transition-all"
                style={
                  meReady
                    ? {
                        backgroundColor: "rgba(52,199,89,0.1)",
                        borderColor: "#34C759",
                        color: "#1FAD45",
                      }
                    : {
                        backgroundColor: "#F9F9FB",
                        borderColor: "#E5E5EA",
                        color: "#3C3C43",
                      }
                }
              >
                {meReady ? (
                  <>
                    <Check size={15} /> Ready!
                  </>
                ) : (
                  "Mark as Ready"
                )}
              </motion.button>

              {/* Host launch */}
              {isHost && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={countdown !== null ? undefined : handleLaunch}
                  disabled={!allReady || countdown !== null}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] text-[14px] font-bold text-white disabled:opacity-50 transition-all"
                  style={{
                    background:
                      allReady && countdown === null
                        ? "linear-gradient(135deg, #34C759, #1FAD45)"
                        : "linear-gradient(135deg, #8E8E93, #636366)",
                    boxShadow: allReady
                      ? "0 4px 14px rgba(52,199,89,0.35)"
                      : "none",
                    minWidth: 120,
                  }}
                >
                  {countdown !== null ? (
                    <>
                      <Clock size={14} />{" "}
                      <CountdownDisplay seconds={countdown} />
                    </>
                  ) : (
                    <>
                      <Play size={14} /> Launch Tour
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* ── SWIPE AREA (placeholder before tour starts) ── */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-5"
              style={{
                background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
              }}
            >
              <Zap size={36} style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight mb-2">
              Waiting to Launch
            </h3>
            <p className="text-[14px] text-[#8E8E93] max-w-xs leading-relaxed">
              Once everyone marks ready and the host launches, you&apos;ll all
              enter the Tour Builder together to swipe and vote on spots.
            </p>

            <div className="flex gap-3 mt-6">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold"
                style={{ backgroundColor: "#F2F2F7", color: "#3C3C43" }}
              >
                <MessageSquare size={14} /> {messages.length} messages
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold"
                style={{ backgroundColor: "#F2F2F7", color: "#3C3C43" }}
              >
                <Users size={14} /> {members.length} / {room.max_spots} joined
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 300, backgroundColor: "#FAFAFA" }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-[#E5E5EA] shrink-0">
            {(["chat", "members"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors"
                style={
                  activeTab === tab
                    ? { color: "#007AFF", borderBottom: "2px solid #007AFF" }
                    : { color: "#8E8E93" }
                }
              >
                {tab === "chat" ? (
                  <MessageSquare size={14} />
                ) : (
                  <Users size={14} />
                )}
                {tab === "chat" ? "Chat" : `Members (${members.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <ChatPanel messages={messages} onSend={handleSendMessage} />
                </motion.div>
              ) : (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-y-auto h-full px-2 py-3 flex flex-col gap-1 no-scrollbar"
                >
                  <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider px-2 mb-1">
                    In Room — {members.length}
                  </p>
                  {members.map((m) => (
                    <MemberRow
                      key={m.id}
                      member={{
                        ...m,
                        is_speaking: voice.speakingUsers.has(
                          m.id === 1 ? 0 : m.id,
                        ),
                      }}
                      isMe={m.id === 1}
                    />
                  ))}

                  {/* Empty slots */}
                  {Array.from({
                    length: Math.max(0, room.max_spots - members.length),
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center gap-3 px-3 py-2.5 opacity-40"
                    >
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#C7C7CC] flex items-center justify-center">
                        <Users size={13} className="text-[#C7C7CC]" />
                      </div>
                      <span className="text-[13px] text-[#C7C7CC]">
                        Waiting for explorer...
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Voice bar */}
          <VoiceBar
            isMuted={voice.isMuted}
            isInCall={voice.isConnected}
            onToggleMute={voice.toggleMute}
            onToggleCall={async () => {
              if (voice.isConnected) {
                voice.disconnect();
                toast("Left voice channel");
              } else {
                try {
                  await voice.connect();
                  toast.success("Joined voice channel \uD83C\uDF99\uFE0F");
                } catch {
                  toast.error(voice.error ?? "Could not access microphone");
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
