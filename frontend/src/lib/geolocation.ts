/**
 * WGS84 ellipsoid constants (GRS80 / EPSG:4326)
 *
 *   a  = semi-major axis
 *   f  = flattening
 *   b  = semi-minor axis  = a(1 − f)
 *   e² = first eccentricity squared  = 2f − f²
 *   e′²= second eccentricity squared = e² / (1 − e²)
 */
const WGS84 = {
  a: 6_378_137.0,
  f: 1 / 298.257_223_563,
  get b() { return this.a * (1 - this.f); },
  get e2() { return 2 * this.f - this.f ** 2; },
  get ep2() { return this.e2 / (1 - this.e2); },
} as const;

export interface GeodeticCoordinate {
  lat: number;
  lon: number;
  alt: number;
  accuracy: number;
}

export interface VietnamAddress {
  ward: string | null;
  district: string | null;
  province: string | null;
  formatted: string;
}

export interface LocationResult {
  coordinate: GeodeticCoordinate;
  address: VietnamAddress;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ECEF (XYZ) → WGS84 Geodetic  (Bowring's iterative method)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prime vertical radius of curvature at geodetic latitude φ:
 *   N(φ) = a / √(1 − e²·sin²φ)
 */
function primeVerticalRadius(phi: number): number {
  return WGS84.a / Math.sqrt(1 - WGS84.e2 * Math.sin(phi) ** 2);
}

/**
 * Convert Earth-Centered Earth-Fixed (ECEF) Cartesian coordinates to
 * WGS84 geodetic (latitude, longitude, ellipsoidal altitude).
 *
 * Algorithm: Bowring (1985) iterative method.  Converges to better than
 * nanometre precision in ≤ 5 iterations for all points on or near Earth's surface.
 *
 * @param X  ECEF X (metres)
 * @param Y  ECEF Y (metres)
 * @param Z  ECEF Z (metres)
 */
export function ecefToWGS84(
  X: number,
  Y: number,
  Z: number,
): { lat: number; lon: number; alt: number } {
  const lon = Math.atan2(Y, X);
  const p = Math.hypot(X, Y);

  // Bowring's initial reduced-latitude estimate
  let phi = Math.atan2(
    Z + WGS84.ep2 * WGS84.b * Math.sin(Math.atan2(Z * WGS84.a, p * WGS84.b)) ** 3,
    p - WGS84.e2 * WGS84.a * Math.cos(Math.atan2(Z * WGS84.a, p * WGS84.b)) ** 3,
  );

  for (let i = 0; i < 10; i++) {
    const sinPhi = Math.sin(phi);
    const Nv = primeVerticalRadius(phi);
    const phiNext = Math.atan2(Z + WGS84.e2 * Nv * sinPhi, p);
    if (Math.abs(phiNext - phi) < 1e-12) { phi = phiNext; break; }
    phi = phiNext;
  }

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const Nv = primeVerticalRadius(phi);

  // Altitude formula switches at 45° to avoid division-by-zero near poles
  const alt =
    Math.abs(phi) > Math.PI / 4
      ? Z / sinPhi - Nv * (1 - WGS84.e2)
      : p / cosPhi - Nv;

  return {
    lat: phi * (180 / Math.PI),
    lon: lon * (180 / Math.PI),
    alt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GPS acquisition  (accuracy ≤ 500 m — district-level precision)
// ─────────────────────────────────────────────────────────────────────────────

const ACCURACY_THRESHOLD_METERS = 500;
const GPS_TIMEOUT_MS = 12_000;
const GPS_RETRY_DELAY_MS = 1_500;

function getPositionOnce(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation API is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: GPS_TIMEOUT_MS,
      maximumAge: 0,
    });
  });
}

/**
 * Acquire a GPS fix with district-level accuracy, retrying up to `maxAttempts` times.
 * Throws if the accuracy threshold cannot be met within the allowed attempts.
 */
