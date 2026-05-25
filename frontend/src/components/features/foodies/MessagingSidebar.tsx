"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  Avatar,
  IconButton,
  Input,
} from "@/components/OnceUI";

// ── Premium Icons (lucide-react) ──
import {
  MessageCircle,
  Send,
  Smile,
  ThumbsUp,
  Search,
  CheckCheck,
  PhoneCall,
  Video,
  MoreVertical,
  ChevronRight,
  Pin,
  Palette,
  AtSign,
  FileText,
  BellOff,
  Clock3,
  Lock,
  Ban,
  Flag,
  Info,
  Paperclip,
  ImageIcon,
  Mic,
  PanelRightClose,
  X,
  Trash2,
  Edit2,
  Film,
  Play,
  Pause,
} from "lucide-react";

import { Friend } from "./FriendRow";
import { useMessages } from "../../../hooks/useMessages";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";

interface MessagingSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeUser: Friend | null;
}

// ─── Helpers ───────────────────────────────────────────
function isYesterday(time: unknown) {
  return typeof time === "string" && time.toLowerCase().includes("yesterday");
}

function getDateLabel(time: unknown, createdAt?: string | null): string {
  if (isYesterday(time)) return "Yesterday";

  if (typeof createdAt === "string" && createdAt.trim().length > 0) {
    const messageDate = new Date(createdAt);
    if (!Number.isNaN(messageDate.getTime())) {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);

      if (messageDate >= todayStart) return "Today";
      if (messageDate >= yesterdayStart && messageDate < todayStart)
        return "Yesterday";
    }
  }

  return "Today";
}

function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.split(";", 1)[0]?.trim()?.toLowerCase();
  return normalized || "application/octet-stream";
}

function getAudioFileExtension(mimeType: string): string {
  const extensionMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mp4": "mp4",
    "audio/x-m4a": "m4a",
    "audio/aac": "aac",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
  };

  return extensionMap[mimeType] ?? mimeType.split("/")[1] ?? "webm";
}

function formatVoiceDuration(duration: unknown): string {
  const seconds = typeof duration === "number" ? duration : Number(duration);
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const rounded = Math.round(seconds);
  const minutesPart = Math.floor(rounded / 60);
  const secondsPart = String(rounded % 60).padStart(2, "0");
  return `${minutesPart}:${secondsPart}`;
}

type VoiceMessagePlayerProps = {
  src: string;
  isMe: boolean;
  durationHint?: unknown;
};

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  src,
  isMe,
  durationHint,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hintedDurationSeconds =
    typeof durationHint === "number" ? durationHint : Number(durationHint);
  const hasHintedDuration =
    Number.isFinite(hintedDurationSeconds) && hintedDurationSeconds > 0;
  const totalDuration =
    duration > 0 ? duration : hasHintedDuration ? hintedDurationSeconds : 0;

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const handleTogglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    const mediaDuration = audioRef.current?.duration ?? 0;
    if (Number.isFinite(mediaDuration) && mediaDuration > 0) {
      setDuration(mediaDuration);
    }
  };

  const handleTimeUpdate = () => {
    const nextTime = audioRef.current?.currentTime ?? 0;
    setCurrentTime(nextTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextTime = Number(event.target.value);
    if (!Number.isFinite(nextTime)) return;

    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
    setCurrentTime(nextTime);
  };

  return (
    <Column
      style={{
        gap: 8,
        minWidth: 220,
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ display: "none" }}
      >
        Your browser does not support audio playback.
      </audio>

      <Row vertical="center" style={{ gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={handleTogglePlayback}
          aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isMe
              ? "rgba(255,255,255,0.2)"
              : "rgba(255,107,53,0.14)",
            color: isMe ? "#ffffff" : "var(--dsc-accent-warm)",
            flexShrink: 0,
          }}
        >
          {isPlaying ? (
            <Pause size={14} strokeWidth={2.6} />
          ) : (
            <Play size={14} strokeWidth={2.6} />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(totalDuration, 0.1)}
          step={0.05}
          value={Math.min(currentTime, Math.max(totalDuration, 0.1))}
          onChange={handleSeek}
          aria-label="Voice message timeline"
          style={{
            flex: 1,
            margin: 0,
            cursor: totalDuration > 0 ? "pointer" : "default",
            accentColor: isMe ? "#ffffff" : "#ff6b35",
            opacity: totalDuration > 0 ? 1 : 0.65,
          }}
        />

        <Text
          style={{
            fontSize: 11,
            color: isMe ? "rgba(255,255,255,0.9)" : "var(--dsc-text-subtle)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            minWidth: 78,
            textAlign: "right",
          }}
        >
          {formatVoiceDuration(currentTime)} /{" "}
          {formatVoiceDuration(totalDuration)}
        </Text>
      </Row>
    </Column>
  );
};

// border-radius per position in consecutive group
function bubbleRadius(
  sender: "me" | "them",
  pos: "single" | "first" | "middle" | "last",
): string {
  const R = 18;
  const t = 4; // tight corner
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

// ─── Date separator ────────────────────────────────────
const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <Row style={{ alignItems: "center", gap: 12, padding: "4px 0" }}>
    <div style={{ flex: 1, height: 1, backgroundColor: "var(--dsc-border)" }} />
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--dsc-text-subtle)",
        backgroundColor: "var(--dsc-surface-muted)",
        padding: "4px 12px",
        borderRadius: 20,
        border: "1px solid var(--dsc-border)",
        whiteSpace: "nowrap",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </span>
    <div style={{ flex: 1, height: 1, backgroundColor: "var(--dsc-border)" }} />
  </Row>
);

type HeaderMenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  subtitle?: string;
  danger?: boolean;
};

type HeaderMenuSection = {
  title: string;
  items: HeaderMenuItem[];
};

const EMOJI_PICKER_ITEMS: Array<{ emoji: string; label: string }> = [
  { emoji: "😀", label: "grinning" },
  { emoji: "😃", label: "happy" },
  { emoji: "😄", label: "smile" },
  { emoji: "😁", label: "beam" },
  { emoji: "😆", label: "laugh" },
  { emoji: "😅", label: "sweat smile" },
  { emoji: "😂", label: "joy" },
  { emoji: "🤣", label: "rofl" },
  { emoji: "🙂", label: "slight smile" },
  { emoji: "😊", label: "blush" },
  { emoji: "😉", label: "wink" },
  { emoji: "😍", label: "heart eyes" },
  { emoji: "😘", label: "kiss" },
  { emoji: "😎", label: "cool" },
  { emoji: "🤩", label: "star eyes" },
  { emoji: "🥳", label: "party" },
  { emoji: "🤔", label: "thinking" },
  { emoji: "🫡", label: "salute" },
  { emoji: "😴", label: "sleep" },
  { emoji: "🥱", label: "yawn" },
  { emoji: "😋", label: "yum" },
  { emoji: "🤤", label: "drool" },
  { emoji: "🥺", label: "pleading" },
  { emoji: "🙏", label: "pray" },
  { emoji: "👏", label: "clap" },
  { emoji: "🔥", label: "fire" },
  { emoji: "✨", label: "sparkles" },
  { emoji: "🎉", label: "party popper" },
  { emoji: "💯", label: "hundred" },
  { emoji: "❤️", label: "heart" },
  { emoji: "🧡", label: "orange heart" },
  { emoji: "💛", label: "yellow heart" },
  { emoji: "💚", label: "green heart" },
  { emoji: "💙", label: "blue heart" },
  { emoji: "💜", label: "purple heart" },
  { emoji: "🤍", label: "white heart" },
  { emoji: "🖤", label: "black heart" },
  { emoji: "👍", label: "thumbs up" },
  { emoji: "👎", label: "thumbs down" },
  { emoji: "👌", label: "ok hand" },
];

