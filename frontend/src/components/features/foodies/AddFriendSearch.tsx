"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Clock, UserCheck, Loader2 } from "lucide-react";
import {
  Card,
  Button,
  Field,
  Avatar,
  Pill,
  Body,
  BodySm,
  Caption,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { apiGet, apiPost } from "@/lib/api";

interface UserResult {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  friendship_status: "pending" | "accepted" | "blocked" | null;
}

interface AddFriendSearchProps {
  onRequestSent?: (userId: number) => void;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function AddFriendSearch({ onRequestSent }: AddFriendSearchProps) {
  const [query, setQuery] = useState("");
  const [rawResults, setRawResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const debouncedQ = useDebounce(query, 300);
  const results = debouncedQ.trim() ? rawResults : [];
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await apiGet<UserResult[]>(
        `/api/v1/users/search?q=${encodeURIComponent(q)}&limit=8`,
      );
      setRawResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch {
      setRawResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQ);
  }, [debouncedQ, fetchResults]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAdd = useCallback(
    async (user: UserResult) => {
      if (sent.has(user.id)) return;
      try {
        await apiPost("/api/v1/friends/request", { friend_id: user.id });
        setSent((prev) => new Set(prev).add(user.id));
        onRequestSent?.(user.id);
      } catch {
        setSent((prev) => new Set(prev).add(user.id));
      }
    },
    [sent, onRequestSent],
  );

  function statusBadge(user: UserResult) {
    if (sent.has(user.id) || user.friendship_status === "pending") {
      return (
        <Pill
          tone="warning"
          size="sm"
          leftIcon={<Clock size={11} strokeWidth={1.75} />}
        >
          Pending
        </Pill>
      );
    }
    if (user.friendship_status === "accepted") {
      return (
        <Pill
          tone="success"
          size="sm"
          leftIcon={<UserCheck size={11} strokeWidth={1.75} />}
        >
          Friends
        </Pill>
      );
    }
    return null;
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <Field
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim()) setOpen(true);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search by @username or name…"
        leading={<Search size={16} strokeWidth={1.75} />}
        trailing={
          loading ? (
            <Loader2
              size={14}
              strokeWidth={1.75}
              style={{
                color: tokens.color.warm,
                animation: "spin 0.7s linear infinite",
              }}
            />
          ) : undefined
        }
      />

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: tokens.z.overlay,
            }}
          >
            <Card
              radius="md"
              padding="none"
              shadow="lg"
              style={{ overflow: "hidden" }}
            >
              {results.map((user, idx) => {
                const badge = statusBadge(user);
                const canAdd = !badge && user.friendship_status !== "blocked";
                return (
                  <div
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[3],
                      padding: `${tokens.space[2]} ${tokens.space[4]}`,
                      borderBottom:
                        idx < results.length - 1
                          ? `1px solid ${tokens.color.border}`
                          : "none",
                      transition: "background 0.12s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        tokens.color.surfaceMuted)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Avatar
                      src={user.avatar_url}
                      name={user.display_name || user.username}
                      size="sm"
                    />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Body
                        style={{
                          fontWeight: tokens.type.weight.semibold,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user.display_name || user.username}
                      </Body>
                      <Caption tone="subtle">@{user.username}</Caption>
                    </div>

                    {badge}
                    {canAdd && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<UserPlus size={12} strokeWidth={1.75} />}
                        onClick={() => handleAdd(user)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && query.trim() && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: tokens.z.overlay,
            }}
          >
            <Card radius="md" padding="md" shadow="md">
              <BodySm tone="muted" style={{ textAlign: "center" }}>
                No users found for &ldquo;{query}&rdquo;
              </BodySm>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