export async function acquireHighPrecisionCoordinates(
  maxAttempts = 3,
): Promise<GeodeticCoordinate> {
  let lastAccuracy = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, GPS_RETRY_DELAY_MS));
    }

    const pos = await getPositionOnce();
    lastAccuracy = pos.coords.accuracy;

    if (lastAccuracy <= ACCURACY_THRESHOLD_METERS) {
      return {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        alt: pos.coords.altitude ?? 0,
        accuracy: lastAccuracy,
      };
    }
  }

  throw new Error(
    `GPS accuracy ${lastAccuracy.toFixed(0)}m — không đủ chính xác để xác định quận/huyện. Thử ra ngoài trời và thử lại.`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Vietnam reverse geocoding  (Nominatim / OpenStreetMap)
// ─────────────────────────────────────────────────────────────────────────────

interface NominatimAddress {
  // Ward-level (level 3)
  suburb?: string;
  quarter?: string;
  neighbourhood?: string;
  hamlet?: string;
  // District-level (level 2)
  city_district?: string;
  county?: string;
  borough?: string;
  // Province-level (level 1)
  state?: string;
  city?: string;
  province?: string;
  // Meta
  country_code?: string;
  road?: string;
  house_number?: string;
  display_name?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
  display_name: string;
}

/**
 * Vietnamese administrative hierarchy prefixes.
 * Used to strip redundant labels when the geocoder returns full names like "Phường Bến Nghé".
 */
const VN_PREFIXES = {
  ward: /^(phường|xã|thị trấn)\s+/i,
  district: /^(quận|huyện|thành phố|thị xã|thị trấn)\s+/i,
  province: /^(tỉnh|thành phố)\s+/i,
};

function stripPrefix(value: string, regex: RegExp): string {
  return value.replace(regex, "").trim();
}

function parseVietnamAddress(addr: NominatimAddress): VietnamAddress {
  const rawWard =
    addr.suburb ??
    addr.quarter ??
    addr.neighbourhood ??
    addr.hamlet ??
    null;

  const rawDistrict =
    addr.city_district ??
    addr.county ??
    addr.borough ??
    null;

  const rawProvince =
    addr.province ??
    addr.state ??
    addr.city ??
    null;

  const ward = rawWard ? stripPrefix(rawWard, VN_PREFIXES.ward) : null;
  const district = rawDistrict ? stripPrefix(rawDistrict, VN_PREFIXES.district) : null;
  const province = rawProvince ? stripPrefix(rawProvince, VN_PREFIXES.province) : null;

  const parts = Array.from(new Set([ward, district, province].filter(Boolean)));
  const formatted = parts.length > 0 ? parts.join(", ") : "Unknown location";

  return { ward, district, province, formatted };
}

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim.
 * Falls back to Google Maps Geocoding API if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set.
 */
export async function reverseGeocodeVietnam(
  lat: number,
  lon: number,
): Promise<VietnamAddress> {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (googleKey) {
    return reverseGeocodeGoogle(lat, lon, googleKey);
  }

  // Try Nominatim API first (Standard OpenStreetMap)
  try {
    return await reverseGeocodeNominatim(lat, lon);
  } catch (error) {
    console.warn("Nominatim failed, falling back to Photon...");
    // Fallback to Photon (Open Source Komoot OSM Map)
    return reverseGeocodePhoton(lat, lon);
  }
}

async function reverseGeocodeNominatim(
  lat: number,
  lon: number,
): Promise<VietnamAddress> {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=vi&zoom=18&addressdetails=1`;

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Nominatim API request failed");

  const data: NominatimResponse = await response.json();
  if (!data.address) throw new Error("No address found for these coordinates");

  return parseVietnamAddress(data.address);
}

async function reverseGeocodePhoton(
  lat: number,
  lon: number,
): Promise<VietnamAddress> {
  const url = `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Photon Geocoding API failed");

  const data = await response.json();
  if (!data.features || data.features.length === 0) {
    throw new Error("No address found for these coordinates in open-source DB.");
  }

  const props = data.features[0].properties;

  const rawWard = props.name || props.locality || props.suburb || props.neighbourhood || null;
  const rawDistrict = props.district || props.city_district || props.county || null;
  const rawProvince = props.state || props.city || props.province || null;

  const ward = rawWard ? stripPrefix(rawWard, VN_PREFIXES.ward) : null;
  const district = rawDistrict ? stripPrefix(rawDistrict, VN_PREFIXES.district) : null;
  const province = rawProvince ? stripPrefix(rawProvince, VN_PREFIXES.province) : null;

  const parts = Array.from(new Set([ward, district, province].filter(Boolean)));
  const formatted = parts.length > 0 ? parts.join(", ") : "Unknown location";

  return { ward, district, province, formatted };
}

interface GoogleGeocodingResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface GoogleGeocodingResponse {
  results: GoogleGeocodingResult[];
  status: string;
}

async function reverseGeocodeGoogle(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<VietnamAddress> {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${lat},${lon}&key=${apiKey}&language=vi&result_type=street_address|sublocality|locality`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Geocoding error ${res.status}`);

  const data: GoogleGeocodingResponse = await res.json();
  if (data.status !== "OK" || data.results.length === 0) {
    throw new Error(`Google Geocoding: ${data.status}`);
  }

  const components = data.results[0].address_components;
  const find = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? null;

  const rawWard =
    find("administrative_area_level_3") ??
    find("sublocality_level_2") ??
    find("sublocality_level_1");

  const rawDistrict =
    find("administrative_area_level_2") ??
    find("sublocality_level_1");

  const rawProvince = find("administrative_area_level_1");

  const ward = rawWard ? stripPrefix(rawWard, VN_PREFIXES.ward) : null;
  const district = rawDistrict ? stripPrefix(rawDistrict, VN_PREFIXES.district) : null;
  const province = rawProvince ? stripPrefix(rawProvince, VN_PREFIXES.province) : null;

  const parts = [ward, district, province].filter(Boolean);
  const formatted = parts.length > 0 ? parts.join(", ") : "Unknown location";

  return { ward, district, province, formatted };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Composite entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full pipeline: GPS fix → reverse geocode → Vietnam address hierarchy.
 */
export async function resolveCurrentLocation(): Promise<LocationResult> {
  const coordinate = await acquireHighPrecisionCoordinates();
  const address = await reverseGeocodeVietnam(coordinate.lat, coordinate.lon);
  return { coordinate, address };
}
