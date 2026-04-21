"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  IconButton,
  Avatar,
} from "@/components/OnceUI";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { apiUploadMedia, ApiError } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess?: () => void;
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

  // Cleanup Object URLs on close/unmount
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
      toast.error("Avatar must be JPEG, PNG, or WEBP (No GIFs).");
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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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

      toast.success("Profile updated successfully! ✨");
      if (onSuccess) onSuccess();
      onClose();

      // Reset file states
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`);
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              backgroundColor: "#FFFFFF",
              borderRadius: "32px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Row
              style={{
                paddingTop: "28px",
                paddingRight: "32px",
                paddingBottom: "24px",
                paddingLeft: "32px",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                flexShrink: 0,
                background: "linear-gradient(to right, #ffffff, #fffcfb)",
              }}
            >
              <Column style={{ gap: "4px" }}>
                <Heading variant="display-strong-xs" style={{ color: "#1C1C1E" }}>
                  Edit Profile
                </Heading>
                <Text style={{ color: "#8E8E93", fontSize: "0.85rem", fontWeight: 500 }}>
                  Customize your culinary presence on TasteMap
                </Text>
              </Column>
              <IconButton
                icon={<X size={20} color="#8E8E93" />}
                onClick={onClose}
                style={{
                  backgroundColor: "#F2F2F7",
                  borderRadius: "14px",
                  width: "40px",
                  height: "40px",
                }}
              />
            </Row>

            {/* Modal Body */}
            <div
              className="no-scrollbar"
              style={{
                padding: "32px",
                overflowY: "auto",
                flexGrow: 1,
              }}
            >
              <Column style={{ gap: "36px" }}>
                {/* Media Section */}
                <Column style={{ gap: "24px" }}>
                  <Text
                    style={{
                      color: "#AEAEB2",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Profile Media
                  </Text>

                  {/* Cover Selection */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "180px",
                      borderRadius: "20px",
                      backgroundColor: "#F2F2F7",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <img
                      src={
                        coverPreview ||
                        user?.cover_url ||
                        "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80"
                      }
                      alt="Cover Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.85,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        color: "white",
                        transition: "all 0.3s",
                      }}
                    >
                      <Camera size={28} />
                      <Text style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                        Change Cover Photo
                      </Text>
                    </div>
                  </div>

                  {/* Avatar Selection */}
                  <Row style={{ gap: "24px", alignItems: "center" }}>
                    <div
                      style={{
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Avatar
                        src={avatarPreview || user?.avatar_url || ""}
                        size="xl"
                        style={{
                          width: "110px",
                          height: "110px",
                          borderRadius: "50%",
                          border: "4px solid white",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                          backgroundColor: "#ff6b35",
                          borderRadius: "50%",
                          padding: "8px",
                          border: "3px solid white",
                          color: "white",
                        }}
                      >
                        <Camera size={16} />
                      </div>
                    </div>
                    <Column style={{ gap: "4px" }}>
                      <Text style={{ color: "#1C1C1E", fontWeight: 700 }}>
                        Profile Picture
                      </Text>
                      <Text style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
                        Recommended: Square image, max 2MB
                      </Text>
                      <Button
                        size="s"
                        onClick={() => avatarInputRef.current?.click()}
                        style={{
                          marginTop: "8px",
                          backgroundColor: "rgba(255, 107, 53, 0.08)",
                          color: "#ff6b35",
                          borderRadius: "10px",
                          fontWeight: 700,
                        }}
                      >
                        Upload Photo
                      </Button>
                    </Column>
                  </Row>
                </Column>

                {/* Form Fields Section */}
                <Column style={{ gap: "28px" }}>
                  <Text
                    style={{
                      color: "#AEAEB2",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Personal Details
                  </Text>

                  {/* Display Name */}
                  <Column style={{ gap: "8px" }}>
                    <Text style={{ color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 600 }}>
                      Display Name
                    </Text>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        backgroundColor: "#F9F9FB",
                        border: "1px solid #E5E5EA",
                        borderRadius: "16px",
                        color: "#1C1C1E",
                        fontSize: "0.95rem",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ff6b35";
                        e.target.style.backgroundColor = "#FFFFFF";
                        e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E5EA";
                        e.target.style.backgroundColor = "#F9F9FB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Column>

                  {/* Username */}
                  <Column style={{ gap: "8px" }}>
                    <Text style={{ color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 600 }}>
                      Username
                    </Text>
                    <Row
                      style={{
                        backgroundColor: "#F9F9FB",
                        border: "1px solid #E5E5EA",
                        borderRadius: "14px",
                        overflow: "hidden",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "14px 0 14px 20px",
                          color: "#8E8E93",
                          fontSize: "0.95rem",
                          userSelect: "none",
                        }}
                      >
                        @
                      </span>
                      <input
                        type="text"
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        style={{
                          flexGrow: 1,
                          padding: "14px 20px 14px 8px",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#1C1C1E",
                          fontSize: "0.95rem",
                          outline: "none",
                        }}
                      />
                    </Row>
                  </Column>

                  {/* Bio */}
                  <Column style={{ gap: "8px" }}>
                    <Text style={{ color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 600 }}>
                      Bio
                    </Text>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        backgroundColor: "#F9F9FB",
                        border: "1px solid #E5E5EA",
                        borderRadius: "16px",
                        color: "#1C1C1E",
                        fontSize: "0.95rem",
                        outline: "none",
                        resize: "none",
                        fontFamily: "inherit",
                        lineHeight: 1.6,
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ff6b35";
                        e.target.style.backgroundColor = "#FFFFFF";
                        e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E5EA";
                        e.target.style.backgroundColor = "#F9F9FB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Column>

                  {/* Location */}
                  <Column style={{ gap: "8px" }}>
                    <Text style={{ color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 600 }}>
                      Location
                    </Text>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Ho Chi Minh City"
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        backgroundColor: "#F9F9FB",
                        border: "1px solid #E5E5EA",
                        borderRadius: "16px",
                        color: "#1C1C1E",
                        fontSize: "0.95rem",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ff6b35";
                        e.target.style.backgroundColor = "#FFFFFF";
                        e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E5EA";
                        e.target.style.backgroundColor = "#F9F9FB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Column>
                </Column>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "#F2F2F7" }} />

                {/* Private Info */}
                <Column style={{ gap: "20px" }}>
                  <Row style={{ gap: "10px", alignItems: "center" }}>
                    <Lock size={16} color="#AEAEB2" />
                    <Text
                      style={{
                        color: "#AEAEB2",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Account Information
                    </Text>
                  </Row>

                  {/* Email */}
                  <Column style={{ gap: "8px" }}>
                    <Text style={{ color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 600 }}>
                      Email Address
                    </Text>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        backgroundColor: "#F9F9FB",
                        border: "1px solid #E5E5EA",
                        borderRadius: "16px",
                        color: "#1C1C1E",
                        fontSize: "0.95rem",
                        outline: "none",
                      }}
                    />
                  </Column>

                  {/* Phone */}
                  <Column style={{ gap: "8px" }}>
                    <Text style={{ color: "#1C1C1E", fontSize: "0.85rem", fontWeight: 600 }}>
                      Phone Number
                    </Text>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        backgroundColor: "#F9F9FB",
                        border: "1px solid #E5E5EA",
                        borderRadius: "16px",
                        color: "#1C1C1E",
                        fontSize: "0.95rem",
                        outline: "none",
                      }}
                    />
                  </Column>
                </Column>

                {/* Hidden File Inputs */}
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
                  accept="image/jpeg, image/png, image/webp, image/gif"
                />
              </Column>
            </div>

            {/* Modal Footer */}
            <Row
              style={{
                padding: "24px 32px",
                justifyContent: "flex-end",
                gap: "16px",
                borderTop: "1px solid rgba(255, 107, 53, 0.08)",
                flexShrink: 0,
                backgroundColor: "#FFF5F0",
              }}
            >
              <Button
                size="m"
                onClick={onClose}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(255, 107, 53, 0.1)",
                  borderRadius: "16px",
                  color: "#8E8E93",
                  padding: "12px 28px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                size="m"
                onClick={handleSave}
                style={{
                  background: saveLoading
                    ? "rgba(255,107,53,0.3)"
                    : "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                  color: "#FFFFFF",
                  borderRadius: "16px",
                  fontWeight: 700,
                  padding: "12px 32px",
                  cursor: saveLoading ? "not-allowed" : "pointer",
                  border: "none",
                  boxShadow: saveLoading ? "none" : "0 8px 24px rgba(255,107,53,0.3)",
                }}
                disabled={saveLoading}
              >
                <Save size={16} style={{ marginRight: "8px" }} />{" "}
                {saveLoading ? "Saving..." : "Save Changes"}
              </Button>
            </Row>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
