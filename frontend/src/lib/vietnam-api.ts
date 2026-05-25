/**
 * Vietnam Administrative Divisions API Client
 * Uses the free provinces.open-api.vn service to fetch
 * Province → District → Ward hierarchy dynamically.
 *
 * Cache: In-memory Map per session to avoid redundant fetches.
 */

const BASE_URL = "https://esgoo.net/api-tinhthanh";

// ── Types ──────────────────────────────────────────────────────────────────

export interface VnAdminUnit {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  latitude: number;
  longitude: number;
}

export interface VnProvince extends VnAdminUnit {
  phone_code: number;
  districts?: VnDistrict[];
}

export interface VnDistrict extends VnAdminUnit {
  province_code: string;
  wards?: VnWard[];
}

export interface VnWard extends VnAdminUnit {
  district_code: string;
}

// ── Cache ──────────────────────────────────────────────────────────────────

const cache = {
  provinces: null as VnProvince[] | null,
  districts: new Map<string, VnDistrict[]>(),
  wards: new Map<string, VnWard[]>(),
};

// ── Fetchers ───────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  return res.json();
}

/**
 * Fetch all 63 provinces (cached after first call).
 */
export async function fetchProvinces(): Promise<VnProvince[]> {
  if (cache.provinces) return cache.provinces;
  const raw = await safeFetch<any>(`${BASE_URL}/1/0.htm`);
  const data = (raw.data || []).map((p: any) => ({
    code: p.id,
    name: p.full_name,
    division_type: "Tỉnh / Thành phố",
    codename: p.name_en,
    phone_code: 0,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
  }));
  cache.provinces = data;
  return data;
}

/**
 * Fetch districts of a province.
 */
export async function fetchDistricts(provinceCode: string): Promise<VnDistrict[]> {
  if (cache.districts.has(provinceCode)) return cache.districts.get(provinceCode)!;
  const raw = await safeFetch<any>(`${BASE_URL}/2/${provinceCode}.htm`);
  const districts = (raw.data || []).map((d: any) => ({
    code: d.id,
    name: d.full_name,
    division_type: "Quận / Huyện",
    codename: d.name_en,
    province_code: provinceCode,
    latitude: Number(d.latitude),
    longitude: Number(d.longitude),
  }));
  cache.districts.set(provinceCode, districts);
  return districts;
}

/**
 * Fetch wards of a district.
 */
export async function fetchWards(districtCode: string): Promise<VnWard[]> {
  if (cache.wards.has(districtCode)) return cache.wards.get(districtCode)!;
  const raw = await safeFetch<any>(`${BASE_URL}/3/${districtCode}.htm`);
  const wards = (raw.data || []).map((w: any) => ({
    code: w.id,
    name: w.full_name,
    division_type: "Phường / Xã",
    codename: w.name_en,
    district_code: districtCode,
    latitude: Number(w.latitude),
    longitude: Number(w.longitude),
  }));
  cache.wards.set(districtCode, wards);
  return wards;
}

/**
 * Search across all provinces by name (local filter, no API call if cached).
 */
export async function searchProvinces(query: string): Promise<VnProvince[]> {
  const all = await fetchProvinces();
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter((p) => p.name.toLowerCase().includes(q));
}

// ── Coordinate-based resolution (GPS → Level 3) ───────────────────────────

export interface ResolvedLocation {
  province: VnProvince;
  district: VnDistrict;
  ward: VnWard;
}

/** Squared Euclidean distance — no sqrt needed for comparison. */
function distSq(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat1 - lat2;
  const dLon = lon1 - lon2;
  return dLat * dLat + dLon * dLon;
}

function findClosest<T extends { latitude: number; longitude: number }>(
  items: T[],
  lat: number,
  lon: number,
): T {
  let best = items[0];
  let bestDist = Infinity;
  for (const item of items) {
    if (!item.latitude || !item.longitude) continue;
    const d = distSq(lat, lon, item.latitude, item.longitude);
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  }
  return best;
}

/**
 * Resolve GPS coordinates to Level 3 (Ward) using pure coordinate matching.
 *
 * To handle border areas (e.g. Dĩ An / Thủ Đức), we check the top 3
 * closest provinces, fetch all their districts, and pick the closest
 * district globally. This prevents province-centroid errors from cascading.
 */
export async function resolveLocationByCoordinates(
  lat: number,
  lon: number,
): Promise<ResolvedLocation> {
  // 1. Find top 3 closest provinces
  const provinces = await fetchProvinces();
  const scored = provinces
    .map((p) => ({ p, d: distSq(lat, lon, p.latitude, p.longitude) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  // 2. Fetch districts for all 3 and find the globally closest district
  let bestDistrict: VnDistrict | null = null;
  let bestDistDist = Infinity;
  let bestProvince: VnProvince | null = null;

  for (const { p } of scored) {
    const districts = await fetchDistricts(p.code);
    for (const d of districts) {
      if (!d.latitude || !d.longitude) continue;
      const dd = distSq(lat, lon, d.latitude, d.longitude);
      if (dd < bestDistDist) {
        bestDistDist = dd;
        bestDistrict = d;
        bestProvince = p;
      }
    }
  }

  if (!bestDistrict || !bestProvince) {
    // Fallback: just use the closest province
    const province = scored[0].p;
    const districts = await fetchDistricts(province.code);
    const district = findClosest(districts, lat, lon);
    const wards = await fetchWards(district.code);
    const ward = findClosest(wards, lat, lon);
    return { province, district, ward };
  }

  // 3. Find closest ward within the winning district
  const wards = await fetchWards(bestDistrict.code);
  const ward = findClosest(wards, lat, lon);

  return { province: bestProvince, district: bestDistrict, ward };
}