// ─── Main Component ─────────────────────────────────────
export const MessagingSidebar: React.FC<MessagingSidebarProps> = ({
  isOpen,
  onToggle,
  activeUser,
}) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [hoveredMessageKey, setHoveredMessageKey] = useState<string | null>(
    null,
  );
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);
  const {
    messages: chatHistory,
    sending,
    sendMessage,
    refetch: refetchMessages,
    loadMore,
    hasMore,
  } = useMessages(activeUser?.id ?? null);
  const {
    uploadFile,
    uploading: mediaUploading,
    reset: resetUpload,
  } = useMediaUpload();
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

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const mapMimeToMessageType = (
    mimeType: string,
  ): "image" | "voice" | "video" | "file" => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "voice";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
  };

  const sendUploadedMedia = async (
    file: File,
    forcedType?: "image" | "voice" | "video" | "file",
  ) => {
    if (!activeUser) return;

    const uploadResult = await uploadFile(file);
    const mediaType =
      forcedType ?? mapMimeToMessageType(uploadResult.file_type);
    const text = message.trim();
    const mediaOnlyFallbackText = mediaType === "file" ? file.name : "";

    await sendMessage(text || mediaOnlyFallbackText, {
      content_type: mediaType,
      media_url: uploadResult.url,
      media_meta: {
        size_bytes: uploadResult.size_bytes,
      },
      reply_to_id: replyTo || undefined,
    });

    setMessage("");
    setReplyTo(null);
    resetUpload();
  };

  const sendVoiceFromBlob = async (blob: Blob, durationSeconds: number) => {
    if (!activeUser) return;

    const normalizedVoiceMime = normalizeMimeType(
      blob.type || audioMimeType || "audio/webm",
    );
    const voiceExtension = getAudioFileExtension(normalizedVoiceMime);
    const file = new File([blob], `voice_${Date.now()}.${voiceExtension}`, {
      type: normalizedVoiceMime,
    });

    const uploadResult = await uploadFile(file);
    const text = message.trim();

    await sendMessage(text || "", {
      content_type: "voice",
      media_url: uploadResult.url,
      media_meta: {
        duration: Math.max(0, Math.round(durationSeconds)),
        size_bytes: uploadResult.size_bytes,
      },
      reply_to_id: replyTo || undefined,
    });

    setMessage("");
    setReplyTo(null);
    resetRecording();
  };

  const handleSend = async () => {
    const text = message.trim();
    if (
      !activeUser ||
      isRecording ||
      (!text && !audioBlob) ||
      sending ||
      mediaUploading
    )
      return;

    try {
      if (audioBlob) {
        await sendVoiceFromBlob(audioBlob, recordingTime);
      } else if (editingMessageId) {
        if (editingMessageId <= 0 || !activeUser?.id) {
          // Optimistic / invalid IDs cannot be edited on backend — send as new message instead.
          await sendMessage(text, {
            reply_to_id: replyTo || undefined,
          });
          setEditingMessageId(null);
        } else {
          // Edit existing message
          await apiPatch(
            `/api/v1/messages/${activeUser.id}/${editingMessageId}`,
            {
              text,
            },
          );
          setEditingMessageId(null);
        }
      } else {
        // Send new text message
        await sendMessage(text, {
          reply_to_id: replyTo || undefined,
        });
      }
      setMessage("");
      setReplyTo(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "";

      if (editingMessageId) {
        // Always exit edit mode if editing request fails to avoid repeated failing attempts.
        setEditingMessageId(null);

        const shouldFallbackToNewMessage =
          /Cannot edit message/i.test(errorMessage) ||
          /offset-naive|offset-aware/i.test(errorMessage);

        if (shouldFallbackToNewMessage && text) {
          try {
            await sendMessage(text, {
              reply_to_id: replyTo || undefined,
            });
            setMessage("");
            setReplyTo(null);
            return;
          } catch {
            // Fall through to generic error log below.
          }
        }
      }

      console.error("Failed to send message.");
    }
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sendUploadedMedia(file);
    } catch (err: unknown) {
      console.error("Failed to upload attachment:", err);
    } finally {
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sendUploadedMedia(file, "image");
    } catch (err: unknown) {
      console.error("Failed to upload image:", err);
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleGifUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sendUploadedMedia(file, "image");
    } catch (err: unknown) {
      console.error("Failed to upload GIF:", err);
    } finally {
      if (gifInputRef.current) gifInputRef.current.value = "";
    }
  };

  const handleAttachmentClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleGifClick = () => {
    gifInputRef.current?.click();
  };

  const handleVoiceToggle = async () => {
    if (!activeUser || sending || mediaUploading) return;

    if (isRecording) {
      const recordedDuration = Math.max(0, Math.round(recordingTime));
      const recordedBlob = await stopRecording();
      if (!recordedBlob) return;

      try {
        await sendVoiceFromBlob(recordedBlob, recordedDuration);
      } catch (err: unknown) {
        console.error("Failed to send voice message:", err);
      }
    } else {
      await startRecording();
    }
  };

  const handleCancelRecording = () => {
    resetRecording();
  };

  const handleReaction = async (messageId: number, emoji: string) => {
    if (!activeUser) return;
    try {
      await apiPost(
        `/api/v1/messages/${activeUser.id}/${messageId}/reactions`,
        {
          emoji,
        },
      );
      // Refetch messages to get updated reactions
      await refetchMessages();
    } catch (err: unknown) {
      console.error("Failed to add reaction:", err);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!activeUser) return;
    try {
      await apiDelete(`/api/v1/messages/${activeUser.id}/${messageId}`);
      await refetchMessages();
    } catch (err: unknown) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleEditMessage = (messageId: number, text: string) => {
    setEditingMessageId(messageId);
    setMessage(text);
  };

  const handleQuickEmoji = async () => {
    if (!activeUser || sending || mediaUploading || isRecording) return;

    try {
      await sendMessage("👍", {
        reply_to_id: replyTo || undefined,
      });
      setReplyTo(null);
    } catch (err: unknown) {
      console.error("Failed to send quick emoji:", err);
    }
  };

  const handleToggleEmojiPicker = () => {
    if (!activeUser || sending || mediaUploading) return;
    setIsEmojiPickerOpen((prev) => !prev);
  };

  const handleSelectEmoji = (emoji: string) => {
    setMessage((prev) => `${prev}${emoji}`);
  };

  const handleToggleHeaderMenu = () => {
    setIsHeaderMenuOpen((prev) => !prev);
  };

  const handleCloseHeaderMenu = () => {
    setIsHeaderMenuOpen(false);
  };

  useEffect(() => {
    if (!isHeaderMenuOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target as Node)
      ) {
        setIsHeaderMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHeaderMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isHeaderMenuOpen]);

  useEffect(() => {
    if (!isEmojiPickerOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isEmojiPickerOpen]);

  useEffect(() => {
    setIsHeaderMenuOpen(false);
    setIsEmojiPickerOpen(false);
    setEmojiQuery("");
  }, [activeUser?.id]);

  const lastMessage = chatHistory[chatHistory.length - 1];
  const lastMessageSignature = lastMessage
    ? `${lastMessage.id}-${lastMessage.created_at}-${lastMessage.is_pending ? "pending" : "sent"}`
    : "empty";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastMessageSignature, activeUser?.id]);

  if (!isOpen) return null;

  // ── Build enriched message list with group positions & date separators ──
  type EnrichedMsg = (typeof chatHistory)[number] & {
    pos: "single" | "first" | "middle" | "last";
    showDate: string | null;
    isLastMe: boolean;
  };

  const enriched: EnrichedMsg[] = chatHistory.map((msg, i, arr) => {
    const prev = arr[i - 1];
    const next = arr[i + 1];
    const sameAsPrev = prev?.sender === msg.sender;
    const sameAsNext = next?.sender === msg.sender;

    let pos: EnrichedMsg["pos"];
    if (!sameAsPrev && !sameAsNext) pos = "single";
    else if (!sameAsPrev && sameAsNext) pos = "first";
    else if (sameAsPrev && sameAsNext) pos = "middle";
    else pos = "last";

    // date separator: show when date label changes between messages
    const currentDateLabel = getDateLabel(msg.time, msg.created_at);
    const previousDateLabel =
      i > 0 ? getDateLabel(arr[i - 1].time, arr[i - 1].created_at) : null;
    const showDate =
      i === 0 || currentDateLabel !== previousDateLabel
        ? currentDateLabel
        : null;

    const isLastMe = msg.sender === "me" && (!next || next.sender !== "me");

    return { ...msg, pos, showDate, isLastMe };
  });

  const composerAccent = "var(--dsc-accent-warm)";
  const canCompose = Boolean(activeUser);
  const hasComposerDraft = Boolean(message.trim()) || Boolean(audioBlob);
  const canUseMediaButtons = canCompose && !sending && !mediaUploading;
  const quickActionDisabled =
    !canCompose || sending || mediaUploading || isRecording;
  const emojiQueryNormalized = emojiQuery.trim().toLowerCase();
  const filteredEmojis = emojiQueryNormalized
    ? EMOJI_PICKER_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(emojiQueryNormalized),
      )
    : EMOJI_PICKER_ITEMS;

  const headerMenuSections: HeaderMenuSection[] = [
    {
      title: "Chat info",
      items: [
        {
          key: "pinned",
          label: "View pinned messages",
          icon: <Pin size={15} strokeWidth={2.3} />,
        },
      ],
    },
    {
      title: "Customize chat",
      items: [
        {
          key: "theme",
          label: "Change theme",
          icon: <Palette size={15} strokeWidth={2.3} />,
        },
        {
          key: "emoji",
          label: "Change emoji",
          icon: <Smile size={15} strokeWidth={2.3} />,
        },
        {
          key: "nicknames",
          label: "Edit nicknames",
          icon: <AtSign size={15} strokeWidth={2.3} />,
        },
      ],
    },
    {
      title: "Media & files",
      items: [
        {
          key: "media",
          label: "Media",
          icon: <ImageIcon size={15} strokeWidth={2.3} />,
        },
        {
          key: "files",
          label: "Files",
          icon: <FileText size={15} strokeWidth={2.3} />,
        },
      ],
    },
    {
      title: "Privacy & support",
      items: [
        {
          key: "mute",
          label: "Mute notifications",
          icon: <BellOff size={15} strokeWidth={2.3} />,
        },
        {
          key: "disappearing",
          label: "Disappearing messages",
          icon: <Clock3 size={15} strokeWidth={2.3} />,
        },
        {
          key: "read-receipts",
          label: "Read receipts",
          subtitle: "On",
          icon: <Info size={15} strokeWidth={2.3} />,
        },
        {
          key: "verify",
          label: "Verify end-to-end encryption",
          icon: <Lock size={15} strokeWidth={2.3} />,
        },
        {
          key: "block",
          label: "Block",
          icon: <Ban size={15} strokeWidth={2.3} />,
          danger: true,
        },
        {
          key: "report",
          label: "Report",
          subtitle: "Give feedback and report this conversation",
          icon: <Flag size={15} strokeWidth={2.3} />,
          danger: true,
        },
      ],
    },
  ];

  return (
    <Column
      fillHeight
      fillWidth
      style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--dsc-surface)",
        borderLeft: "1px solid var(--dsc-border)",
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
      }}
    >
      {/* ── HEADER with warm glassmorphism ── */}
      <Row
        fillWidth
        vertical="center"
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--dsc-border)",
          backgroundColor: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 10,
          boxShadow: "0 1px 0 var(--dsc-border)",
        }}
      >
        <Row vertical="center" style={{ gap: 12 }}>
          <IconButton
            icon={<PanelRightClose size={18} strokeWidth={2} />}
            onClick={onToggle}
            style={{
              borderRadius: 10,
              backgroundColor: "var(--dsc-surface-muted)",
              width: 36,
              height: 36,
              color: "var(--dsc-text-muted)",
              border: "1px solid var(--dsc-border)",
              transition: "background-color 0.15s",
            }}
          />
          {activeUser ? (
            <Row
              vertical="center"
              style={{
                gap: 12,
                cursor: "pointer",
                borderRadius: 12,
                padding: "2px 4px",
                transition: "background-color 0.15s",
              }}
              onClick={() => router.push(`/foodies/${activeUser.id}`)}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.05)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title={`View ${activeUser.name}'s profile`}
            >
              <div style={{ position: "relative" }}>
                <Avatar
                  src={activeUser.avatar}
                  size="m"
                  style={{
                    border: "2.5px solid var(--dsc-surface)",
                    boxShadow: "0 2px 10px rgba(255,107,53,0.10)",
                    display: "block",
                  }}
                />
                {activeUser.isOnline && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "var(--dsc-accent-success)",
                      border: "2px solid var(--dsc-surface)",
                    }}
                  />
                )}
              </div>
              <Column style={{ gap: 1 }}>
                <Row style={{ alignItems: "center", gap: 6 }}>
                  <Heading
                    variant="heading-strong-s"
                    style={{
                      letterSpacing: "-0.3px",
                      color: "var(--dsc-text)",
                    }}
                  >
                    {activeUser.name}
                  </Heading>
                  {activeUser.match !== undefined && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: activeUser.match >= 85 ? "#16A34A" : "#D97706",
                        backgroundColor:
                          activeUser.match >= 85
                            ? "rgba(52,199,89,0.08)"
                            : "rgba(245,158,11,0.08)",
                        padding: "2px 7px",
                        borderRadius: 10,
                      }}
                    >
                      {activeUser.match}%
                    </span>
                  )}
                </Row>
                <Text
                  variant="body-default-xs"
                  style={{
                    color: activeUser.isOnline
                      ? "var(--dsc-accent-success)"
                      : "var(--dsc-text-subtle)",
                    fontWeight: 600,
                  }}
                >
                  {activeUser.isOnline ? "Active now" : "Last seen recently"}
                </Text>
              </Column>
            </Row>
          ) : (
            <Text
              variant="body-default-s"
              style={{ color: "var(--dsc-text-subtle)" }}
            >
              Select a conversation
            </Text>
          )}
        </Row>

        <Row vertical="center" style={{ gap: 6 }}>
          <IconButton
            icon={<PhoneCall size={17} strokeWidth={2.25} />}
            style={{
              borderRadius: "50%",
              width: 36,
              height: 36,
              color: "var(--dsc-accent-warm)",
              backgroundColor: "rgba(255,107,53,0.06)",
              transition: "background-color 0.15s",
            }}
          />
          <IconButton
            icon={<Video size={17} strokeWidth={2.25} />}
            style={{
              borderRadius: "50%",
              width: 36,
              height: 36,
              color: "var(--dsc-accent-warm)",
              backgroundColor: "rgba(255,107,53,0.06)",
              transition: "background-color 0.15s",
            }}
          />

          <div ref={headerMenuRef} style={{ position: "relative" }}>
            <IconButton
              icon={<MoreVertical size={17} strokeWidth={2.25} />}
              onClick={handleToggleHeaderMenu}
              style={{
                borderRadius: "50%",
                width: 36,
                height: 36,
                color: "var(--dsc-text-subtle)",
                backgroundColor: isHeaderMenuOpen
                  ? "rgba(255,107,53,0.1)"
                  : "var(--dsc-surface-muted)",
                transition: "background-color 0.15s",
              }}
            />

            <AnimatePresence>
              {isHeaderMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "min(320px, calc(100vw - 32px))",
                    maxHeight: "min(68vh, 560px)",
                    overflowY: "auto",
                    backgroundColor: "var(--dsc-surface)",
                    borderRadius: 16,
                    border: "1px solid var(--dsc-border)",
                    boxShadow: "0 20px 40px rgba(17,24,39,0.16)",
                    padding: "8px 0",
                    zIndex: 30,
                  }}
                >
                  {headerMenuSections.map((section, sectionIdx) => (
                    <div key={section.title}>
                      <Text
                        variant="body-default-xs"
                        style={{
                          color: "var(--dsc-text-subtle)",
                          fontWeight: 700,
                          padding: "10px 16px 6px",
                          letterSpacing: "0.2px",
                        }}
                      >
                        {section.title}
                      </Text>

                      {section.items.map((item) => (
                        <button
                          key={item.key}
                          onClick={handleCloseHeaderMenu}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "0",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--dsc-surface-muted)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <Row
                            vertical="center"
                            style={{
                              gap: 10,
                              justifyContent: "space-between",
                              padding: "10px 14px",
                            }}
                          >
                            <Row vertical="center" style={{ gap: 10 }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 9,
                                  backgroundColor: item.danger
                                    ? "rgba(239,68,68,0.1)"
                                    : "rgba(255,107,53,0.1)",
                                  color: item.danger
                                    ? "#ef4444"
                                    : "var(--dsc-accent-warm)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {item.icon}
                              </div>

                              <Column
                                style={{ gap: 1, alignItems: "flex-start" }}
                              >
                                <Text
                                  variant="body-default-s"
                                  style={{
                                    color: item.danger
                                      ? "#dc2626"
                                      : "var(--dsc-text)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.label}
                                </Text>
                                {item.subtitle && (
                                  <Text
                                    variant="body-default-xs"
                                    style={{ color: "var(--dsc-text-subtle)" }}
                                  >
                                    {item.subtitle}
                                  </Text>
                                )}
                              </Column>
                            </Row>

                            <ChevronRight
                              size={14}
                              strokeWidth={2.3}
                              color="var(--dsc-text-subtle)"
                            />
                          </Row>
                        </button>
                      ))}

                      {sectionIdx < headerMenuSections.length - 1 && (
                        <div
                          style={{
                            height: 1,
                            margin: "6px 12px",
                            backgroundColor: "var(--dsc-border)",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Row>
      </Row>

      {/* ── CHAT AREA ── */}
      <Column
        fillWidth
        flexGrow={1}
        flexShrink={1}
        flexBasis="0%"
        className="no-scrollbar"
        style={{
          minHeight: 0,
          overflowY: "auto",
          padding: "32px 48px",
          gap: 2,
          backgroundColor: "var(--dsc-bg)",
        }}
      >
        {!activeUser ? (
          /* ── Empty state ── */
          <Column
            horizontal="center"
            vertical="center"
            fillHeight
            style={{ gap: 16 }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 26,
                background: "var(--dsc-gradient-signature-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(255,107,53,0.18)",
                boxShadow: "0 4px 20px rgba(255,107,53,0.08)",
              }}
            >
              <MessageCircle
                size={32}
                strokeWidth={2}
                color="var(--dsc-accent-warm)"
              />
            </div>
            <Column style={{ alignItems: "center", gap: 6 }}>
              <Text
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--dsc-text)",
                }}
              >
                No conversation selected
              </Text>
              <Text
                variant="body-default-s"
                style={{
                  color: "var(--dsc-text-subtle)",
                  textAlign: "center",
                  maxWidth: 220,
                }}
              >
                Pick a foodie from the list to start syncing taste
              </Text>
            </Column>
          </Column>
        ) : (
          <>
            {hasMore && (
              <Row horizontal="center" style={{ width: "100%", padding: "8px 0", marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={loadMore}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: "1px solid var(--dsc-border)",
                    backgroundColor: "var(--dsc-surface-muted)",
                    color: "var(--dsc-text)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--dsc-surface)";
                    e.currentTarget.style.borderColor = "var(--dsc-accent-warm)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--dsc-surface-muted)";
                    e.currentTarget.style.borderColor = "var(--dsc-border)";
                  }}
                >
                  Load previous messages
                </button>
              </Row>
            )}
            <AnimatePresence initial={false}>
              {enriched.map((msg, idx) => {
                const isMe = msg.sender === "me";
                const messageKey =
                  msg.client_key ??
                  (msg.id > 0
                    ? `msg-${msg.id}`
                    : `pending-${msg.created_at ?? msg.time ?? idx}`);
                const isPendingMessage =
                  isMe && (msg.is_pending === true || msg.id < 0);
                const canEditMessage =
                  isMe &&
                  msg.content_type === "text" &&
                  !msg.is_deleted &&
                  msg.id > 0 &&
                  (typeof msg.created_at !== "string" ||
                    Number.isNaN(new Date(msg.created_at).getTime()) ||
                    Date.now() - new Date(msg.created_at).getTime() <=
                      15 * 60 * 1000);
                const showAvatar =
                  !isMe && (msg.pos === "single" || msg.pos === "last");
                // gap above: smaller within a group, larger between groups
                const marginTop =
                  idx === 0
                    ? 0
                    : msg.pos === "first" || msg.pos === "single"
                      ? 16
                      : 3;

                return (
                  <React.Fragment key={messageKey}>
                    {/* Date separator */}
                    {msg.showDate && (
                      <div style={{ margin: "12px 0 8px" }}>
                        <DateSeparator label={msg.showDate} />
                      </div>
                    )}

                    {/* Message row */}
                    <motion.div
                      layout="position"
                      initial={{ opacity: 0, y: 10, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.985 }}
                      onMouseEnter={() => setHoveredMessageKey(messageKey)}
                      onMouseLeave={() => {
                        setHoveredMessageKey((prev) =>
                          prev === messageKey ? null : prev,
                        );
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                        mass: 0.75,
                      }}
                      style={{
                        display: "flex",
                        flexDirection: isMe ? "row-reverse" : "row",
                        alignItems: "flex-end",
                        gap: 8,
                        marginTop,
                      }}
                    >
                      {/* Avatar placeholder (keeps alignment for grouped messages) */}
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && (
                          <Avatar
                            src={activeUser.avatar}
                            size="s"
                            style={{
                              display: "block",
                              border: "1.5px solid var(--dsc-surface)",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            }}
                          />
                        )}
                      </div>

                      {/* Bubble */}
                      <div style={{ maxWidth: "75%" }}>
                        <div
                          style={{
                            padding:
                              msg.content_type === "text" ? "11px 16px" : "8px",
                            borderRadius: bubbleRadius(msg.sender, msg.pos),
                            background: isMe
                              ? "linear-gradient(135deg, #ff6b35 0%, #e65721 100%)"
                              : "var(--dsc-surface)",
                            color: isMe ? "white" : "var(--dsc-text)",
                            border: isMe
                              ? "none"
                              : "1px solid var(--dsc-border)",
                            boxShadow: isMe
                              ? "0 4px 16px rgba(255,107,53,0.22), 0 1px 4px rgba(255,87,33,0.15)"
                              : "0 1px 6px rgba(0,0,0,0.04)",
                            overflow: "hidden",
                            opacity: isPendingMessage ? 0.9 : 1,
                          }}
                        >
                          {/* Image message */}
                          {msg.content_type === "image" && msg.media_url && (
                            <div
                              style={{
                                position: "relative",
                                borderRadius: 12,
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={msg.media_url}
                                alt="Shared image"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: 240,
                                  borderRadius: 12,
                                  display: "block",
                                }}
                              />
                              {msg.text && (
                                <div style={{ padding: "8px 12px 0" }}>
                                  <Text
                                    variant="body-default-m"
                                    style={{
                                      color: isMe ? "white" : "var(--dsc-text)",
                                      lineHeight: 1.55,
                                    }}
                                  >
                                    {msg.text}
                                  </Text>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Voice message */}
                          {msg.content_type === "voice" && msg.media_url && (
                            <Column
                              style={{
                                gap: 8,
                                padding: "8px 10px 10px",
                                minWidth: 220,
                              }}
                            >
                              <VoiceMessagePlayer
                                src={msg.media_url}
                                isMe={isMe}
                                durationHint={msg.media_meta?.duration}
                              />

                              {msg.text && (
                                <Text
                                  variant="body-default-s"
                                  style={{
                                    color: isMe
                                      ? "rgba(255,255,255,0.9)"
                                      : "var(--dsc-text)",
                                    lineHeight: 1.45,
                                    padding: "0 2px",
                                  }}
                                >
                                  {msg.text}
                                </Text>
                              )}
                            </Column>
                          )}

                          {/* Video message */}
                          {msg.content_type === "video" && msg.media_url && (
                            <div
                              style={{ borderRadius: 12, overflow: "hidden" }}
                            >
                              <video
                                src={msg.media_url}
                                controls
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: 240,
                                  borderRadius: 12,
                                  display: "block",
                                }}
                              />
                            </div>
                          )}

                          {/* File message */}
                          {msg.content_type === "file" && msg.media_url && (
                            <Row
                              vertical="center"
                              style={{ gap: 12, padding: "8px 12px" }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: isMe
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(255,107,53,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ImageIcon
                                  size={16}
                                  strokeWidth={2.25}
                                  color={
                                    isMe ? "white" : "var(--dsc-accent-warm)"
                                  }
                                />
                              </div>
                              <Column style={{ gap: 2 }}>
                                <Text
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: isMe ? "white" : "var(--dsc-text)",
                                  }}
                                >
                                  {msg.text || "File"}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: isMe
                                      ? "rgba(255,255,255,0.8)"
                                      : "var(--dsc-text-subtle)",
                                  }}
                                >
                                  {msg.media_meta?.size_bytes
                                    ? `${(msg.media_meta.size_bytes / 1024).toFixed(0)} KB`
                                    : ""}
                                </Text>
                              </Column>
                            </Row>
                          )}

                          {/* Text message */}
                          {msg.content_type === "text" && msg.text && (
                            <Text
                              variant="body-default-m"
                              style={{
                                color: isMe ? "white" : "var(--dsc-text)",
                                lineHeight: 1.55,
                              }}
                            >
                              {msg.text}
                            </Text>
                          )}

                          {/* Edited indicator */}
                          {msg.is_edited && (
                            <Text
                              variant="body-default-xs"
                              style={{
                                color: isMe
                                  ? "rgba(255,255,255,0.7)"
                                  : "var(--dsc-text-subtle)",
                                fontSize: 10,
                                marginTop: 4,
                              }}
                            >
                              edited
                            </Text>
                          )}
                        </div>

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <Row
                            style={{ gap: 4, marginTop: 4, flexWrap: "wrap" }}
                          >
                            {msg.reactions.map((reaction, reactionIdx) => (
                              <button
                                key={`${reaction.emoji ?? "reaction"}-${reaction.count}-${reactionIdx}`}
                                onClick={() =>
                                  handleReaction(msg.id, reaction.emoji)
                                }
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  border: reaction.has_reacted
                                    ? "1px solid var(--dsc-accent-warm)"
                                    : "1px solid var(--dsc-border)",
                                  background: reaction.has_reacted
                                    ? "rgba(255,107,53,0.1)"
                                    : isMe
                                      ? "rgba(255,255,255,0.1)"
                                      : "var(--dsc-surface-muted)",
                                  color: isMe ? "white" : "var(--dsc-text)",
                                  fontSize: 12,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  transition: "background 0.15s",
                                }}
                              >
                                <span>{reaction.emoji}</span>
                                <span style={{ fontSize: 10, opacity: 0.8 }}>
                                  {reaction.count}
                                </span>
                              </button>
                            ))}
                          </Row>
                        )}

                        {/* Action buttons (hover for own messages) */}
                        {isMe &&
                          (msg.pos === "single" || msg.pos === "last") && (
                            <Row
                              style={{
                                gap: 8,
                                marginTop: 4,
                                opacity:
                                  hoveredMessageKey === messageKey ? 0.95 : 0,
                                transform:
                                  hoveredMessageKey === messageKey
                                    ? "translateY(0)"
                                    : "translateY(-2px)",
                                pointerEvents:
                                  hoveredMessageKey === messageKey
                                    ? "auto"
                                    : "none",
                                transition: "opacity 0.15s, transform 0.15s",
                              }}
                            >
                              {canEditMessage && (
                                <IconButton
                                  icon={<Edit2 size={12} strokeWidth={2.25} />}
                                  onClick={() =>
                                    msg.text &&
                                    handleEditMessage(msg.id, msg.text)
                                  }
                                  style={{
                                    width: 24,
                                    height: 24,
                                    color: isMe
                                      ? "white"
                                      : "var(--dsc-text-subtle)",
                                  }}
                                />
                              )}
                              <IconButton
                                icon={<Trash2 size={12} strokeWidth={2.25} />}
                                onClick={() => handleDeleteMessage(msg.id)}
                                style={{
                                  width: 24,
                                  height: 24,
                                  color: isMe
                                    ? "white"
                                    : "var(--dsc-text-subtle)",
                                }}
                              />
                            </Row>
                          )}

                        {/* Time + read receipt (only on last in group) */}
                        {(msg.pos === "single" || msg.pos === "last") && (
                          <Row
                            style={{
                              justifyContent: isMe ? "flex-end" : "flex-start",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 4px 0",
                            }}
                          >
                            <Text
                              variant="body-default-xs"
                              style={{
                                color: "var(--dsc-text-subtle)",
                                fontSize: 11,
                              }}
                            >
                              {isPendingMessage ? "Sending..." : msg.time}
                            </Text>
                            {isMe &&
                              (isPendingMessage ? (
                                <Clock3
                                  size={14}
                                  strokeWidth={2.4}
                                  color="var(--dsc-accent-warm)"
                                />
                              ) : (
                                <CheckCheck
                                  size={14}
                                  strokeWidth={2.5}
                                  color="var(--dsc-accent-warm)"
                                />
                              ))}
                          </Row>
                        )}
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </>
        )}
      </Column>

      {/* ── INPUT FOOTER ── */}
      <Row
        fillWidth
        vertical="center"
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--dsc-border)",
          backgroundColor: "var(--dsc-surface)",
          flexShrink: 0,
          zIndex: 10,
          gap: 6,
        }}
      >
        {/* Hidden file inputs for composer actions */}
        <input
          ref={attachmentInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/webm,audio/ogg,audio/wav,audio/mp3,audio/mp4"
          onChange={handleAttachmentUpload}
          style={{ display: "none" }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <input
          ref={gifInputRef}
          type="file"
          accept="image/gif"
          onChange={handleGifUpload}
          style={{ display: "none" }}
        />

        {/* Attachment button */}
        <IconButton
          icon={<Paperclip size={17} strokeWidth={2.2} />}
          variant="tertiary"
          onClick={canUseMediaButtons ? handleAttachmentClick : undefined}
          tooltip="Attach media"
          style={{
            color: composerAccent,
            backgroundColor: "transparent",
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            opacity: canCompose ? 1 : 0.45,
          }}
        />

        {/* Image button */}
        <IconButton
          icon={<ImageIcon size={17} strokeWidth={2.2} />}
          variant="tertiary"
          onClick={canUseMediaButtons ? handleImageClick : undefined}
          tooltip="Upload photo"
          style={{
            color: composerAccent,
            backgroundColor: "transparent",
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            opacity: canCompose ? 1 : 0.45,
          }}
        />

        {/* Voice button */}
        <IconButton
          icon={<Mic size={17} strokeWidth={2.2} />}
          variant="tertiary"
          onClick={
            canUseMediaButtons ? () => void handleVoiceToggle() : undefined
          }
          tooltip={isRecording ? "Stop recording" : "Record voice"}
          style={{
            color: isRecording ? "#ef4444" : composerAccent,
            backgroundColor: "transparent",
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            opacity: canCompose ? 1 : 0.45,
          }}
        />

        {/* GIF button */}
        <IconButton
          icon={<Film size={17} strokeWidth={2.2} />}
          variant="tertiary"
          onClick={canUseMediaButtons ? handleGifClick : undefined}
          tooltip="Upload GIF"
          style={{
            color: composerAccent,
            backgroundColor: "transparent",
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            opacity: canCompose ? 1 : 0.45,
          }}
        />

        {/* Input field with smile trigger */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--dsc-surface-muted)",
            border: "1px solid var(--dsc-border)",
            borderRadius: 999,
            padding: "0 6px 0 14px",
            minHeight: 42,
          }}
        >
          <Input
            placeholder={activeUser ? "Aa" : "Pick a foodie to start messaging"}
            value={message}
            disabled={!canCompose}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: "transparent",
              border: "none",
              padding: "10px 0",
              borderRadius: 0,
              boxShadow: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--dsc-text)",
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            onClick={handleToggleEmojiPicker}
            disabled={!canCompose}
            aria-label="Open emoji picker"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              backgroundColor: "rgba(255,107,53,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid rgba(255,107,53,0.24)",
              padding: 0,
              cursor: canCompose ? "pointer" : "default",
              transition: "background-color 0.2s, opacity 0.2s",
              opacity: canCompose ? 1 : 0.5,
            }}
          >
            <Smile size={13} strokeWidth={2.5} color={composerAccent} />
          </button>
        </div>

        {/* Emoji or Send button */}
        <motion.div
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          style={{ flexShrink: 0 }}
        >
          <IconButton
            icon={
              hasComposerDraft ? (
                <Send size={18} strokeWidth={2.25} />
              ) : (
                <ThumbsUp size={18} strokeWidth={2.25} />
              )
            }
            onClick={hasComposerDraft ? handleSend : handleQuickEmoji}
            disabled={quickActionDisabled}
            tooltip={hasComposerDraft ? "Send" : "Quick emoji"}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: hasComposerDraft ? composerAccent : "transparent",
              color: hasComposerDraft ? "white" : composerAccent,
              border: hasComposerDraft
                ? "1px solid transparent"
                : "1px solid rgba(255,107,53,0.25)",
              boxShadow: hasComposerDraft
                ? "0 4px 12px rgba(255,107,53,0.3)"
                : "none",
              transition: "background 0.2s, box-shadow 0.2s",
              opacity: quickActionDisabled ? 0.55 : 1,
            }}
          />
        </motion.div>
      </Row>

      {recordingError && !isRecording && (
        <div
          style={{
            padding: "4px 14px 8px",
            color: "#dc2626",
            fontSize: 12,
            fontWeight: 600,
            borderTop: "1px solid rgba(220,38,38,0.1)",
            backgroundColor: "rgba(220,38,38,0.04)",
          }}
        >
          Microphone error: {recordingError}
        </div>
      )}

      <AnimatePresence>
        {isEmojiPickerOpen && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              right: 14,
              bottom: 62,
              width: "min(360px, calc(100vw - 30px))",
              backgroundColor: "#1f2329",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 22px 44px rgba(0,0,0,0.38)",
              zIndex: 25,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 12 }}>
              <div style={{ position: "relative", marginBottom: 10 }}>
                <Search
                  size={14}
                  strokeWidth={2.3}
                  color="rgba(255,255,255,0.55)"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  value={emojiQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmojiQuery(e.target.value)
                  }
                  placeholder="Search Emoji"
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.09)",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    color: "#f8fafc",
                    padding: "0 14px 0 36px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <Text
                variant="body-default-s"
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Smileys & People
              </Text>

              <div
                style={{
                  maxHeight: 240,
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                  gap: 6,
                  paddingRight: 4,
                }}
              >
                {filteredEmojis.map((item) => (
                  <button
                    key={`${item.emoji}-${item.label}`}
                    type="button"
                    onClick={() => handleSelectEmoji(item.emoji)}
                    title={item.label}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 24,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording overlay */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: "absolute",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--dsc-surface)",
            padding: "12px 20px",
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "1px solid var(--dsc-border)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 1.5s infinite",
            }}
          >
            <Mic size={18} color="white" strokeWidth={2.25} />
          </div>
          <div>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--dsc-text)",
              }}
            >
              Recording... {Math.floor(recordingTime)}s
            </Text>
            <Text style={{ fontSize: 11, color: "var(--dsc-text-subtle)" }}>
              Tap mic again to stop and send
            </Text>
          </div>
          <IconButton
            icon={<X size={16} strokeWidth={2.25} />}
            onClick={handleCancelRecording}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--dsc-surface-muted)",
              color: "var(--dsc-text-subtle)",
            }}
          />
        </motion.div>
      )}
    </Column>
  );
};
