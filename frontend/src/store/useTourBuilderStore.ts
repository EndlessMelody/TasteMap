import { create } from 'zustand';

export type TourTransportMode = 'walking' | 'driving' | 'transit';
export type BuilderStatus = 'idle' | 'loading' | 'calculating' | 'saving' | 'error';

export interface TourNode {
  id: string; // Used as the drag & drop array key or local uuid
  venue_id: number;
  
  // UI Display Fields (Backward compat with CardData)
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
  selectedNodes: (TourNode | null)[]; 
  groupMembers: number[];
  status: BuilderStatus;
  lastDiscarded: TourNode | null;

  // Actions
  updateMetadata: (data: Partial<TourMetadata>) => void;
  setDeckQueue: (nodes: TourNode[]) => void;
  addSelectedNode: (node: TourNode, index: number) => void;
  popDeckQueue: () => void;
  setLastDiscarded: (node: TourNode | null) => void;
  undoDiscard: () => void;
  setStatus: (status: BuilderStatus) => void;
  resetTour: () => void;
}

export const useTourBuilderStore = create<TourBuilderState>((set, get) => ({
  metadata: {
    name: "New Custom Tour",
    date: null,
    budget_level: 2,
    transport_mode: "driving"
  },
  deckQueue: [],
  selectedNodes: Array(4).fill(null), // Defaulting to 4 stops for now
  groupMembers: [],
  status: 'idle',
  lastDiscarded: null,

  updateMetadata: (data) => set((state) => ({ metadata: { ...state.metadata, ...data } })),
  
  setDeckQueue: (nodes) => set({ deckQueue: nodes }),

  addSelectedNode: (node, index) => set((state) => {
    const nextSelected = [...state.selectedNodes];
    nextSelected[index] = node;
    return { selectedNodes: nextSelected };
  }),

  popDeckQueue: () => set((state) => ({
    deckQueue: state.deckQueue.slice(1)
  })),

  setLastDiscarded: (node) => set({ lastDiscarded: node }),

  undoDiscard: () => set((state) => {
    if (!state.lastDiscarded) return state;
    return {
      deckQueue: [state.lastDiscarded, ...state.deckQueue],
      lastDiscarded: null
    };
  }),

  setStatus: (status) => set({ status }),

  resetTour: () => set({
    deckQueue: [],
    selectedNodes: Array(4).fill(null),
    status: 'idle',
    lastDiscarded: null,
  }),
}));
