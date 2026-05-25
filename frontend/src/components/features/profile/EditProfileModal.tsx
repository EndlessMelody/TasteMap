"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { apiUploadMedia, ApiError } from "@/lib/api";
import {
  Card,
  Button,
  IconButton,
  Field,
  H2,
  Body,
  Caption,
  Eyebrow,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface EditProfileUser {
  display_name?: string;
  username?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  cover_url?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EditProfileUser | null;
  onSuccess?: () => void;
}

function SectionLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space[2],
      }}
    >
      {icon}
      <Eyebrow tone="subtle">{children}</Eyebrow>
    </div>
  );
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormName(user.display_name || user.username || "");
      setFormUsername(user.username || "");
      setFormBio(user.bio || "");
      setFormEmail(user.email || "");
      setFormPhone(user.phone || "");
      setFormLocation(user.location || "");
    }
  }, [user, isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [avatarPreview, coverPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Avatar must be JPEG, PNG, or WEBP (no GIFs).");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar size must be less than 2MB.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Cover must be JPEG, PNG, or WEBP.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover size must be less than 5MB.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      let uploadedAvatarUrl: string | undefined;
      let uploadedCoverUrl: string | undefined;

      if (avatarFile) {
        try {
          const result = await apiUploadMedia(avatarFile, "avatar");
          uploadedAvatarUrl = result.url;
        } catch (uploadErr) {
          const msg =
            uploadErr instanceof ApiError
              ? `Avatar upload failed: ${uploadErr.message}`
              : "Avatar upload failed";
          toast.error(msg);
        }
      }

      if (coverFile) {
        try {
          const result = await apiUploadMedia(coverFile, "cover");
          uploadedCoverUrl = result.url;
        } catch (uploadErr) {
          const msg =
            uploadErr instanceof ApiError
              ? `Cover upload failed: ${uploadErr.message}`
              : "Cover upload failed";
          toast.error(msg);
        }
      }

      const formData = new FormData();
      formData.append("display_name", formName);
      formData.append("username", formUsername);
      formData.append("bio", formBio);
      formData.append("phone", formPhone);
      if (formLocation) formData.append("location", formLocation);
      if (uploadedAvatarUrl) formData.append("avatar_url", uploadedAvatarUrl);
      if (uploadedCoverUrl) formData.append("cover_url", uploadedCoverUrl);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
        "http://127.0.0.1:8000";

      const res = await fetch(`${API_URL}/api/v1/users/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        let errMessage = "Unknown error";
        try {
          const errJson = await res.json();
          errMessage = errJson.detail || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      toast.success("Profile updated.");
      if (onSuccess) onSuccess();
      onClose();

      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Update failed: ${msg}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 10, 10, 0.4)",
            backdropFilter: "blur(8px)",
            zIndex: tokens.z.modal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: tokens.space[6],
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card
              radius="xl"
              padding="none"
              shadow="lg"
              style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "90vh",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: `${tokens.space[6]} ${tokens.space[8]}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: `1px solid ${tokens.color.border}`,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.space[1],
                  }}
                >
                  <H2>Edit profile</H2>
                  <Body tone="muted">
                    Customize your culinary presence on TasteMap.
                  </Body>
                </div>
                <IconButton
                  variant="ghost"
                  size="md"
                  aria-label="Close"
                  icon={<X size={20} strokeWidth={1.75} />}
                  onClick={onClose}
                />
              </div>

              <div
                className="no-scrollbar"
                style={{
                  padding: tokens.space[8],
                  overflowY: "auto",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: tokens.space[8],
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.space[5],
                  }}
                >
                  <SectionLabel>Profile media</SectionLabel>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => coverInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        coverInputRef.current?.click();
                    }}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 180,
                      borderRadius: tokens.radius.lg,
                      background: tokens.color.surfaceMuted,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `1px solid ${tokens.color.border}`,
                    }}
                  >
                    <img
                      src={
                        coverPreview ||
                        user?.cover_url ||
                        "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80"
                      }
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
                        background: "rgba(10, 10, 10, 0.45)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: tokens.space[2],
                        color: tokens.color.textInverse,
                      }}
                    >
                      <Camera size={24} strokeWidth={1.75} />
                      <Body
                        style={{
                          color: tokens.color.textInverse,
                          fontWeight: tokens.type.weight.semibold,
                        }}
                      >
                        Change cover photo
                      </Body>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[5],
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => avatarInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          avatarInputRef.current?.click();
                      }}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          background: tokens.color.surfaceMuted,
                          border: `4px solid ${tokens.color.surface}`,
                          boxShadow: tokens.shadow.sm,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {avatarPreview || user?.avatar_url ? (
                          <img
                            src={avatarPreview || user?.avatar_url || ""}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Camera
                            size={28}
                            strokeWidth={1.5}
                            style={{ color: tokens.color.textMuted }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          background: tokens.color.warm,
                          color: tokens.color.textInverse,
                          borderRadius: "50%",
                          padding: tokens.space[2],
                          border: `3px solid ${tokens.color.surface}`,
                          display: "inline-flex",
                        }}
                      >
                        <Camera size={14} strokeWidth={2} />
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: tokens.space[1],
                        alignItems: "flex-start",
                      }}
                    >
                      <Body
                        style={{ fontWeight: tokens.type.weight.semibold }}
                      >
                        Profile picture
                      </Body>
                      <Caption tone="muted">
                        Recommended: square image, max 2MB
                      </Caption>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                        style={{ marginTop: tokens.space[2] }}
                      >
                        Upload photo
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.space[5],
                  }}
                >
                  <SectionLabel>Personal details</SectionLabel>

                  <Field
                    label="Display name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />

                  <Field
                    label="Username"
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    leading={
                      <span
                        style={{
                          fontSize: tokens.type.size.body,
                          fontWeight: tokens.type.weight.medium,
                          color: tokens.color.textMuted,
                        }}
                      >
                        @
                      </span>
                    }
                  />

                  <Field
                    multiline
                    label="Bio"
                    rows={3}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                  />

                  <Field
                    label="Location"
                    type="text"
                    placeholder="e.g. Ho Chi Minh City"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    height: 1,
                    background: tokens.color.border,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.space[5],
                  }}
                >
                  <SectionLabel
                    icon={
                      <Lock
                        size={14}
                        strokeWidth={1.75}
                        style={{ color: tokens.color.textSubtle }}
                      />
                    }
                  >
                    Account information
                  </SectionLabel>

                  <Field
                    label="Email address"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />

                  <Field
                    label="Phone number"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  accept="image/jpeg, image/png, image/webp"
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  style={{ display: "none" }}
                  onChange={handleCoverChange}
                  accept="image/jpeg, image/png, image/webp"
                />
              </div>

              <div
                style={{
                  padding: `${tokens.space[5]} ${tokens.space[8]}`,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: tokens.space[3],
                  borderTop: `1px solid ${tokens.color.border}`,
                  background: tokens.color.surfaceMuted,
                  flexShrink: 0,
                }}
              >
                <Button variant="ghost" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={saveLoading}
                  leftIcon={
                    !saveLoading && <Save size={16} strokeWidth={1.75} />
                  }
                  onClick={handleSave}
                >
                  {saveLoading ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
