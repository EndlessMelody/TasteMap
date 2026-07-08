import { create } from 'zustand';

export type TourTransportMode = 'walking' | 'driving' | 'transit';
// 'finalizing' added for the Promise.all tour-build phase
export type BuilderStatus = 'idle' | 'loading' | 'calculating' | 'finalizing' | 'saving' | 'error';

export interface OptimizedStop {
  stop_order: number;
  location_id: number;
  estimated_travel_min: number;
  /** Taste match 0–100 from the vector-aware optimiser */
  match_score?: number | null;
  /** Estimated minutes spent at the stop */
  dwell_min?: number | null;
}

export interface OptimizeContext {
  time_slot: string;
  weather: string;
  weather_coefficient: number;
}

export interface OptimizeResult {
  optimized_stops: OptimizedStop[];
  total_distance_km: number;
  total_duration_min: number;
  estimated_cost_vnd: number;
  context?: OptimizeContext;
}

export interface TourNode {
  id: string; // Used as the drag & drop array key or local uuid
  venue_id: number;

  // UI Display Fields
  title: string;
  subtitle: string;
  tags: string[];
  match: number;
  distance: string;
  price: string;
  img: string;
  color: string;
  location: [number, number];

  time_spent: number;
  order_index: number;
  rating?: number;
  reviews_preview?: string[];
  /** Where the node entered the draft (saved vault vs swipe assist) */
  source?: "saved" | "assist";
  /** Populated after optimise for the journey view */
  match_score?: number | null;
  dwell_min?: number | null;
}

export interface TourMetadata {
  name: string;
  date: string | null;
  budget_level: 1 | 2 | 3 | 4;
  transport_mode: TourTransportMode;
}

interface TourBuilderState {
  metadata: TourMetadata;
  deckQueue: TourNode[];
  /** Locations starred by user for the tour (Super Like action) */
  tourDraft: TourNode[];
  /** Cursor for the next feed/cards batch fetch */
  nextCursor: string | null;
  /** Whether more cards exist on the server */
  hasMore: boolean;
  groupMembers: number[];
  status: BuilderStatus;
  lastDiscarded: TourNode | null;
  /** Result from the optimize API call */
  optimizeResult: OptimizeResult | null;

  // Actions
  updateMetadata: (data: Partial<TourMetadata>) => void;
  setDeckQueue: (nodes: TourNode[]) => void;
  appendDeckQueue: (nodes: TourNode[]) => void;
  setNextCursor: (cursor: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  popDeckQueue: () => void;
  setLastDiscarded: (node: TourNode | null) => void;
  undoDiscard: () => void;
  setStatus: (status: BuilderStatus) => void;
  /** Add location to tour draft (Super Like). Does not affect deckQueue. */
  addToTourDraft: (node: TourNode) => void;
  /** Remove a location from tour draft */
  removeFromTourDraft: (venueId: number) => void;
  /** Store optimize API response */
  setOptimizeResult: (result: OptimizeResult) => void;
  /** Reorder tourDraft according to optimized_stops order */
  reorderTourDraft: (optimizedStops: OptimizedStop[]) => void;
  resetTour: () => void;
}

export const useTourBuilderStore = create<TourBuilderState>((set, get) => ({
  metadata: {
    name: 'New Custom Tour',
    date: null,
    budget_level: 2,
    transport_mode: 'driving',
  },
  deckQueue: [],
  tourDraft: [],
  nextCursor: null,
  hasMore: true,
  groupMembers: [],
  status: 'idle',
  lastDiscarded: null,
  optimizeResult: null,

  updateMetadata: (data) =>
    set((state) => ({ metadata: { ...state.metadata, ...data } })),

  setDeckQueue: (nodes) => set({ deckQueue: nodes }),

  appendDeckQueue: (nodes) =>
    set((state) => ({ deckQueue: [...state.deckQueue, ...nodes] })),

  setNextCursor: (cursor) => set({ nextCursor: cursor }),

  setHasMore: (hasMore) => set({ hasMore }),

  popDeckQueue: () =>
    set((state) => ({ deckQueue: state.deckQueue.slice(1) })),

  setLastDiscarded: (node) => set({ lastDiscarded: node }),

  undoDiscard: () =>
    set((state) => {
      if (!state.lastDiscarded) return state;
      return {
        deckQueue: [state.lastDiscarded, ...state.deckQueue],
        lastDiscarded: null,
      };
    }),

  setStatus: (status) => set({ status }),

  addToTourDraft: (node) =>
    set((state) => {
      // Prevent duplicates
      if (state.tourDraft.some((n) => n.venue_id === node.venue_id)) return state;
      return { tourDraft: [...state.tourDraft, node] };
    }),

  removeFromTourDraft: (venueId) =>
    set((state) => ({
      tourDraft: state.tourDraft.filter((n) => n.venue_id !== venueId),
    })),

  setOptimizeResult: (result) => set({ optimizeResult: result }),

  reorderTourDraft: (optimizedStops) =>
    set((state) => {
      // Create a map from location_id → stop_order
      const orderMap = new Map(optimizedStops.map((s) => [s.location_id, s.stop_order]));
      // Sort tourDraft by optimized stop_order
      const sorted = [...state.tourDraft].sort((a, b) => {
        const orderA = orderMap.get(a.venue_id) ?? 999;
        const orderB = orderMap.get(b.venue_id) ?? 999;
        return orderA - orderB;
      });
      return { tourDraft: sorted };
    }),

  resetTour: () =>
    set({
      deckQueue: [],
      tourDraft: [],
      nextCursor: null,
      hasMore: true,
      status: 'idle',
      lastDiscarded: null,
      optimizeResult: null,
    }),
}));
