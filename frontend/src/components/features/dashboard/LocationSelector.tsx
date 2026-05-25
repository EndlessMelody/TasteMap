"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  LocateFixed,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Navigation,
  AlertCircle,
  Compass,
  Map,
} from "lucide-react";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  resolveLocationByCoordinates,
  type VnProvince,
  type VnDistrict,
  type VnWard,
} from "@/lib/vietnam-api";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  Button,
  Body,
  BodySm,
  Caption,
  Eyebrow,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

const formatLocationString = (val: string) => {
  if (!val) return val;
  return val
    .replace(/Phường\s/g, "P. ")
    .replace(/Thành phố\s/gi, "TP. ")
    .replace(/Tỉnh\s/g, "")
    .replace(/Quận\s/g, "Q. ")
    .replace(/Huyện\s/g, "H. ")
    .replace(/Thị xã\s/gi, "TX. ")
    .replace(/Xã\s/g, "X. ")
    .replace(/Thị trấn\s/gi, "TT. ")
    .trim()
    .replace(/^,\s*/, "");
};

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

type DrillLevel = "province" | "district" | "ward";

type DrillItem = VnProvince | VnDistrict | VnWard;

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
}) => {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"gps" | "manual">("manual");
  const [hasAutoDetected, setHasAutoDetected] = useState(false);

  const [drillLevel, setDrillLevel] = useState<DrillLevel>("province");
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<VnProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<VnDistrict | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { status, error, detect, reset } = useLocation();
  const isDetecting = status === "acquiring" || status === "geocoding";

  const handleGPSDetect = useCallback(async () => {
    setActiveTab("gps");
    const result = await detect();
    if (!result?.coordinate) return;

    try {
      const { lat, lon } = result.coordinate;
      const resolved = await resolveLocationByCoordinates(lat, lon);
      setSelectedProvince(resolved.province);
      const dists = await fetchDistricts(resolved.province.code);
      setDistricts(dists);
      setSelectedDistrict(resolved.district);
      const wrds = await fetchWards(resolved.district.code);
      setWards(wrds);
      setDrillLevel("ward");
      onChange(
        formatLocationString(
          `${resolved.ward.name}, ${resolved.district.name}, ${resolved.province.name}`,
        ),
      );
      setIsOpen(false);
    } catch (err) {
      console.error("GPS coordinate resolution failed", err);
      if (result.address?.formatted) {
        onChange(formatLocationString(result.address.formatted));
        setIsOpen(false);
      }
    }
  }, [detect, onChange]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === "manual") {
      setTimeout(() => searchInputRef.current?.focus(), 120);
    }
  }, [isOpen, activeTab, drillLevel]);

  useEffect(() => {
    if (isLoggedIn && !value && !hasAutoDetected && status === "idle") {
      setHasAutoDetected(true);
      handleGPSDetect();
    }
  }, [isLoggedIn, value, hasAutoDetected, handleGPSDetect, status]);

  useEffect(() => {
    if (isOpen && provinces.length === 0) {
      setLoadingData(true);
      fetchProvinces()
        .then(setProvinces)
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [isOpen, provinces.length]);

  const filteredItems = useMemo<DrillItem[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (drillLevel === "province") {
      return q ? provinces.filter((p) => p.name.toLowerCase().includes(q)) : provinces;
    }
    if (drillLevel === "district") {
      return q ? districts.filter((d) => d.name.toLowerCase().includes(q)) : districts;
    }
    return q ? wards.filter((w) => w.name.toLowerCase().includes(q)) : wards;
  }, [searchQuery, drillLevel, provinces, districts, wards]);

  const handleSelectProvince = useCallback(async (province: VnProvince) => {
    setSelectedProvince(province);
    setSearchQuery("");
    setLoadingData(true);
    try {
      const d = await fetchDistricts(province.code);
      setDistricts(d);
      setDrillLevel("district");
    } catch {
      /* stay */
    } finally {
      setLoadingData(false);
    }
  }, []);

  const handleSelectDistrict = useCallback(
    async (district: VnDistrict) => {
      setSelectedDistrict(district);
      setSearchQuery("");
      setLoadingData(true);
      try {
        const w = await fetchWards(district.code);
        setWards(w);
        setDrillLevel("ward");
      } catch {
        if (selectedProvince) {
          onChange(formatLocationString(`${district.name}, ${selectedProvince.name}`));
          setIsOpen(false);
        }
      } finally {
        setLoadingData(false);
      }
    },
    [selectedProvince, onChange],
  );

  const handleSelectWard = useCallback(
    (ward: VnWard) => {
      if (selectedProvince && selectedDistrict) {
        const label = formatLocationString(
          `${ward.name}, ${selectedDistrict.name}, ${selectedProvince.name}`,
        );
        onChange(label);
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [selectedProvince, selectedDistrict, onChange],
  );

  const handleBack = useCallback(() => {
    setSearchQuery("");
    if (drillLevel === "ward") {
      setDrillLevel("district");
      setWards([]);
      setSelectedDistrict(null);
    } else if (drillLevel === "district") {
      setDrillLevel("province");
      setDistricts([]);
      setSelectedProvince(null);
    }
  }, [drillLevel]);

  const handleClear = useCallback(() => {
    onChange("");
    reset();
    setDrillLevel("province");
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
  }, [onChange, reset]);

  const breadcrumb = useMemo(() => {
    if (drillLevel === "province") return "Province / city";
    if (drillLevel === "district") return selectedProvince?.name ?? "District";
    return selectedDistrict ? selectedDistrict.name : "Ward / commune";
  }, [drillLevel, selectedProvince, selectedDistrict]);

  const searchPlaceholder = useMemo(() => {
    if (drillLevel === "province") return "Search province / city…";
    if (drillLevel === "district") return "Search district…";
    return "Search ward / commune…";
  }, [drillLevel]);

  const displayLabel = useMemo(() => {
    if (isDetecting) return "Locating…";
    if (status === "error") return "Set location";
    if (!value) return "Near you";
    const parts = value.split(",").map((s) => s.trim());
    return parts[0];
  }, [value, isDetecting, status]);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[2],
          background: isOpen ? "rgba(255, 107, 53, 0.08)" : tokens.color.surfaceMuted,
          padding: `${tokens.space[2]} ${tokens.space[4]}`,
          borderRadius: tokens.radius.pill,
          border: `1px solid ${
            isOpen
              ? tokens.color.warm
              : value
                ? "rgba(255, 107, 53, 0.3)"
                : tokens.color.border
          }`,
          cursor: "pointer",
          transition: "all 0.22s ease",
          whiteSpace: "nowrap",
          maxWidth: 300,
          boxShadow: isOpen ? tokens.shadow.md : "none",
          fontFamily: "inherit",
        }}
      >
        <Compass
          size={16}
          strokeWidth={1.75}
          style={{
            color: isOpen || value ? tokens.color.warm : tokens.color.textSubtle,
          }}
        />
        <BodySm
          style={{
            color: isOpen || value ? tokens.color.text : tokens.color.textMuted,
            fontWeight: isOpen || value
              ? tokens.type.weight.semibold
              : tokens.type.weight.medium,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 220,
          }}
        >
          {displayLabel}
        </BodySm>
        {value ? (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: tokens.color.warm,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={10} strokeWidth={2} color="white" />
          </motion.span>
        ) : (
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            style={{
              color: tokens.color.textSubtle,
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.22s ease",
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: tokens.z.overlay,
              width: 400,
            }}
          >
            <Card
              radius="lg"
              padding="none"
              shadow="lg"
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  display: "flex",
                  borderBottom: `1px solid ${tokens.color.border}`,
                  padding: 4,
                  gap: 4,
                }}
              >
                <TabButton
                  icon={<Map size={14} strokeWidth={1.75} />}
                  label="Manual"
                  isActive={activeTab === "manual"}
                  onClick={() => setActiveTab("manual")}
                />
                <TabButton
                  icon={<LocateFixed size={14} strokeWidth={1.75} />}
                  label="GPS"
                  isActive={activeTab === "gps"}
                  onClick={() => setActiveTab("gps")}
                />
              </div>

              {activeTab === "manual" ? (
                <div
                  style={{
                    maxHeight: 460,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {value && (
                    <div
                      style={{
                        margin: `${tokens.space[2]} ${tokens.space[4]} 0`,
                        padding: `${tokens.space[3]} ${tokens.space[3]}`,
                        background: tokens.color.surfaceMuted,
                        border: `1px solid ${tokens.color.border}`,
                        borderRadius: tokens.radius.md,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: tokens.space[3],
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: tokens.color.warm,
                          color: tokens.color.textInverse,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <Compass size={12} strokeWidth={1.75} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Caption
                          style={{
                            color: tokens.color.warm,
                            display: "block",
                          }}
                        >
                          Current location
                        </Caption>
                        <BodySm
                          style={{
                            marginTop: 2,
                            fontWeight: tokens.type.weight.medium,
                          }}
                        >
                          {value}
                        </BodySm>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[2],
                      padding: `${tokens.space[3]} ${tokens.space[4]} ${tokens.space[1]}`,
                      borderBottom:
                        drillLevel !== "province"
                          ? `1px solid ${tokens.color.border}`
                          : "none",
                    }}
                  >
                    {drillLevel !== "province" && (
                      <button
                        type="button"
                        onClick={handleBack}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: tokens.radius.xs,
                          border: `1px solid ${tokens.color.border}`,
                          background: tokens.color.surface,
                          cursor: "pointer",
                          flexShrink: 0,
                          fontFamily: "inherit",
                        }}
                      >
                        <ChevronLeft
                          size={14}
                          strokeWidth={1.75}
                          style={{ color: tokens.color.textMuted }}
                        />
                      </button>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Eyebrow style={{ color: tokens.color.warm }}>
                        {breadcrumb}
                      </Eyebrow>
                      {drillLevel === "ward" &&
                        selectedProvince &&
                        selectedDistrict && (
                          <Caption tone="subtle" style={{ marginTop: 1 }}>
                            {selectedDistrict.name}, {selectedProvince.name}
                          </Caption>
                        )}
                      {drillLevel === "district" && selectedProvince && (
                        <Caption tone="subtle" style={{ marginTop: 1 }}>
                          {selectedProvince.name}
                        </Caption>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      {(["province", "district", "ward"] as DrillLevel[]).map(
                        (level, i) => (
                          <div
                            key={level}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background:
                                drillLevel === level
                                  ? tokens.color.warm
                                  : i < ["province", "district", "ward"].indexOf(drillLevel)
                                    ? "rgba(255, 107, 53, 0.5)"
                                    : tokens.color.surfaceInset,
                              transition: "background 0.22s",
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: `${tokens.space[2]} ${tokens.space[4]} ${tokens.space[1]}`,
                      position: "relative",
                    }}
                  >
                    <Search
                      size={15}
                      strokeWidth={1.75}
                      style={{
                        position: "absolute",
                        left: 28,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: tokens.color.textSubtle,
                      }}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: `${tokens.space[2]} ${tokens.space[3]} ${tokens.space[2]} 36px`,
                        border: `1px solid ${tokens.color.border}`,
                        borderRadius: tokens.radius.sm,
                        fontSize: 13,
                        outline: "none",
                        background: tokens.color.surfaceMuted,
                        color: tokens.color.text,
                        transition: "border-color 0.15s",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = tokens.color.warm)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = tokens.color.border)
                      }
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      paddingBottom: tokens.space[2],
                    }}
                  >
                    {loadingData ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: tokens.space[8],
                          gap: tokens.space[2],
                        }}
                      >
                        <Loader2
                          size={18}
                          strokeWidth={1.75}
                          style={{
                            color: tokens.color.warm,
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        <BodySm tone="muted">Loading…</BodySm>
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div
                        style={{
                          padding: `${tokens.space[6]} ${tokens.space[4]}`,
                          textAlign: "center",
                        }}
                      >
                        <BodySm tone="muted">
                          No results for &ldquo;{searchQuery}&rdquo;
                        </BodySm>
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <ListRow
                          key={item.code}
                          name={formatLocationString(item.name)}
                          subtitle={item.division_type}
                          hasArrow={drillLevel !== "ward"}
                          onClick={() => {
                            if (drillLevel === "province")
                              handleSelectProvince(item as VnProvince);
                            else if (drillLevel === "district")
                              handleSelectDistrict(item as VnDistrict);
                            else handleSelectWard(item as VnWard);
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: `${tokens.space[6]} ${tokens.space[5]} ${tokens.space[8]}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: tokens.space[4],
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 72,
                      height: 72,
                    }}
                  >
                    {isDetecting && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            border: `2px solid ${tokens.color.warm}`,
                          }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            border: `2px solid ${tokens.color.warm}`,
                          }}
                        />
                      </>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background:
                          status === "error"
                            ? "rgba(230, 57, 70, 0.1)"
                            : tokens.color.surfaceMuted,
                        color:
                          status === "error"
                            ? tokens.color.danger
                            : tokens.color.warm,
                      }}
                    >
                      {isDetecting ? (
                        <Loader2
                          size={28}
                          strokeWidth={1.75}
                          style={{ animation: "spin 0.8s linear infinite" }}
                        />
                      ) : status === "error" ? (
                        <AlertCircle size={28} strokeWidth={1.75} />
                      ) : (
                        <Navigation size={28} strokeWidth={1.75} />
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <Body
                      style={{
                        fontWeight: tokens.type.weight.semibold,
                        marginBottom: 4,
                      }}
                    >
                      {isDetecting
                        ? "Locating…"
                        : status === "error"
                          ? "Cannot determine location"
                          : "Auto-detect location"}
                    </Body>
                    <BodySm
                      tone={status === "error" ? "default" : "muted"}
                      style={{
                        maxWidth: 260,
                        color:
                          status === "error" ? tokens.color.danger : undefined,
                      }}
                    >
                      {isDetecting
                        ? "Acquiring GPS signal…"
                        : status === "error"
                          ? error
                          : "TasteMap will automatically detect your ward, district and province."}
                    </BodySm>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    disabled={isDetecting}
                    loading={isDetecting}
                    leftIcon={!isDetecting && <LocateFixed size={16} strokeWidth={1.75} />}
                    onClick={handleGPSDetect}
                  >
                    {isDetecting
                      ? "Locating…"
                      : status === "error"
                        ? "Try again"
                        : "Locate me"}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: `${tokens.space[2]} 0`,
        borderRadius: tokens.radius.md,
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.space[1],
        cursor: "pointer",
        fontSize: 13,
        fontWeight: isActive
          ? tokens.type.weight.semibold
          : tokens.type.weight.medium,
        color: isActive ? tokens.color.warm : tokens.color.textMuted,
        background: isActive ? "rgba(255, 107, 53, 0.08)" : "transparent",
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function ListRow({
  name,
  subtitle,
  hasArrow,
  onClick,
}: {
  name: string;
  subtitle?: string;
  hasArrow: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: tokens.space[2],
        padding: `${tokens.space[3]} ${tokens.space[4]}`,
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: tokens.type.weight.medium,
        color: tokens.color.text,
        background: "transparent",
        textAlign: "left",
        transition: "background-color 0.12s",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = tokens.color.surfaceMuted)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <MapPin
        size={13}
        strokeWidth={1.75}
        style={{ color: tokens.color.textSubtle, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {subtitle && (
          <Caption tone="subtle" style={{ textTransform: "capitalize" }}>
            {subtitle}
          </Caption>
        )}
      </div>
      {hasArrow && (
        <ChevronRight
          size={14}
          strokeWidth={1.75}
          style={{ color: tokens.color.textSubtle, flexShrink: 0 }}
        />
      )}
    </button>
  );
}
