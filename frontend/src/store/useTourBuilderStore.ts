import { create } from 'zustand';

export type TourTransportMode = 'walking' | 'driving' | 'transit';
// 'finalizing' added for the Promise.all tour-build phase
export type BuilderStatus = 'idle' | 'loading' | 'calculating' | 'finalizing' | 'saving' | 'error';

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

  resetTour: () =>
    set({
      deckQueue: [],
      tourDraft: [],
      nextCursor: null,
      hasMore: true,
      status: 'idle',
      lastDiscarded: null,
    }),
}));
