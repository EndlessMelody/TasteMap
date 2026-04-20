"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  Paperclip,
  ImageIcon,
  Smile,
  X,
  Pause,
  StopCircle,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
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

interface GroupChatMessage {
  id: string;
  user_id: number;
  user: string;
  avatar: string;
  text: string;
  ts: string;
  created_at: string;
  content_type: "text" | "image" | "voice" | "video" | "file";
  media_url?: string;
  media_meta?: {
    duration?: number;
    size_bytes?: number;
    width?: number;
    height?: number;
  };
  is_pending?: boolean;
  sender: "me" | "them";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeMimeType(mimeType: string): string {
  return mimeType.split(";", 1)[0]?.trim()?.toLowerCase() || "application/octet-stream";
}

function getAudioFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
  };
  return map[mimeType] ?? mimeType.split("/")[1] ?? "webm";
}

function formatVoiceDuration(seconds: unknown): string {
  const s = typeof seconds === "number" ? seconds : Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
}

function getDateLabel(createdAt?: string): string {
  if (!createdAt) return "Today";
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "Today";
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesStart = new Date(todayStart);
  yesStart.setDate(todayStart.getDate() - 1);
  if (d >= todayStart) return "Today";
  if (d >= yesStart) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function bubbleRadius(
  sender: "me" | "them",
  pos: "single" | "first" | "middle" | "last"
): string {
  const R = 18, t = 4;
  if (sender === "me") {
    if (pos === "single") return `${R}px ${R}px ${t}px ${R}px`;
    if (pos === "first") return `${R}px ${R}px ${t}px ${R}px`;
    if (pos === "middle") return `${R}px ${t}px ${t}px ${R}px`;
    return `${R}px ${t}px ${R}px ${R}px`;
  } else {
    if (pos === "single") return `${R}px ${R}px ${R}px ${t}px`;
    if (pos === "first") return `${R}px ${R}px ${R}px ${t}px`;
    if (pos === "middle") return `${t}px ${R}px ${R}px ${t}px`;
    return `${t}px ${R}px ${R}px ${R}px`;
  }
}

const EMOJI_LIST = [
  "😀", "😂", "😍", "😎", "🤔", "🥺", "🙏", "👏", "🔥", "✨", "🎉", "💯",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "👍", "👎", "👌", "🤣", "😇", "🫡",
  "😋", "🤤", "🥳", "😴", "🍔", "🍜", "🍣", "🍕", "🧋", "☕", "🍰", "🥗",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #E5E5EA)" }} />
      <span
        style={{
          fontSize: 10, fontWeight: 700, color: "#AEAEB2", letterSpacing: "0.06em",
          textTransform: "uppercase", backgroundColor: "#F5F5F7", padding: "4px 12px",
          borderRadius: 20, border: "1px solid #E5E5EA", whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #E5E5EA)" }} />
    </div>
  );
}

function VoicePlayer({ src, isMe, durationHint }: { src: string; isMe: boolean; durationHint?: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const total = duration > 0 ? duration : (durationHint ?? 0);

  useEffect(() => {
    const a = audioRef.current;
    return () => { a?.pause(); };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { void a.play(); setIsPlaying(true); }
    else { a.pause(); setIsPlaying(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => { const d = audioRef.current?.duration ?? 0; if (isFinite(d) && d > 0) setDuration(d); }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
        style={{ display: "none" }}
      />
      <button
        onClick={toggle}
        style={{
          width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: isMe ? "rgba(255,255,255,0.2)" : "rgba(255,107,53,0.14)",
          color: isMe ? "#fff" : "#ff6b35",
        }}
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
      </button>
      <input
        type="range" min={0} max={Math.max(total, 0.1)} step={0.05}
        value={Math.min(currentTime, Math.max(total, 0.1))}
        onChange={(e) => {
          const t = Number(e.target.value);
          if (audioRef.current) audioRef.current.currentTime = t;
          setCurrentTime(t);
        }}
        style={{ flex: 1, accentColor: isMe ? "#fff" : "#ff6b35" }}
      />
      <span style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,0.85)" : "#8E8E93", whiteSpace: "nowrap" }}>
        {formatVoiceDuration(currentTime)} / {formatVoiceDuration(total)}
      </span>
    </div>
  );
}

function ReadyBar({ members }: { members: RoomMember[] }) {
  const readyCount = members.filter((m) => m.is_ready).length;
  const total = members.length;
  const allReady = readyCount === total && total > 0;
  const pct = total > 0 ? (readyCount / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider">Ready Status</span>
        <span
          className="text-[13px] font-bold px-2.5 py-0.5 rounded-full"
          style={{
            color: allReady ? "#1FAD45" : "#C47200",
            backgroundColor: allReady ? "rgba(52,199,89,0.12)" : "rgba(255,149,0,0.12)",
          }}
        >
          {readyCount} / {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EBEBF0" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: allReady
              ? "linear-gradient(90deg, #34C759, #30D158)"
              : "linear-gradient(90deg, #FF9500, #FFCC02)",
            boxShadow: allReady ? "0 0 8px rgba(52,199,89,0.5)" : "0 0 8px rgba(255,149,0,0.4)",
          }}
        />
      </div>
      <AnimatePresence>
        {allReady && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-[12px]"
            style={{ background: "linear-gradient(135deg, rgba(52,199,89,0.12), rgba(48,209,88,0.06))", border: "1px solid rgba(52,199,89,0.2)" }}
          >
            <Zap size={13} style={{ color: "#34C759" }} />
            <span className="text-[12px] font-bold" style={{ color: "#1FAD45" }}>
              All systems go! Host can launch the tour.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MemberRow({ member, isMe }: { member: RoomMember; isMe?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[16px] transition-all"
      style={{
        background: member.is_speaking
          ? "linear-gradient(135deg, rgba(52,199,89,0.08), rgba(52,199,89,0.04))"
          : "transparent",
        border: member.is_speaking ? "1px solid rgba(52,199,89,0.2)" : "1px solid transparent",
      }}
      whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" } as never}
    >
      <div className="relative shrink-0">
        <div
          className="rounded-full overflow-hidden"
          style={{
            width: 38, height: 38,
            boxShadow: member.is_speaking
              ? "0 0 0 2.5px #34C759, 0 0 12px rgba(52,199,89,0.3)"
              : "0 0 0 2px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <img src={member.avatar} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {member.is_host && (
          <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 flex items-center justify-center">
            <Crown size={11} className="text-[#F59E0B] fill-[#F59E0B] drop-shadow-sm" />
          </div>
        )}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center"
          style={{
            backgroundColor: member.is_ready ? "#34C759" : "#D1D1D6",
            transition: "background-color 0.25s ease",
          }}
        >
          {member.is_ready && <Check size={7} className="text-white" strokeWidth={3} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[13.5px] font-semibold text-[#1C1C1E] truncate">{member.name}</span>
          {isMe && (
            <span
              className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              style={{ color: "#ff6b35", backgroundColor: "rgba(255,107,53,0.12)" }}
            >
              You
            </span>
          )}
          {member.is_host && (
            <span
              className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              style={{ color: "#F59E0B", backgroundColor: "rgba(245,158,11,0.12)" }}
            >
              Host
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium" style={{ color: member.is_ready ? "#34C759" : "#AEAEB2" }}>
          {member.is_speaking ? "🎙 Speaking..." : member.is_ready ? "✓ Ready to go" : "Not ready"}
        </p>
      </div>

      <div className="flex items-center">
        {member.is_muted
          ? <MicOff size={13} style={{ color: "#FF3B30" }} />
          : <Mic size={13} style={{ color: member.is_speaking ? "#34C759" : "#C7C7CC" }} />
        }
      </div>
    </motion.div>
  );
}

// ─── Rich Chat Panel ──────────────────────────────────────────────────────────

function RichChatPanel({
  roomId,
  currentUser,
  members,
}: {
  roomId: string;
  currentUser: { id: number; username?: string; avatar?: string } | null;
  members: RoomMember[];
}) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { uploadFile, uploading } = useMediaUpload();
  const {
    startRecording,
    stopRecording,
    reset: resetRecording,
    isRecording,
    recordingTime,
    audioBlob,
    audioMimeType,
    error: recordingError,
  } = useVoiceRecorder();

  // ── Member lookup ──
  const memberMap = useMemo(() => {
    const m: Record<number, RoomMember> = {};
    for (const mem of members) m[mem.id] = mem;
    return m;
  }, [members]);

  // ── Fetch messages ──
  const fetchMessages = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiGet<{ items: any[] }>(
        `/api/v1/groups/${roomId}/messages`
      );
      const items = Array.isArray(res?.items) ? res.items : [];
      setMessages(
        items.map((m) => {
          const isMe = m.user_id === currentUser?.id;
          const member = memberMap[m.user_id];
          return {
            id: String(m.id),
            user_id: m.user_id,
            user: m.username ?? member?.name ?? "Member",
            avatar:
              member?.avatar ??
              `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.user_id}`,
            text: m.content ?? m.text ?? "",
            ts: new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            created_at: m.created_at,
            content_type: m.content_type ?? "text",
            media_url: m.media_url,
            media_meta: m.media_meta,
            is_pending: false,
            sender: isMe ? "me" : "them",
          };
        })
      );
    } catch {
      // silently ignore poll errors
    }
  }, [roomId, currentUser?.id, memberMap]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  // ── Auto scroll ──
  const lastId = messages[messages.length - 1]?.id ?? "";
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastId]);

  // ── Close emoji on outside click ──
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  // ── Recording error ──
  useEffect(() => {
    if (recordingError) toast.error(recordingError);
  }, [recordingError]);

  // ── Add optimistic message ──
  const addOptimistic = (
    text: string,
    opts?: Partial<GroupChatMessage>
  ): string => {
    const tempId = `opt-${Date.now()}`;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        user_id: currentUser?.id ?? 0,
        user: currentUser?.username ?? "You",
        avatar:
          currentUser?.avatar ??
          `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser?.id ?? 0}`,
        text,
        ts: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        created_at: now.toISOString(),
        content_type: "text",
        sender: "me",
        is_pending: true,
        ...opts,
      },
    ]);
    return tempId;
  };

  const removeOptimistic = (tempId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
  };

  // ── Send text ──
  const sendText = async () => {
    const text = input.trim();
    if (!text || sending || uploading) return;
    setInput("");
    setSending(true);
    const tempId = addOptimistic(text);
    try {
      await apiPost(`/api/v1/groups/${roomId}/messages`, { content: text });
      await fetchMessages();
      removeOptimistic(tempId);
    } catch {
      removeOptimistic(tempId);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // ── Send quick emoji ──
  const sendQuickEmoji = async () => {
    if (sending || uploading || isRecording) return;
    const text = "👍";
    setSending(true);
    const tempId = addOptimistic(text);
    try {
      await apiPost(`/api/v1/groups/${roomId}/messages`, { content: text });
      await fetchMessages();
      removeOptimistic(tempId);
    } catch {
      removeOptimistic(tempId);
    } finally {
      setSending(false);
    }
  };

  // ── Upload & send media ──
  const sendMedia = async (file: File, forcedType?: "image" | "voice" | "video" | "file") => {
    const tempId = addOptimistic(file.name, { content_type: forcedType ?? "file", is_pending: true });
    try {
      const result = await uploadFile(file);
      const mimeType = result.file_type ?? file.type;
      const contentType =
        forcedType ??
        (mimeType.startsWith("image/")
          ? "image"
          : mimeType.startsWith("audio/")
            ? "voice"
            : mimeType.startsWith("video/")
              ? "video"
              : "file");

      await apiPost(`/api/v1/groups/${roomId}/messages`, {
        content: input.trim() || (contentType === "file" ? file.name : ""),
        content_type: contentType,
        media_url: result.url,
        media_meta: { size_bytes: result.size_bytes },
      });
      setInput("");
      await fetchMessages();
      removeOptimistic(tempId);
    } catch {
      removeOptimistic(tempId);
      toast.error("Upload failed.");
    }
  };

  // ── Voice recording ──
  const handleVoiceToggle = async () => {
    if (sending || uploading) return;
    if (isRecording) {
      const duration = Math.max(0, Math.round(recordingTime));
      const blob = await stopRecording();
      if (!blob) return;
      const mime = normalizeMimeType(blob.type || audioMimeType || "audio/webm");
      const ext = getAudioFileExtension(mime);
      const file = new File([blob], `voice_${Date.now()}.${ext}`, { type: mime });

      const tempId = addOptimistic("", { content_type: "voice", is_pending: true });
      try {
        const result = await uploadFile(file);
        await apiPost(`/api/v1/groups/${roomId}/messages`, {
          content: "",
          content_type: "voice",
          media_url: result.url,
          media_meta: { duration, size_bytes: result.size_bytes },
        });
        await fetchMessages();
        removeOptimistic(tempId);
        resetRecording();
      } catch {
        removeOptimistic(tempId);
        toast.error("Failed to send voice message.");
        resetRecording();
      }
    } else {
      await startRecording();
    }
  };

  // ── Enrich messages ──
  type Enriched = GroupChatMessage & {
    pos: "single" | "first" | "middle" | "last";
    showDate: string | null;
  };

  const enriched: Enriched[] = messages.map((msg, i, arr) => {
    const prev = arr[i - 1];
    const next = arr[i + 1];
    const samePrev = prev?.sender === msg.sender;
    const sameNext = next?.sender === msg.sender;
    let pos: Enriched["pos"];
    if (!samePrev && !sameNext) pos = "single";
    else if (!samePrev && sameNext) pos = "first";
    else if (samePrev && sameNext) pos = "middle";
    else pos = "last";

    const dateLabel = getDateLabel(msg.created_at);
    const prevDate = i > 0 ? getDateLabel(arr[i - 1].created_at) : null;
    const showDate = i === 0 || dateLabel !== prevDate ? dateLabel : null;
    return { ...msg, pos, showDate };
  });

  const isMe = (msg: GroupChatMessage) => msg.sender === "me";
  const canSend = Boolean(input.trim()) || Boolean(audioBlob);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)", flexShrink: 0,
          background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.95) 100%)",
        }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.06))",
          }}
        >
          <Hash size={14} style={{ color: "#ff6b35" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.01em" }}>Room Chat</span>
        <div
          style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
            textTransform: "uppercase", color: "#AEAEB2", background: "#F2F2F7",
            padding: "3px 10px", borderRadius: 20,
          }}
        >
          {messages.length} msgs
        </div>
      </div>

      {/* Messages */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px", display: "flex", flexDirection: "column", gap: 2 }}
      >
        {enriched.length === 0 ? (
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
              paddingTop: 40,
            }}
          >
            <div
              style={{
                width: 60, height: 60, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.05))",
                border: "1px solid rgba(255,107,53,0.15)",
              }}
            >
              <MessageSquare size={26} style={{ color: "#ff6b35", opacity: 0.7 }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#3C3C43", marginBottom: 4 }}>No messages yet</p>
              <p style={{ fontSize: 12, color: "#AEAEB2", lineHeight: 1.5 }}>Be the first to say hi to the group! 👋</p>
            </div>
          </div>
        ) : (
          enriched.map((msg) => {
            const me = isMe(msg);
            return (
              <React.Fragment key={msg.id}>
                {msg.showDate && <DateSeparator label={msg.showDate} />}

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "flex",
                    flexDirection: me ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 6,
                    marginBottom: msg.pos === "last" || msg.pos === "single" ? 6 : 1,
                  }}
                >
                  {/* Avatar — only on last/single bubble of "them" */}
                  <div style={{ width: 28, flexShrink: 0 }}>
                    {!me && (msg.pos === "last" || msg.pos === "single") ? (
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : null}
                  </div>

                  <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start" }}>
                    {/* Name + time — only for first/single of "them" */}
                    {!me && (msg.pos === "first" || msg.pos === "single") && (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#3C3C43" }}>{msg.user}</span>
                        <span style={{ fontSize: 10, color: "#C7C7CC" }}>{msg.ts}</span>
                      </div>
                    )}
                    {me && (msg.pos === "last" || msg.pos === "single") && (
                      <div style={{ marginBottom: 2 }}>
                        <span style={{ fontSize: 10, color: "#C7C7CC" }}>{msg.ts}</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      style={{
                        padding: msg.content_type?.toLowerCase() === "image" ? 4 : "10px 14px",
                        borderRadius: bubbleRadius(msg.sender, msg.pos),
                        background: me
                          ? "linear-gradient(145deg, #ff7a46, #e6521a)"
                          : "#F0F0F5",
                        color: me ? "#fff" : "#1C1C1E",
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        opacity: msg.is_pending ? 0.6 : 1,
                        transition: "opacity 0.2s, transform 0.15s",
                        boxShadow: me
                          ? "0 3px 12px rgba(255,107,53,0.3), 0 1px 3px rgba(0,0,0,0.1)"
                          : "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Image */}
                      {msg.content_type?.toLowerCase() === "image" && msg.media_url ? (
                        <img
                          src={msg.media_url}
                          alt="Attached image"
                          style={{
                            maxWidth: 240, maxHeight: 200, borderRadius: 14,
                            objectFit: "cover", display: "block",
                          }}
                          onError={(e) => {
                            // Fallback nếu ảnh lỗi
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).insertAdjacentHTML('afterend', '<span style="font-size: 11px; font-style: italic;">[Image unavailable]</span>');
                          }}
                        />
                      ) : msg.content_type?.toLowerCase() === "voice" && msg.media_url ? (
                        /* Voice */
                        <VoicePlayer
                          src={msg.media_url}
                          isMe={me}
                          durationHint={msg.media_meta?.duration}
                        />
                      ) : msg.content_type?.toLowerCase() === "video" && msg.media_url ? (
                        /* Video */
                        <video
                          src={msg.media_url}
                          controls
                          style={{ maxWidth: 240, borderRadius: 14 }}
                        />
                      ) : msg.content_type?.toLowerCase() === "file" && msg.media_url ? (
                        /* File */
                        <a
                          href={msg.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: me ? "rgba(255,255,255,0.9)" : "#ff6b35",
                            textDecoration: "underline", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          📎 {msg.text || "Attached File"}
                        </a>
                      ) : (
                        /* Text (Fallback mặc định) */
                        <span>
                          {msg.text ? msg.text : <i style={{ opacity: 0.6 }}>[Unsupported media]</i>}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px",
            background: "linear-gradient(135deg, rgba(255,59,48,0.07), rgba(255,59,48,0.03))",
            borderTop: "1px solid rgba(255,59,48,0.12)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF3B30", flexShrink: 0, boxShadow: "0 0 6px rgba(255,59,48,0.6)" }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#FF3B30", flex: 1, letterSpacing: "-0.01em" }}>
            Recording · {formatVoiceDuration(recordingTime)}
          </span>
          <button
            onClick={() => resetRecording()}
            style={{
              background: "rgba(255,59,48,0.1)", border: "none", cursor: "pointer",
              color: "#FF3B30", padding: "4px 8px", borderRadius: 8,
              display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
            }}
          >
            <X size={12} /> Cancel
          </button>
        </motion.div>
      )}

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            ref={emojiRef}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", bottom: 68, left: 12, right: 12,
              background: "#fff", borderRadius: 20, padding: "12px 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
              border: "1px solid rgba(0,0,0,0.07)", zIndex: 20,
              display: "flex", flexWrap: "wrap", gap: 6,
            }}
          >
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { setInput((prev) => prev + emoji); setShowEmoji(false); }}
                style={{
                  fontSize: 20, background: "none", border: "none", cursor: "pointer",
                  padding: "4px 5px", borderRadius: 8, transition: "background 0.12s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#F2F2F7")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BẮT ĐẦU THAY THẾ COMPOSER TỪ ĐÂY ── */}
      <div
        style={{
          position: "relative",
          padding: "10px 14px 14px",
          background: "rgba(255,255,255,0.95)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          flexShrink: 0,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Hidden file inputs (GIỮ NGUYÊN) */}
        <input
          ref={attachRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) sendMedia(f);
            e.target.value = "";
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) sendMedia(f, "image");
            e.target.value = "";
          }}
        />

        {/* Thanh Input Nhắn Tin (Pill-shaped) */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: "#F2F2F7",
            borderRadius: 26,
            padding: "6px 8px 6px 12px",
            border: "1.5px solid rgba(0,0,0,0.06)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={() => { }}
        >
          {/* Nút Attach (Gộp chung nếu màn hình nhỏ, ở đây giữ nguyên) */}
          <div style={{ display: "flex", gap: 2, paddingBottom: 2 }}>
            <button
              onClick={() => attachRef.current?.click()}
              disabled={isRecording || uploading}
              style={{
                width: 30, height: 30, borderRadius: "50%", border: "none", background: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#AEAEB2", transition: "color 0.15s, background 0.15s",
                opacity: isRecording || uploading ? 0.4 : 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b35"; e.currentTarget.style.background = "rgba(255,107,53,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#AEAEB2"; e.currentTarget.style.background = "none"; }}
            >
              <Paperclip size={16} />
            </button>

            <button
              onClick={() => imageRef.current?.click()}
              disabled={isRecording || uploading}
              style={{
                width: 30, height: 30, borderRadius: "50%", border: "none", background: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#AEAEB2", transition: "color 0.15s, background 0.15s",
                opacity: isRecording || uploading ? 0.4 : 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b35"; e.currentTarget.style.background = "rgba(255,107,53,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#AEAEB2"; e.currentTarget.style.background = "none"; }}
            >
              <ImageIcon size={16} />
            </button>
          </div>

          {/* Ô nhập Text */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
            }}
            placeholder={isRecording ? "Đang ghi âm..." : "Nhắn tin cho nhóm..."}
            disabled={isRecording || uploading}
            rows={1}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 14, color: "#1C1C1E", resize: "none", lineHeight: "1.5",
              padding: "6px 4px", maxHeight: 100, overflowY: "auto",
              fontFamily: "inherit",
              opacity: isRecording ? 0.4 : 1,
            }}
            className="no-scrollbar"
          />

          {/* Nút Emoji */}
          <button
            onClick={() => setShowEmoji((v) => !v)}
            disabled={uploading}
            style={{
              width: 30, height: 30, borderRadius: "50%", border: "none",
              background: showEmoji ? "rgba(255,107,53,0.1)" : "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: showEmoji ? "#ff6b35" : "#AEAEB2", paddingBottom: 2,
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <Smile size={18} />
          </button>

          {/* Cụm Nút Send / Ghi âm / Quick Like (Hiển thị thông minh) */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, paddingBottom: 2 }}>
            {canSend || isRecording ? (
              // Nếu có gõ chữ hoặc đang ghi âm -> Hiện nút SEND màu cam
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={isRecording ? handleVoiceToggle : sendText}
                disabled={sending || uploading}
                style={{
                  width: 34, height: 34, borderRadius: "50%", border: "none",
                  background: "linear-gradient(145deg, #ff7a46, #e6521a)",
                  color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 3px 10px rgba(255,107,53,0.4)",
                  opacity: sending || uploading ? 0.6 : 1,
                }}
              >
                {isRecording ? <StopCircle size={16} /> : <Send size={14} style={{ marginLeft: 2 }} />}
              </motion.button>
            ) : (
              // Nếu khung nhập TRỐNG -> Hiện nút Mic và Quick Like
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceToggle}
                  disabled={uploading}
                  style={{
                    width: 30, height: 30, borderRadius: "50%", border: "none", background: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#AEAEB2",
                  }}
                >
                  <Mic size={18} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={sendQuickEmoji}
                  disabled={sending || uploading}
                  style={{
                    width: 34, height: 34, borderRadius: "50%", border: "none",
                    background: "linear-gradient(145deg, #ff7a46, #e6521a)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", boxShadow: "0 3px 10px rgba(255,107,53,0.35)",
                  }}
                >
                  <ThumbsUp size={16} />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Loading Indicator (Chỉ hiện khi đang upload) */}
        {uploading && (
          <div style={{ position: "absolute", top: -20, left: 24, fontSize: 11, color: "#8E8E93", fontWeight: 600 }}>
            Đang gửi file...
          </div>
        )}
      </div>
      {/* ── KẾT THÚC THAY THẾ COMPOSER ── */}
    </div>
  );
}

// ─── Voice Bar ────────────────────────────────────────────────────────────────

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
          backgroundColor: isInCall ? "rgba(52,199,89,0.1)" : "rgba(0,0,0,0.04)",
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
        <span className="text-[12px] font-semibold" style={{ color: isInCall ? "#1FAD45" : "#8E8E93" }}>
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
          backgroundColor: isMuted ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)",
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
        style={{ backgroundColor: isInCall ? "#FF3B30" : "#34C759" }}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupRoomPage() {
  const params = useParams();
  const roomId = String(params?.id ?? "");
  const { user } = useAuth();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
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
    if (!roomId || !user) return;
    let cancelled = false;

    (async () => {
      try {
        let data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
        if (cancelled) return;

        const isAlreadyMember = data.members.some((m) => m.user_id === user.id);

        if (!isAlreadyMember) {
          try {
            await apiPost(`/api/v1/groups/${roomId}/join`);
            data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
          } catch (joinErr: unknown) {
            console.warn("Join error:", joinErr);
          }
        }

        if (cancelled) return;

        setRoom(data);
        const mapped = data.members.map(mapMember);
        setMembers(mapped);
        myUserIdRef.current = user.id;

        const myMember = data.members.find((m) => m.user_id === user.id);
        if (myMember) setMeReady(myMember.is_ready);
      } catch (err: unknown) {
        if (!cancelled)
          toast.error(err instanceof Error ? err.message : "Failed to load room.");
      } finally {
        if (!cancelled) setLoadingRoom(false);
      }
    })();
    return () => { cancelled = true; };
  }, [roomId, user]);

  // ── Poll room members every 5s ──
  useEffect(() => {
    if (!roomId || loadingRoom) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
        setRoom(data);
        setMembers(data.members.map(mapMember));
      } catch {
        // silently ignore
      }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [roomId, loadingRoom]);

  const readyCount = members.filter((m) => m.is_ready).length;
  const allReady = readyCount === members.length && members.length > 0;
  const isHost = members.find((m) => m.is_host)?.id === myUserIdRef.current;

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
      toast.error(err instanceof Error ? err.message : "Failed to update ready state.");
      setMeReady(!next);
    }
  }, [meReady, roomId]);

  const handleLaunch = useCallback(() => {
    if (!allReady) { toast.error("Wait for everyone to be ready!"); return; }
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
            <div className="w-10 h-10 border-4 border-[#ff6b35]/30 border-t-[#ff6b35] rounded-full animate-spin" />
            <p className="text-[15px] text-[#8E8E93] font-medium">Joining room…</p>
          </>
        ) : (
          <>
            <div className="text-5xl">🚨</div>
            <p className="text-[18px] font-bold text-[#1C1C1E]">Room not found</p>
            <Link href="/group-rooms" className="text-[14px] text-[#ff6b35] font-semibold">
              Back to rooms
            </Link>
          </>
        )}
      </div>
    );
  }

  const accentColor = room.accent_color ?? "#ff6b35";
  const coverImage =
    room.cover_image_url ??
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop";

  // Build currentUser object for RichChatPanel
  const currentUserForChat = user
    ? {
      id: user.id,
      username:
        (user as unknown as { username?: string }).username ??
        (user as unknown as { display_name?: string }).display_name ??
        "You",
      avatar: (user as unknown as { avatar_url?: string }).avatar_url,
    }
    : null;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#F2F2F7",
      }}
    >
      {/* ── COVER BANNER ── */}
      <div className="relative h-[155px] shrink-0 overflow-hidden">
        <img src={coverImage} alt={room.name} className="w-full h-full object-cover" style={{ filter: "brightness(0.9)" }} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%)" }}
        />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

        <Link href="/group-rooms" className="absolute top-4 left-4">
          <motion.div
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <ChevronLeft size={15} /> Group Rooms
          </motion.div>
        </Link>

        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: room.is_public ? "rgba(52,199,89,0.8)" : "rgba(99,102,241,0.85)",
            color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
            letterSpacing: "0.05em",
          }}
        >
          {room.is_public ? <Globe size={9} /> : <Lock size={9} />}
          {room.is_public ? "Public" : "Private"}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.1em] mb-1">
            {room.route_description ?? "Group Room"}
          </p>
          <h1 className="text-white text-[23px] font-extrabold tracking-tight leading-tight" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
            {room.name}
          </h1>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden border-r border-[#E5E5EA]"
          style={{ backgroundColor: "#fff" }}
        >
          {/* Room info bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#F2F2F7]" style={{ backgroundColor: "#FAFAFA" }}>
            <div
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#F0F0F5", color: "#636366" }}
            >
              <Users size={12} style={{ color: "#ff6b35" }} /> {members.length}/{room.max_spots}
            </div>
            <div
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#F0F0F5", color: "#636366" }}
            >
              <Clock size={12} style={{ color: "#ff6b35" }} />
              {room.scheduled_time
                ? new Date(room.scheduled_time).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                : "Tonight at 8 PM"}
            </div>
            {!room.is_public && room.invite_code && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyCode}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all"
                style={
                  codeCopied
                    ? { backgroundColor: "#D1FAE5", color: "#059669", border: "1px solid rgba(5,150,105,0.2)" }
                    : { backgroundColor: "rgba(99,102,241,0.1)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.2)" }
                }
              >
                {codeCopied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> {room.invite_code}</>}
              </motion.button>
            )}
          </div>

          {/* ── READY BAR + LAUNCH ── */}
          <div className="px-5 py-4 border-b border-[#F2F2F7] flex flex-col gap-3.5">
            <ReadyBar members={members} />
            <div className="flex items-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleToggleReady}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-[14px] font-bold transition-all"
                style={
                  meReady
                    ? {
                      background: "linear-gradient(135deg, rgba(52,199,89,0.15), rgba(52,199,89,0.06))",
                      border: "1.5px solid rgba(52,199,89,0.4)",
                      color: "#1FAD45",
                      boxShadow: "0 2px 10px rgba(52,199,89,0.15)",
                    }
                    : {
                      backgroundColor: "#F5F5F7",
                      border: "1.5px solid #E5E5EA",
                      color: "#3C3C43",
                    }
                }
              >
                {meReady ? <><Check size={15} /> Ready!</> : "Mark as Ready"}
              </motion.button>

              {isHost && (
                <motion.button
                  whileHover={{ scale: allReady && countdown === null ? 1.03 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={countdown !== null ? undefined : handleLaunch}
                  disabled={!allReady || countdown !== null}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-[16px] text-[14px] font-bold text-white disabled:opacity-50 transition-all"
                  style={{
                    background:
                      allReady && countdown === null
                        ? "linear-gradient(135deg, #34C759, #1FAD45)"
                        : "linear-gradient(135deg, #C7C7CC, #AEAEB2)",
                    boxShadow: allReady ? "0 4px 16px rgba(52,199,89,0.4)" : "none",
                    minWidth: 130,
                  }}
                >
                  {countdown !== null ? (
                    <><Clock size={14} /> <CountdownDisplay seconds={countdown} /></>
                  ) : (
                    <><Play size={14} /> Launch Tour</>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* ── WAITING PLACEHOLDER ── */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-5"
              style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)` }}
            >
              <Zap size={36} style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight mb-2">
              Waiting to Launch
            </h3>
            <p className="text-[14px] text-[#8E8E93] max-full leading-relaxed">
              Once everyone marks ready and the host launches, you&apos;ll all
              enter the Tour Builder together to swipe and vote on spots.
            </p>

            <div className="flex gap-3 mt-6">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold"
                style={{ backgroundColor: "#F2F2F7", color: "#3C3C43" }}
              >
                <Users size={14} /> {members.length} / {room.max_spots} joined
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold"
                style={{ backgroundColor: "#F2F2F7", color: "#3C3C43" }}
              >
                <Check size={14} /> {readyCount} ready
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 520, backgroundColor: "#FAFAFA" }}
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
                    ? { color: "#ff6b35", borderBottom: "2px solid #ff6b35" }
                    : { color: "#8E8E93" }
                }
              >
                {tab === "chat" ? <MessageSquare size={14} /> : <Users size={14} />}
                {tab === "chat" ? "Chat" : `Members (${members.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden" style={{ position: "relative" }}>
            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: "100%" }}
                >
                  <RichChatPanel
                    roomId={roomId}
                    currentUser={currentUserForChat}
                    members={members}
                  />
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
                          m.id === myUserIdRef.current ? 0 : m.id,
                        ),
                      }}
                      isMe={m.id === myUserIdRef.current}
                    />
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, room.max_spots - members.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex items-center gap-3 px-3 py-2.5 opacity-40">
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#C7C7CC] flex items-center justify-center">
                        <Users size={13} className="text-[#C7C7CC]" />
                      </div>
                      <span className="text-[13px] text-[#C7C7CC]">Waiting for explorer...</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Voice bar */}
          {/* <VoiceBar
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
                  toast.success("Joined voice channel 🎙️");
                } catch {
                  toast.error(voice.error ?? "Could not access microphone");
                }
              }
            }}
          /> */}
        </div>
      </div>
    </div>
  );
}