/**
 * Lobby Feature Module — Public API
 *
 * Usage in page.tsx:
 *   import { LobbySection } from "@/components/features/lobby";
 *   <LobbySection />
 */

// Main section component (default use case)
export { default as LobbySection } from "./LobbySection";

// Sub-components (for custom layouts)
export { default as LobbyCard } from "./LobbyCard";
export { default as LobbyDetailModal } from "./LobbyDetailModal";

// UI primitives
export { AvatarStack, LivePing, StatusBadge } from "./LobbyUI";

// Types (for consumers that need to pass lobby data)
export type {
  LobbyData,
  LobbyMember,
  LobbyStatus,
  LobbyCategory,
  LobbyCardProps,
  LobbyModalProps,
  LobbySectionProps,
} from "./types";

// Mock data (for tests, storybook, or dev scenarios)
export { MOCK_LOBBIES } from "./data";
