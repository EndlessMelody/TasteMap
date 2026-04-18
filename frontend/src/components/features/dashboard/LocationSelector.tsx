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
import { Text } from "@/components/OnceUI";
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
    .replace(/^,\s*/, '');
};

/* ── Types ── */

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

type DrillLevel = "province" | "district" | "ward";

/* ── Component ── */

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"gps" | "manual">("manual");

  // 3-level drill-down state
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

  // ── Close on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // ── Auto-focus search ──
  useEffect(() => {
    if (isOpen && activeTab === "manual") {
      setTimeout(() => searchInputRef.current?.focus(), 120);
    }
  }, [isOpen, activeTab, drillLevel]);

  // ── Load provinces on first open ──
  useEffect(() => {
    if (isOpen && provinces.length === 0) {
      setLoadingData(true);
      fetchProvinces()
        .then(setProvinces)
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [isOpen, provinces.length]);

  // ── Filtered items based on search ──
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (drillLevel === "province") {
      return q ? provinces.filter((p) => p.name.toLowerCase().includes(q)) : provinces;
    }
    if (drillLevel === "district") {
      return q ? districts.filter((d) => d.name.toLowerCase().includes(q)) : districts;
    }
    // ward
    return q ? wards.filter((w) => w.name.toLowerCase().includes(q)) : wards;
  }, [searchQuery, drillLevel, provinces, districts, wards]);

  // ── Handlers ──

  const handleSelectProvince = useCallback(async (province: VnProvince) => {
    setSelectedProvince(province);
    setSearchQuery("");
    setLoadingData(true);
    try {
      const d = await fetchDistricts(province.code);
      setDistricts(d);
      setDrillLevel("district");
    } catch {
      // fallback — stay on province
    } finally {
      setLoadingData(false);
    }
  }, []);

  const handleSelectDistrict = useCallback(async (district: VnDistrict) => {
    setSelectedDistrict(district);
    setSearchQuery("");
    setLoadingData(true);
    try {
      const w = await fetchWards(district.code);
      setWards(w);
      setDrillLevel("ward");
    } catch {
      // fallback — select at district level
      if (selectedProvince) {
        onChange(formatLocationString(`${district.name}, ${selectedProvince.name}`));
        setIsOpen(false);
      }
    } finally {
      setLoadingData(false);
    }
  }, [selectedProvince, onChange]);

  const handleSelectWard = useCallback((ward: VnWard) => {
    if (selectedProvince && selectedDistrict) {
      const label = formatLocationString(`${ward.name}, ${selectedDistrict.name}, ${selectedProvince.name}`);
      onChange(label);
      setIsOpen(false);
      setSearchQuery("");
    }
  }, [selectedProvince, selectedDistrict, onChange]);

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

  const handleGPSDetect = useCallback(async () => {
    setActiveTab("gps");
    const result = await detect();
    if (!result?.coordinate) return;

    try {
      const { lat, lon } = result.coordinate;
      console.log("[GPS] Raw coordinates:", lat, lon);

      // Coordinate matching for Province + District + Ward
      const resolved = await resolveLocationByCoordinates(lat, lon);

      console.log("[GPS] Resolved:", {
        province: resolved.province.name,
        district: resolved.district.name,
        ward: resolved.ward.name,
        wardCentroid: [resolved.ward.latitude, resolved.ward.longitude],
      });

      // Update drill-down state
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

  const handleClear = useCallback(() => {
    onChange("");
    reset();
    setDrillLevel("province");
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
  }, [onChange, reset]);

  const handleOpenToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // ── Breadcrumb label ──
  const breadcrumb = useMemo(() => {
    if (drillLevel === "province") return "PROVINCE / CITY";
    if (drillLevel === "district") return selectedProvince?.name ?? "DISTRICT";
    return selectedDistrict ? `${selectedDistrict.name}` : "WARD / COMMUNE";
  }, [drillLevel, selectedProvince, selectedDistrict]);

  const searchPlaceholder = useMemo(() => {
    if (drillLevel === "province") return "Search province/city...";
    if (drillLevel === "district") return "Search district...";
    return "Search ward/commune...";
  }, [drillLevel]);

  const displayLabel = useMemo(() => {
    if (!value) return "Discover";
    const parts = value.split(",").map((s) => s.trim());
    // Display the most specific level available (Level 3 / Ward is parts[0])
    return parts[0];
  }, [value]);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* ── Pill Trigger ── */}
      <button
        onClick={handleOpenToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: isOpen ? "#fff3ed" : "#F2F2F7",
          padding: "8px 18px",
          borderRadius: 999,
          border: `1px solid ${isOpen ? "#ff6b35" : "#E5E5EA"}`,
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
          maxWidth: 300,
        }}
      >
        <Compass size={15} color={value ? "#ff6b35" : "#ED1B24"} />
        <Text
          style={{
            color: "#1C1C1E",
            fontWeight: 600,
            fontSize: "0.82rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 220,
          }}
        >
          {displayLabel}
        </Text>
        {value ? (
          <span
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 16, height: 16, borderRadius: "50%",
              backgroundColor: "#E5E5EA", cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={10} color="#8E8E93" />
          </span>
        ) : (
          <ChevronDown
            size={14} color="#C7C7CC"
            style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          />
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: 200,
              width: 400,
              backgroundColor: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(24px)",
              border: "1px solid #E5E5EA",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
            }}
          >
            {/* ── Tab Switcher ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #F2F2F7", padding: 4, gap: 4 }}>
              <TabButton icon={<Map size={14} />} label="Manual" isActive={activeTab === "manual"} onClick={() => setActiveTab("manual")} />
              <TabButton icon={<LocateFixed size={14} />} label="GPS" isActive={activeTab === "gps"} onClick={() => setActiveTab("gps")} />
            </div>

            {activeTab === "manual" ? (
              <div style={{ maxHeight: 460, display: "flex", flexDirection: "column" }}>

                {/* ── Active Selection Box (shows 0->3 levels) ── */}
                {value && (
                  <div style={{
                    margin: "8px 16px 0",
                    padding: "10px 12px",
                    backgroundColor: "#fff3ed",
                    border: "1px solid #ffe8d9",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, borderRadius: "50%",
                      background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                      flexShrink: 0, marginTop: 2
                    }}>
                      <Compass size={12} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 11, fontWeight: 700, color: "#ff6b35", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        CURRENT LOCATION
                      </Text>
                      <Text style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>
                        {value}
                      </Text>
                    </div>
                  </div>
                )}

                {/* ── Breadcrumb / Back ── */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 16px 6px",
                  borderBottom: drillLevel !== "province" ? "1px solid #F2F2F7" : "none",
                }}>
                  {drillLevel !== "province" && (
                    <button
                      onClick={handleBack}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 8,
                        border: "1px solid #E5E5EA", backgroundColor: "#FAFAFA",
                        cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F2F2F7")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
                    >
                      <ChevronLeft size={14} color="#8E8E93" />
                    </button>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{
                      fontSize: 12, fontWeight: 700,
                      color: "#ff6b35", textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {breadcrumb}
                    </Text>
                    {drillLevel === "ward" && selectedProvince && selectedDistrict && (
                      <Text style={{ fontSize: 11, color: "#AEAEB2", marginTop: 1 }}>
                        {selectedDistrict.name}, {selectedProvince.name}
                      </Text>
                    )}
                    {drillLevel === "district" && selectedProvince && (
                      <Text style={{ fontSize: 11, color: "#AEAEB2", marginTop: 1 }}>
                        {selectedProvince.name}
                      </Text>
                    )}
                  </div>
                  {/* Step indicators */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["province", "district", "ward"] as DrillLevel[]).map((level, i) => (
                      <div
                        key={level}
                        style={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor:
                            drillLevel === level ? "#ff6b35"
                              : i < ["province", "district", "ward"].indexOf(drillLevel) ? "#fbbf94"
                              : "#E5E5EA",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Search bar ── */}
                <div style={{ padding: "8px 16px 6px", position: "relative" }}>
                  <Search
                    size={15} color="#AEAEB2"
                    style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 12px 10px 36px",
                      border: "1px solid #E5E5EA", borderRadius: 12,
                      fontSize: 13, outline: "none",
                      backgroundColor: "#FAFAFA", color: "#1C1C1E",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#ff6b35")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E5EA")}
                  />
                </div>

                {/* ── List ── */}
                <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
                  {loadingData ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32, gap: 8 }}>
                      <Loader2 size={18} color="#ff6b35" className="animate-spin" />
                      <Text style={{ fontSize: 13, color: "#8E8E93" }}>Loading...</Text>
                    </div>
                  ) : (filteredItems as any[]).length === 0 ? (
                    <div style={{ padding: "24px 16px", textAlign: "center" }}>
                      <Text style={{ fontSize: 13, color: "#8E8E93" }}>
                        No results for "{searchQuery}"
                      </Text>
                    </div>
                  ) : (
                    (filteredItems as any[]).map((item: any) => (
                      <ListRow
                        key={item.code}
                        name={formatLocationString(item.name)}
                        subtitle={item.division_type}
                        hasArrow={drillLevel !== "ward"}
                        onClick={() => {
                          if (drillLevel === "province") handleSelectProvince(item);
                          else if (drillLevel === "district") handleSelectDistrict(item);
                          else handleSelectWard(item);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* ── GPS Tab ── */
              <div style={{
                padding: "24px 20px 28px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 16,
              }}>
                {/* Animated radar icon */}
                <div style={{ position: "relative", width: 72, height: 72 }}>
                  {isDetecting && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          position: "absolute", inset: 0, borderRadius: "50%",
                          border: "2px solid #ff6b35",
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        style={{
                          position: "absolute", inset: 0, borderRadius: "50%",
                          border: "2px solid #ff6b35",
                        }}
                      />
                    </>
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "50%",
                    background: isDetecting
                      ? "linear-gradient(135deg, #fff3ed, #ffe8d9)"
                      : status === "error" ? "#fee2e2" : "#F2F2F7",
                    transition: "background 0.3s",
                  }}>
                    {isDetecting ? (
                      <Loader2 size={28} color="#ff6b35" className="animate-spin" />
                    ) : status === "error" ? (
                      <AlertCircle size={28} color="#ef4444" />
                    ) : (
                      <Navigation size={28} color="#ff6b35" />
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1E", marginBottom: 4 }}>
                    {isDetecting ? "Locating..."
                      : status === "error" ? "Cannot determine location"
                      : "Auto-detect location"}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: status === "error" ? "#ef4444" : "#8E8E93",
                    lineHeight: 1.5, maxWidth: 260,
                  }}>
                    {isDetecting
                      ? "Acquiring GPS signal..."
                      : status === "error"
                        ? error
                        : "TasteMap will automatically detect your Ward, District and Province."}
                  </Text>
                </div>

                <button
                  onClick={handleGPSDetect}
                  disabled={isDetecting}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 28px", borderRadius: 14, border: "none",
                    cursor: isDetecting ? "wait" : "pointer",
                    fontSize: 14, fontWeight: 700, color: "white",
                    background: isDetecting ? "#fbbf94" : "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                    boxShadow: isDetecting ? "none" : "0 4px 16px rgba(255,107,53,0.35)",
                    transition: "all 0.2s",
                  }}
                >
                  {isDetecting ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                  {isDetecting ? "Locating..." : status === "error" ? "Try Again" : "Locate Me"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Sub-components ── */

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "10px 0", borderRadius: 16, border: "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        cursor: "pointer", fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? "#ff6b35" : "#8E8E93",
        backgroundColor: isActive ? "#fff3ed" : "transparent",
        transition: "all 0.15s",
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
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "11px 16px", border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 500, color: "#3C3C43",
        backgroundColor: "transparent", textAlign: "left",
        transition: "background-color 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <MapPin size={13} color="#C7C7CC" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 1, textTransform: "capitalize" }}>
            {subtitle}
          </div>
        )}
      </div>
      {hasArrow && <ChevronRight size={14} color="#C7C7CC" style={{ flexShrink: 0 }} />}
    </button>
  );
}
