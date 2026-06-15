"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Crown,
  Check,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Signal,
  Settings2,
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
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceRoom, type VoiceRoomState } from "@/hooks/useVoiceRoom";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { GroupSwipeView } from "@/components/features/group-swipe";
import {
  Card,
  Button,
  IconButton,
  Pill,
  H1,
  H3,
  Body,
  BodySm,
  Caption,
  Eyebrow,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

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

function normalizeMimeType(mimeType: string): string {
  return (
    mimeType.split(";", 1)[0]?.trim()?.toLowerCase() ||
    "application/octet-stream"
  );
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
  pos: "single" | "first" | "middle" | "last",
): string {
  const R = 18;
  const t = 4;
  if (sender === "me") {
    if (pos === "single") return `${R}px ${R}px ${t}px ${R}px`;
    if (pos === "first") return `${R}px ${R}px ${t}px ${R}px`;
    if (pos === "middle") return `${R}px ${t}px ${t}px ${R}px`;
    return `${R}px ${t}px ${R}px ${R}px`;
  }
  if (pos === "single") return `${R}px ${R}px ${R}px ${t}px`;
  if (pos === "first") return `${R}px ${R}px ${R}px ${t}px`;
  if (pos === "middle") return `${t}px ${R}px ${R}px ${t}px`;
  return `${t}px ${R}px ${R}px ${R}px`;
}

const EMOJI_LIST = [
  "😀", "😂", "😍", "😎", "🤔", "🥺", "🙏", "👏", "🔥", "✨", "🎉", "💯",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "👍", "👎", "👌", "🤣", "😇", "🫡",
  "😋", "🤤", "🥳", "😴", "🍔", "🍜", "🍣", "🍕", "🧋", "☕", "🍰", "🥗",
];

function DateSeparator({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space[2],
        padding: `${tokens.space[2]} ${tokens.space[1]}`,
      }}
    >
      <div style={{ flex: 1, height: 1, background: tokens.color.border }} />
      <Caption
        tone="subtle"
        style={{
          background: tokens.color.surfaceMuted,
          padding: `4px 12px`,
          borderRadius: tokens.radius.pill,
          border: `1px solid ${tokens.color.border}`,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Caption>
      <div style={{ flex: 1, height: 1, background: tokens.color.border }} />
    </div>
  );
}

function VoicePlayer({
  src,
  isMe,
  durationHint,
}: {
  src: string;
  isMe: boolean;
  durationHint?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const total = duration > 0 ? duration : (durationHint ?? 0);

  useEffect(() => {
    const a = audioRef.current;
    return () => {
      a?.pause();
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      void a.play();
      setIsPlaying(true);
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space[2],
        minWidth: 200,
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          const d = audioRef.current?.duration ?? 0;
          if (isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={toggle}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: isMe ? "rgba(255, 255, 255, 0.2)" : tokens.color.surfaceMuted,
          color: isMe ? tokens.color.textInverse : tokens.color.warm,
        }}
      >
        {isPlaying ? <Pause size={13} strokeWidth={1.75} /> : <Play size={13} strokeWidth={1.75} />}
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(total, 0.1)}
        step={0.05}
        value={Math.min(currentTime, Math.max(total, 0.1))}
        onChange={(e) => {
          const t = Number(e.target.value);
          if (audioRef.current) audioRef.current.currentTime = t;
          setCurrentTime(t);
        }}
        style={{
          flex: 1,
          accentColor: isMe ? tokens.color.textInverse : tokens.color.warm,
        }}
      />
      <span
        style={{
          fontSize: 11,
          color: isMe ? "rgba(255, 255, 255, 0.85)" : tokens.color.textMuted,
          whiteSpace: "nowrap",
        }}
      >
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
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[2] }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Eyebrow tone="muted">Ready status</Eyebrow>
        <Pill tone={allReady ? "success" : "warning"} size="sm">
          {readyCount} / {total}
        </Pill>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: tokens.radius.pill,
          background: tokens.color.surfaceInset,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: allReady ? tokens.color.success : tokens.color.warning,
          }}
        />
      </div>
      <AnimatePresence>
        {allReady && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <Card radius="md" padding="sm" shadow="none" surface="muted">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                }}
              >
                <Zap
                  size={13}
                  strokeWidth={1.75}
                  style={{ color: tokens.color.success }}
                />
                <BodySm
                  style={{
                    color: tokens.color.success,
                    fontWeight: tokens.type.weight.semibold,
                  }}
                >
                  All systems go. Host can launch the tour.
                </BodySm>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  const memberMap = useMemo(() => {
    const m: Record<number, RoomMember> = {};
    for (const mem of members) m[mem.id] = mem;
    return m;
  }, [members]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await apiGet<{ items: Record<string, unknown>[] }>(
        `/api/v1/groups/${roomId}/messages`,
      );
      const items = Array.isArray(res?.items) ? res.items : [];
      setMessages(
        items.map((m) => {
          const isMe = m.user_id === currentUser?.id;
          const member = memberMap[m.user_id as number];
          return {
            id: String(m.id),
            user_id: m.user_id as number,
            user: (m.username as string) ?? member?.name ?? "Member",
            avatar:
              member?.avatar ??
              `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.user_id}`,
            text: (m.content as string) ?? (m.text as string) ?? "",
            ts: new Date(m.created_at as string).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            created_at: m.created_at as string,
            content_type:
              ((m.content_type as GroupChatMessage["content_type"]) ?? "text"),
            media_url: m.media_url as string | undefined,
            media_meta: m.media_meta as GroupChatMessage["media_meta"],
            is_pending: false,
            sender: isMe ? "me" : "them",
          };
        }),
      );
    } catch {
      /* silent — poll errors */
    }
  }, [roomId, currentUser?.id, memberMap]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  const lastId = messages[messages.length - 1]?.id ?? "";
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastId]);

  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node))
        setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  useEffect(() => {
    if (recordingError) toast.error(recordingError);
  }, [recordingError]);

  const addOptimistic = (
    text: string,
    opts?: Partial<GroupChatMessage>,
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

  const sendMedia = async (
    file: File,
    forcedType?: "image" | "voice" | "video" | "file",
  ) => {
    const tempId = addOptimistic(file.name, {
      content_type: forcedType ?? "file",
      is_pending: true,
    });
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

  const handleVoiceToggle = async () => {
    if (sending || uploading) return;
    if (isRecording) {
      const duration = Math.max(0, Math.round(recordingTime));
      const blob = await stopRecording();
      if (!blob) return;
      const mime = normalizeMimeType(
        blob.type || audioMimeType || "audio/webm",
      );
      const ext = getAudioFileExtension(mime);
      const file = new File([blob], `voice_${Date.now()}.${ext}`, {
        type: mime,
      });
      const tempId = addOptimistic("", {
        content_type: "voice",
        is_pending: true,
      });
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: tokens.color.surface,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[2],
          padding: `${tokens.space[3]} ${tokens.space[4]}`,
          borderBottom: `1px solid ${tokens.color.border}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: tokens.radius.sm,
            background: tokens.color.surfaceMuted,
            color: tokens.color.textMuted,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Hash size={14} strokeWidth={1.75} />
        </span>
        <Body style={{ fontWeight: tokens.type.weight.semibold }}>Room chat</Body>
        <Pill tone="neutral" size="sm" style={{ marginLeft: "auto" }}>
          {messages.length} msgs
        </Pill>
      </div>

      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `${tokens.space[3]} ${tokens.space[3]} ${tokens.space[1]}`,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {enriched.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space[3],
              paddingTop: tokens.space[10],
            }}
          >
            <span
              style={{
                width: 60,
                height: 60,
                borderRadius: tokens.radius.lg,
                background: tokens.color.surfaceMuted,
                color: tokens.color.textMuted,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={26} strokeWidth={1.5} />
            </span>
            <div style={{ textAlign: "center" }}>
              <Body
                style={{
                  fontWeight: tokens.type.weight.semibold,
                  marginBottom: 4,
                }}
              >
                No messages yet
              </Body>
              <BodySm tone="muted">Be the first to say hi to the group.</BodySm>
            </div>
          </div>
        ) : (
          enriched.map((msg) => {
            const me = isMe(msg);
            return (
              <React.Fragment key={msg.id}>
                {msg.showDate && <DateSeparator label={msg.showDate} />}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "flex",
                    flexDirection: me ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: tokens.space[1],
                    marginBottom:
                      msg.pos === "last" || msg.pos === "single" ? tokens.space[1] : 1,
                  }}
                >
                  <div style={{ width: 28, flexShrink: 0 }}>
                    {!me && (msg.pos === "last" || msg.pos === "single") ? (
                      <img
                        src={msg.avatar}
                        alt=""
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  <div
                    style={{
                      maxWidth: "72%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: me ? "flex-end" : "flex-start",
                    }}
                  >
                    {!me && (msg.pos === "first" || msg.pos === "single") && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: tokens.space[1],
                          marginBottom: 3,
                        }}
                      >
                        <Caption
                          style={{
                            color: tokens.color.text,
                            fontWeight: tokens.type.weight.semibold,
                          }}
                        >
                          {msg.user}
                        </Caption>
                        <Caption tone="subtle">{msg.ts}</Caption>
                      </div>
                    )}
                    {me && (msg.pos === "last" || msg.pos === "single") && (
                      <Caption tone="subtle" style={{ marginBottom: 2 }}>
                        {msg.ts}
                      </Caption>
                    )}

                    <div
                      style={{
                        padding:
                          msg.content_type?.toLowerCase() === "image"
                            ? 4
                            : `10px 14px`,
                        borderRadius: bubbleRadius(msg.sender, msg.pos),
                        background: me
                          ? tokens.color.warm
                          : tokens.color.surfaceMuted,
                        color: me ? tokens.color.textInverse : tokens.color.text,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        opacity: msg.is_pending ? 0.6 : 1,
                        transition: "opacity 0.2s",
                        boxShadow: tokens.shadow.sm,
                      }}
                    >
                      {msg.content_type?.toLowerCase() === "image" &&
                      msg.media_url ? (
                        <img
                          src={msg.media_url}
                          alt="Attached"
                          style={{
                            maxWidth: 240,
                            maxHeight: 200,
                            borderRadius: tokens.radius.md,
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).insertAdjacentHTML(
                              "afterend",
                              '<span style="font-size: 11px; font-style: italic;">[Image unavailable]</span>',
                            );
                          }}
                        />
                      ) : msg.content_type?.toLowerCase() === "voice" &&
                        msg.media_url ? (
                        <VoicePlayer
                          src={msg.media_url}
                          isMe={me}
                          durationHint={msg.media_meta?.duration}
                        />
                      ) : msg.content_type?.toLowerCase() === "video" &&
                        msg.media_url ? (
                        <video
                          src={msg.media_url}
                          controls
                          style={{ maxWidth: 240, borderRadius: tokens.radius.md }}
                        />
                      ) : msg.content_type?.toLowerCase() === "file" &&
                        msg.media_url ? (
                        <a
                          href={msg.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: me ? "rgba(255,255,255,0.92)" : tokens.color.warm,
                            textDecoration: "underline",
                            fontSize: 12,
                            fontWeight: tokens.type.weight.semibold,
                          }}
                        >
                          📎 {msg.text || "Attached file"}
                        </a>
                      ) : (
                        <span>
                          {msg.text ? (
                            msg.text
                          ) : (
                            <i style={{ opacity: 0.6 }}>[Unsupported media]</i>
                          )}
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

      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[3],
            padding: `${tokens.space[3]} ${tokens.space[4]}`,
            background: "rgba(230, 57, 70, 0.06)",
            borderTop: `1px solid rgba(230, 57, 70, 0.12)`,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: tokens.color.danger,
              flexShrink: 0,
            }}
          />
          <BodySm
            style={{
              color: tokens.color.danger,
              fontWeight: tokens.type.weight.semibold,
              flex: 1,
            }}
          >
            Recording · {formatVoiceDuration(recordingTime)}
          </BodySm>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X size={12} strokeWidth={1.75} />}
            onClick={() => resetRecording()}
            style={{ color: tokens.color.danger }}
          >
            Cancel
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {showEmoji && (
          <motion.div
            ref={emojiRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: 68,
              left: 12,
              right: 12,
              zIndex: tokens.z.overlay,
            }}
          >
            <Card
              radius="lg"
              padding="sm"
              shadow="lg"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: tokens.space[1],
              }}
            >
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInput((prev) => prev + emoji);
                    setShowEmoji(false);
                  }}
                  style={{
                    fontSize: 20,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 5px",
                    borderRadius: tokens.radius.xs,
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      tokens.color.surfaceMuted)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      "transparent")
                  }
                >
                  {emoji}
                </button>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          position: "relative",
          padding: `${tokens.space[3]} ${tokens.space[3]} ${tokens.space[4]}`,
          background: tokens.color.surface,
          borderTop: `1px solid ${tokens.color.border}`,
          flexShrink: 0,
        }}
      >
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

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: tokens.space[2],
            background: tokens.color.surfaceMuted,
            borderRadius: tokens.radius.xl,
            padding: `6px 6px 6px ${tokens.space[3]}`,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 2,
              paddingBottom: 2,
            }}
          >
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Attach file"
              disabled={isRecording || uploading}
              onClick={() => attachRef.current?.click()}
              icon={<Paperclip size={16} strokeWidth={1.75} />}
            />
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Attach image"
              disabled={isRecording || uploading}
              onClick={() => imageRef.current?.click()}
              icon={<ImageIcon size={16} strokeWidth={1.75} />}
            />
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
            placeholder={isRecording ? "Recording…" : "Message the group…"}
            disabled={isRecording || uploading}
            rows={1}
            className="no-scrollbar"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: tokens.color.text,
              resize: "none",
              lineHeight: 1.5,
              padding: "6px 4px",
              maxHeight: 100,
              overflowY: "auto",
              fontFamily: "inherit",
              opacity: isRecording ? 0.4 : 1,
            }}
          />

          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Emoji picker"
            disabled={uploading}
            onClick={() => setShowEmoji((v) => !v)}
            icon={<Smile size={18} strokeWidth={1.75} />}
            style={
              showEmoji
                ? { background: "rgba(255, 107, 53, 0.1)", color: tokens.color.warm }
                : undefined
            }
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              paddingBottom: 2,
            }}
          >
            {canSend || isRecording ? (
              <IconButton
                variant="primary"
                size="sm"
                aria-label={isRecording ? "Stop recording" : "Send"}
                disabled={sending || uploading}
                onClick={isRecording ? handleVoiceToggle : sendText}
                icon={
                  isRecording ? (
                    <StopCircle size={16} strokeWidth={1.75} />
                  ) : (
                    <Send size={14} strokeWidth={1.75} />
                  )
                }
              />
            ) : (
              <>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Voice message"
                  disabled={uploading}
                  onClick={handleVoiceToggle}
                  icon={<Mic size={18} strokeWidth={1.75} />}
                />
                <IconButton
                  variant="primary"
                  size="sm"
                  aria-label="Thumbs up"
                  disabled={sending || uploading}
                  onClick={sendQuickEmoji}
                  icon={<ThumbsUp size={16} strokeWidth={1.75} />}
                />
              </>
            )}
          </div>
        </div>

        {uploading && (
          <Caption
            tone="muted"
            style={{
              position: "absolute",
              top: -16,
              left: 24,
            }}
          >
            Sending file…
          </Caption>
        )}
      </div>
    </div>
  );
}

function CountdownDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span style={{ fontFamily: "monospace", fontWeight: tokens.type.weight.bold }}>
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

function VoiceChatPanel({
  members,
  voice,
  myUserId,
}: {
  members: RoomMember[];
  voice: VoiceRoomState;
  myUserId: number | null;
}) {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const toggleSettings = () => {
    setShowVoiceSettings((prev) => {
      const next = !prev;
      if (next) void voice.refreshAudioDevices();
      return next;
    });
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: tokens.color.surface,
      }}
    >
      <div
        style={{
          padding: `${tokens.space[3]} ${tokens.space[4]}`,
          borderBottom: `1px solid ${tokens.color.border}`,
        }}
      >
        <Eyebrow tone="muted">Voice participants</Eyebrow>
      </div>

      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: tokens.space[3],
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: tokens.space[3],
        }}
      >
        {members.map((m) => {
          const isMe = m.id === myUserId;
          const isOnline = isMe
            ? voice.isConnected
            : voice.voiceParticipants.has(m.id);
          const isSpeaking = isOnline && voice.speakingUsers.has(m.id);
          const isMuted = isOnline
            ? isMe
              ? voice.isMuted
              : voice.mutedUsers.has(m.id)
            : true;
          return (
            <Card
              key={m.id}
              radius="md"
              padding="sm"
              shadow={isSpeaking ? "md" : "none"}
              surface={isOnline ? "default" : "muted"}
              style={{
                aspectRatio: "1 / 1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: tokens.space[2],
                opacity: isOnline ? 1 : 0.7,
                border: isSpeaking
                  ? `1.5px solid ${tokens.color.warm}`
                  : `1px solid ${tokens.color.border}`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: "50%",
                  overflow: "hidden",
                  width: 72,
                  height: 72,
                  boxShadow: isSpeaking
                    ? `0 0 0 3px rgba(255, 107, 53, 0.45)`
                    : `0 0 0 2px ${tokens.color.border}`,
                  transition: "box-shadow 0.22s ease",
                }}
              >
                <img
                  src={m.avatar}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: isOnline ? "none" : "grayscale(0.65) saturate(0.75)",
                  }}
                />
              </div>

              <div style={{ textAlign: "center", minWidth: 0, width: "100%" }}>
                <BodySm
                  style={{
                    fontWeight: tokens.type.weight.semibold,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.name}
                </BodySm>
                <Caption tone="muted">
                  {!isOnline ? "Offline" : isSpeaking ? "Speaking…" : "Idle"}
                </Caption>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: tokens.space[1],
                  flexWrap: "wrap",
                }}
              >
                <Pill tone={isOnline ? "success" : "neutral"} size="sm">
                  {isOnline ? "Online" : "Offline"}
                </Pill>
                <Pill tone={isMuted ? "danger" : "success"} size="sm">
                  {isMuted ? "Mic off" : "Mic on"}
                </Pill>
                <Pill tone={m.is_ready ? "success" : "neutral"} size="sm">
                  {m.is_ready ? "Ready" : "Unready"}
                </Pill>
              </div>
            </Card>
          );
        })}
      </div>

      <div
        style={{
          padding: `${tokens.space[3]} ${tokens.space[4]}`,
          borderTop: `1px solid ${tokens.color.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: tokens.color.surfaceMuted,
        }}
      >
        <BodySm
          tone="muted"
          style={{
            color: voice.error ? tokens.color.danger : tokens.color.textMuted,
            fontWeight: tokens.type.weight.semibold,
          }}
        >
          {voice.error
            ? voice.error
            : voice.isConnecting
              ? "Connecting…"
              : voice.isConnected
                ? voice.isDeafened
                  ? "Connected · Speaker off"
                  : "Connected"
                : "Not connected"}
        </BodySm>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[2],
          }}
        >
          <IconButton
            variant="secondary"
            size="sm"
            aria-label={
              voice.isConnecting
                ? "Connecting"
                : voice.isConnected
                  ? "Disconnect"
                  : "Connect"
            }
            disabled={voice.isConnecting}
            onClick={() => {
              if (voice.isConnecting) return;
              if (voice.isConnected) voice.disconnect();
              else void voice.connect();
            }}
            icon={<Signal size={16} strokeWidth={1.75} />}
            style={
              voice.isConnected
                ? { background: "rgba(52, 199, 89, 0.12)", color: tokens.color.success }
                : undefined
            }
          />
          <IconButton
            variant="secondary"
            size="sm"
            aria-label={voice.isDeafened ? "Unmute speaker" : "Mute speaker"}
            disabled={!voice.isConnected || voice.isConnecting}
            onClick={voice.toggleDeafen}
            icon={
              voice.isDeafened ? (
                <VolumeX size={16} strokeWidth={1.75} />
              ) : (
                <Volume2 size={16} strokeWidth={1.75} />
              )
            }
            style={
              voice.isDeafened
                ? { background: "rgba(251, 191, 36, 0.15)", color: "#92580d" }
                : undefined
            }
          />
          <IconButton
            variant="secondary"
            size="sm"
            aria-label={voice.isMuted ? "Unmute mic" : "Mute mic"}
            disabled={!voice.isConnected || voice.isConnecting}
            onClick={voice.toggleMute}
            icon={
              voice.isMuted ? (
                <MicOff size={16} strokeWidth={1.75} />
              ) : (
                <Mic size={16} strokeWidth={1.75} />
              )
            }
            style={
              voice.isMuted
                ? { background: "rgba(230, 57, 70, 0.12)", color: tokens.color.danger }
                : undefined
            }
          />
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Voice settings"
            onClick={toggleSettings}
            icon={<Settings2 size={16} strokeWidth={1.75} />}
            style={
              showVoiceSettings
                ? { background: "rgba(10, 132, 255, 0.12)", color: tokens.color.cool }
                : undefined
            }
          />
        </div>
      </div>

      {showVoiceSettings && (
        <div
          style={{
            padding: `${tokens.space[3]} ${tokens.space[4]}`,
            borderTop: `1px solid ${tokens.color.border}`,
            background: tokens.color.surface,
          }}
        >
          <Eyebrow tone="muted" style={{ marginBottom: tokens.space[3], display: "block" }}>
            Voice settings
          </Eyebrow>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[3],
            }}
          >
            <div>
              <BodySm
                style={{
                  fontWeight: tokens.type.weight.semibold,
                  marginBottom: tokens.space[1],
                }}
              >
                Input device (microphone)
              </BodySm>
              <select
                value={voice.selectedInputDeviceId ?? ""}
                onChange={(e) => void voice.setInputDevice(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: 12,
                  padding: `${tokens.space[2]} ${tokens.space[3]}`,
                  borderRadius: tokens.radius.sm,
                  border: `1px solid ${tokens.color.border}`,
                  background: tokens.color.surfaceMuted,
                  fontFamily: "inherit",
                  color: tokens.color.text,
                }}
              >
                {voice.availableInputDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <BodySm
                style={{
                  fontWeight: tokens.type.weight.semibold,
                  marginBottom: tokens.space[1],
                }}
              >
                Input volume ({Math.round(voice.inputVolume * 100)}%)
              </BodySm>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(voice.inputVolume * 100)}
                onChange={(e) =>
                  voice.setInputVolume(Number(e.target.value) / 100)
                }
                style={{ width: "100%", accentColor: tokens.color.warm }}
              />
            </div>

            <div>
              <BodySm
                style={{
                  fontWeight: tokens.type.weight.semibold,
                  marginBottom: tokens.space[1],
                }}
              >
                Output device (speaker)
              </BodySm>
              <select
                value={voice.selectedOutputDeviceId ?? ""}
                onChange={(e) => void voice.setOutputDevice(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: 12,
                  padding: `${tokens.space[2]} ${tokens.space[3]}`,
                  borderRadius: tokens.radius.sm,
                  border: `1px solid ${tokens.color.border}`,
                  background: tokens.color.surfaceMuted,
                  fontFamily: "inherit",
                  color: tokens.color.text,
                }}
              >
                {voice.availableOutputDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <BodySm
                style={{
                  fontWeight: tokens.type.weight.semibold,
                  marginBottom: tokens.space[1],
                }}
              >
                Output volume ({Math.round(voice.outputVolume * 100)}%)
              </BodySm>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(voice.outputVolume * 100)}
                onChange={(e) =>
                  voice.setOutputVolume(Number(e.target.value) / 100)
                }
                style={{ width: "100%", accentColor: tokens.color.warm }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = String(params?.id ?? "");
  const { user } = useAuth();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");
  const [meReady, setMeReady] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const myUserIdRef = useRef<number | null>(null);

  const [voiceToken, setVoiceToken] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) setVoiceToken(session?.access_token || "");
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setVoiceToken(session?.access_token || "");
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  const voice = useVoiceRoom(roomId, user?.id || 0, voiceToken);

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
          } catch (joinErr) {
            console.warn("Join error:", joinErr);
          }
        }
        if (cancelled) return;
        setRoom(data);
        setMembers(data.members.map(mapMember));
        myUserIdRef.current = user.id;
        const myMember = data.members.find((m) => m.user_id === user.id);
        if (myMember) setMeReady(myMember.is_ready);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load room.";
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoadingRoom(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, user]);

  useEffect(() => {
    if (!roomId || loadingRoom) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
        setRoom(data);
        setMembers(data.members.map(mapMember));
        if (user?.id) {
          const myMember = data.members.find((m) => m.user_id === user.id);
          if (myMember) setMeReady(myMember.is_ready);
        }
      } catch {
        /* silent */
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomId, loadingRoom, user?.id]);

  const readyCount = members.filter((m) => m.is_ready).length;
  const allReady = readyCount === members.length && members.length > 0;
  const isHost = members.find((m) => m.is_host)?.id === myUserIdRef.current;

  const handleToggleReady = useCallback(async () => {
    if (!user?.id) return;
    const next = !meReady;
    setMeReady(next);
    setMembers((ms) =>
      ms.map((m) => (m.id === user.id ? { ...m, is_ready: next } : m)),
    );
    try {
      await apiPatch(`/api/v1/groups/${roomId}/ready`, { is_ready: next });
      const data = await apiGet<RoomData>(`/api/v1/groups/${roomId}`);
      setRoom(data);
      setMembers(data.members.map(mapMember));
      const mine = data.members.find((m) => m.user_id === user.id);
      if (mine) setMeReady(mine.is_ready);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update ready state.";
      toast.error(msg);
      setMeReady(!next);
      setMembers((ms) =>
        ms.map((m) => (m.id === user.id ? { ...m, is_ready: !next } : m)),
      );
    }
  }, [meReady, roomId, user?.id]);

  const handleLaunch = useCallback(async () => {
    if (!allReady) {
      toast.error("Wait for everyone to be ready.");
      return;
    }
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(countdownRef.current!);
          apiPost(`/api/v1/groups/${roomId}/launch`)
            .then(() => {
              setRoom((prev) => (prev ? { ...prev, status: "in_progress" } : prev));
              toast.success("Session launched.");
            })
            .catch((err) => {
              const msg = err instanceof Error ? err.message : "Failed to launch session.";
              toast.error(msg);
            });
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }, [allReady, roomId]);

  const handleDeleteRoom = useCallback(async () => {
    if (!isHost) {
      toast.error("Only the room owner can delete this room.");
      return;
    }
    const confirmed = window.confirm(
      "Delete this room for everyone? This action cannot be undone.",
    );
    if (!confirmed) return;
    setDeletingRoom(true);
    try {
      await apiDelete(`/api/v1/groups/${roomId}`);
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      voice.disconnect();
      toast.success("Room deleted.");
      router.push("/group-rooms");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete room.";
      toast.error(msg);
    } finally {
      setDeletingRoom(false);
    }
  }, [isHost, roomId, router, voice]);

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
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space[4],
          background: tokens.color.bg,
        }}
      >
        {loadingRoom ? (
          <>
            <Loader2
              size={32}
              strokeWidth={1.75}
              style={{
                color: tokens.color.warm,
                animation: "spin 0.8s linear infinite",
              }}
            />
            <BodySm tone="muted">Joining room…</BodySm>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <Body style={{ fontWeight: tokens.type.weight.bold, fontSize: 18 }}>
              Room not found
            </Body>
            <Link
              href="/group-rooms"
              style={{
                color: tokens.color.warm,
                textDecoration: "none",
                fontWeight: tokens.type.weight.semibold,
              }}
            >
              Back to rooms
            </Link>
          </>
        )}
      </div>
    );
  }

  const coverImage =
    room.cover_image_url ??
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop";

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
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: tokens.color.bg,
        color: tokens.color.text,
      }}
    >
      <div
        style={{
          position: "relative",
          height: 160,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={coverImage}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10, 10, 10, 0.15) 0%, rgba(10, 10, 10, 0.72) 100%)",
          }}
        />

        <Link
          href="/group-rooms"
          style={{
            position: "absolute",
            top: tokens.space[4],
            left: tokens.space[4],
            textDecoration: "none",
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ChevronLeft size={15} strokeWidth={1.75} />}
            style={{
              background: "rgba(10, 10, 10, 0.3)",
              color: tokens.color.textInverse,
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            Group rooms
          </Button>
        </Link>

        <div
          style={{
            position: "absolute",
            top: tokens.space[4],
            right: tokens.space[4],
          }}
        >
          <Pill
            tone={room.is_public ? "success" : "magic"}
            size="sm"
            solid
            leftIcon={
              room.is_public ? (
                <Globe size={9} strokeWidth={1.75} />
              ) : (
                <Lock size={9} strokeWidth={1.75} />
              )
            }
          >
            {room.is_public ? "Public" : "Private"}
          </Pill>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: `0 ${tokens.space[5]} ${tokens.space[4]}`,
          }}
        >
          <Caption
            tone="inverse"
            style={{ opacity: 0.65, marginBottom: 4, display: "block" }}
          >
            {room.route_description ?? "Group room"}
          </Caption>
          <H1
            style={{
              color: tokens.color.textInverse,
              fontSize: 23,
              textShadow: "0 1px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {room.name}
          </H1>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRight: `1px solid ${tokens.color.border}`,
            background: tokens.color.surface,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
              padding: `${tokens.space[3]} ${tokens.space[5]}`,
              borderBottom: `1px solid ${tokens.color.border}`,
              background: tokens.color.surfaceMuted,
            }}
          >
            <Pill
              tone="neutral"
              size="sm"
              leftIcon={<Users size={12} strokeWidth={1.75} />}
            >
              {members.length} / {room.max_spots}
            </Pill>
            <Pill
              tone="neutral"
              size="sm"
              leftIcon={<Clock size={12} strokeWidth={1.75} />}
            >
              {room.scheduled_time
                ? new Date(room.scheduled_time).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "Tonight at 8 PM"}
            </Pill>
            {!room.is_public && room.invite_code && (
              <Button
                variant={codeCopied ? "secondary" : "ghost"}
                size="sm"
                leftIcon={
                  codeCopied ? (
                    <Check size={11} strokeWidth={1.75} />
                  ) : (
                    <Copy size={11} strokeWidth={1.75} />
                  )
                }
                onClick={handleCopyCode}
                style={{
                  marginLeft: "auto",
                  color: codeCopied ? tokens.color.success : tokens.color.magic,
                }}
              >
                {codeCopied ? "Copied" : room.invite_code}
              </Button>
            )}
          </div>

          {room.status === "active" && (
            <div
              style={{
                padding: `${tokens.space[4]} ${tokens.space[5]}`,
                borderBottom: `1px solid ${tokens.color.border}`,
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[3],
              }}
            >
              <ReadyBar members={members} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                }}
              >
                <Button
                  variant={meReady ? "secondary" : "secondary"}
                  size="md"
                  fullWidth
                  leftIcon={
                    meReady ? <Check size={15} strokeWidth={1.75} /> : undefined
                  }
                  onClick={handleToggleReady}
                  style={
                    meReady
                      ? {
                          background: "rgba(52, 199, 89, 0.1)",
                          color: tokens.color.success,
                          borderColor: tokens.color.success,
                        }
                      : undefined
                  }
                >
                  {meReady ? "Ready" : "Mark as ready"}
                </Button>

                {isHost && (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!allReady || countdown !== null}
                    onClick={countdown !== null ? undefined : handleLaunch}
                    leftIcon={
                      countdown !== null ? (
                        <Clock size={14} strokeWidth={1.75} />
                      ) : (
                        <Play size={14} strokeWidth={1.75} />
                      )
                    }
                    style={
                      allReady && countdown === null
                        ? { background: tokens.color.success, minWidth: 140 }
                        : { minWidth: 140 }
                    }
                  >
                    {countdown !== null ? (
                      <CountdownDisplay seconds={countdown} />
                    ) : (
                      "Launch tour"
                    )}
                  </Button>
                )}
              </div>

              {isHost && (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  loading={deletingRoom}
                  disabled={countdown !== null}
                  leftIcon={<X size={14} strokeWidth={1.75} />}
                  onClick={handleDeleteRoom}
                  style={{ color: tokens.color.danger }}
                >
                  {deletingRoom ? "Deleting room…" : "Delete room"}
                </Button>
              )}
            </div>
          )}

          {room.status === "in_progress" || room.status === "completed" ? (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <GroupSwipeView
                groupId={roomId}
                isHost={isHost}
                onStatusChange={(newStatus) => {
                  setRoom((prev) =>
                    prev ? { ...prev, status: newStatus } : prev,
                  );
                }}
              />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: tokens.space[8],
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: tokens.radius.xl,
                  background: tokens.color.surfaceMuted,
                  color: tokens.color.textMuted,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: tokens.space[5],
                }}
              >
                <Zap size={36} strokeWidth={1.5} />
              </div>
              <H3 style={{ marginBottom: tokens.space[2] }}>Waiting to launch</H3>
              <BodySm tone="muted" style={{ maxWidth: 400 }}>
                Once everyone marks ready and the host launches, you&apos;ll all
                enter the Tour Builder together to swipe and vote on spots.
              </BodySm>
              <div
                style={{
                  display: "flex",
                  gap: tokens.space[3],
                  marginTop: tokens.space[6],
                }}
              >
                <Pill
                  tone="neutral"
                  size="md"
                  leftIcon={<Users size={14} strokeWidth={1.75} />}
                >
                  {members.length} / {room.max_spots} joined
                </Pill>
                <Pill
                  tone="neutral"
                  size="md"
                  leftIcon={<Check size={14} strokeWidth={1.75} />}
                >
                  {readyCount} ready
                </Pill>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
            width: 360,
            background: tokens.color.surfaceMuted,
          }}
        >
          <div
            style={{
              padding: tokens.space[2],
              borderBottom: `1px solid ${tokens.color.border}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 4,
                background: tokens.color.surface,
                borderRadius: tokens.radius.pill,
                border: `1px solid ${tokens.color.border}`,
              }}
            >
              {(["text", "voice"] as const).map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: tokens.space[1],
                      padding: `${tokens.space[2]} 0`,
                      fontSize: tokens.type.size.bodySm,
                      fontWeight: tokens.type.weight.semibold,
                      borderRadius: tokens.radius.pill,
                      border: "none",
                      background: active ? tokens.color.warm : "transparent",
                      color: active ? tokens.color.textInverse : tokens.color.textMuted,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {tab === "text" ? (
                      <MessageSquare size={14} strokeWidth={1.75} />
                    ) : (
                      <Mic size={14} strokeWidth={1.75} />
                    )}
                    {tab === "text" ? "Text chat" : "Voice chat"}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === "text" ? (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
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
                  key="voice"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: "100%" }}
                >
                  <VoiceChatPanel
                    members={members}
                    voice={voice}
                    myUserId={myUserIdRef.current}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
