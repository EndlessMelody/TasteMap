---
trigger: always_off
---

# TasteMap Frontend UI Rules

## Core Philosophy

**You are a Design Engineer specializing in TasteMap's Elite Pastel aesthetic.**

- **Priority 1: Once UI First** — Use Once UI primitives for ALL layout and styling. Tailwind CSS 4 is for utility-only cases (rare).
- **Priority 2: Semantic Layout** — Never use `<div>`. Use `<Column>`, `<Row>`, `<Grid>` with semantic props.
- **Priority 3: Cinematic Experience** — Framer Motion for transitions, gestures, and state changes.
- **Priority 4: Dark-Mode Excellence** — All components must work in dark mode by default.

---

## Once UI Fundamentals

### Layout Primitives (NEVER use `<div>`)

**Vertical Stacking:**
```tsx
<Column gap="16" padding="24">
  <Heading variant="display-strong-s">Title</Heading>
  <Text variant="body-default-m">Description</Text>
</Column>
```

**Horizontal Layout:**
```tsx
<Row gap="8" horizontal="space-between" vertical="center">
  <Text>Left content</Text>
  <Button>Action</Button>
</Row>
```

**Grid Layout:**
```tsx
<Grid columns={3} gap="16">
  {items.map(item => <Card key={item.id} {...item} />)}
</Grid>
```

### Spacing System

**Tokens (in REM):**
- `"4"` = 0.25rem (4px)
- `"8"` = 0.5rem (8px)
- `"16"` = 1rem (16px)
- `"24"` = 1.5rem (24px)
- `"32"` = 2rem (32px)
- `"40"` = 2.5rem (40px)
- `"64"` = 4rem (64px)

**Shorthands:**
- `paddingX="l"` - Horizontal padding (responsive)
- `marginTop="24"` - Top margin only
- `gap="-1"` - Collapse stacked borders

### Sizing

- **Fluid width:** `fillWidth` (never `w-full`)
- **Fluid height:** `fillHeight` (never `h-full`)
- **Both:** `fill` shorthand
- **Max constraints:** `maxWidth="m"` (xs, s, m, l, xl)

### Colors (Dark-Mode First)

**Background + Text pairs:**
```tsx
// Surface backgrounds
<Column background="surface" onBackground="neutral-medium">

// Interactive/High contrast
<Button solid="primary" onSolid="neutral-strong">

// General purpose
<Row background="neutral-weak" onBackground="neutral-strong">
```

**Background values:**
- `"page"` - Main site background
- `"surface"` - Cards, sidebars, elevated surfaces
- `"overlay"` - Modals, popovers
- `"neutral-weak"`, `"neutral-medium"`, `"neutral-strong"` - Surface variants

**Solid values:**
- `"primary"` - Primary actions
- `"secondary"` - Secondary actions
- `"danger"` - Destructive actions

### Typography

```tsx
// Display headings
<Heading variant="display-strong-xl">Page Title</Heading>
<Heading variant="display-strong-l">Section Title</Heading>
<Heading variant="display-strong-m">Card Title</Heading>
<Heading variant="display-strong-s">Subsection</Heading>

// Body text
<Text variant="body-strong-m">Emphasized body</Text>
<Text variant="body-default-m">Regular body</Text>
<Text variant="body-default-s">Small body</Text>

// Inheritance
<Heading variant="display-strong-m">
  <Text>Nested text inherits variant</Text>
</Heading>
```

**Override props:**
- `weight="strong"` or `weight="default"`
- `size="xs"` through `size="xl"`
- `align="center"` (text-align, NOT flex)

### Responsive Design

```tsx
<Row 
  gap="16"
  s={{ direction: 'column', gap: '8' }}  // Mobile
  m={{ direction: 'row', gap: '16' }}     // Tablet
  l={{ gap: '24' }}                       // Desktop
>
```

**Hide/Show:**
```tsx
<Column hide s={{ hide: false }}>  // Hide on mobile only
<Column light dark={{ hide: true }}>  // Light mode only
```

---

## Component Architecture

### Folder Structure

```
frontend/src/components/
├── primitives/          # Once UI wrappers
│   ├── Flex.tsx
│   ├── Card.tsx
│   └── index.ts
├── features/            # Domain-specific
│   ├── lobby/
│   │   ├── RoomCard.tsx
│   │   ├── ChatPanel.tsx
│   │   └── index.ts
│   ├── feed/
│   ├── tours/
│   └── aipicks/
└── layout/             # Page shells
    ├── AppShell.tsx
    ├── Sidebar.tsx
    └── index.ts
```

### Barrel Exports

Every feature folder MUST have an `index.ts`:
```tsx
// components/features/lobby/index.ts
export { RoomCard } from './RoomCard';
export { ChatPanel } from './ChatPanel';
export { MemberList } from './MemberList';
export { VoiceBar } from './VoiceBar';
```

### Component Pattern

```tsx
// components/features/lobby/RoomCard.tsx
import { Column, Row, Heading, Text, Button, IconButton } from '@/once-ui/components';
import { Icon } from '@/once-ui/components';

interface RoomCardProps {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  onJoin: (id: number) => void;
}

export function RoomCard({ 
  id, 
  name, 
  description, 
  memberCount, 
  isPublic, 
  onJoin 
}: RoomCardProps) {
  return (
    <Column 
      background="surface" 
      radius="l"
      padding="24"
      gap="16"
      fillWidth
    >
      <Row horizontal="space-between" vertical="center">
        <Heading variant="display-strong-s">{name}</Heading>
        <Icon 
          name={isPublic ? "globe" : "lock"} 
          onBackground="neutral-medium"
        />
      </Row>
      
      <Text variant="body-default-m" onBackground="neutral-medium">
        {description}
      </Text>
      
      <Row horizontal="space-between" vertical="center">
        <Text variant="body-default-s" onBackground="neutral-weak">
          {memberCount} members
        </Text>
        <Button onClick={() => onJoin(id)}>
          Join Room
        </Button>
      </Row>
    </Column>
  );
}
```

### Prop Spreading Pattern

Components should spread Flex props for flexibility:
```tsx
interface CardProps extends React.ComponentProps<typeof Column> {
  title: string;
}

export function Card({ title, ...flexProps }: CardProps) {
  return (
    <Column background="surface" padding="24" {...flexProps}>
      <Heading>{title}</Heading>
    </Column>
  );
}
```

---

## Framer Motion Integration

### Animation Patterns

**Page Transitions:**
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**List Stagger:**
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <RoomCard {...item} />
    </motion.div>
  ))}
</motion.div>
```

**Swipe Gestures (AIPicks):**
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.8}
  onDragEnd={(_, info) => {
    if (info.offset.x > 100) onSwipeRight();
    if (info.offset.x < -100) onSwipeLeft();
  }}
>
  <LocationCard location={currentLocation} />
</motion.div>
```

**Layout Animations:**
```tsx
<motion.div layout layoutId={`room-${room.id}`}>
  <RoomCard room={room} />
</motion.div>
```

---

## TasteMap-Specific Components

### Group Lobby Components

**RoomCard:**
```tsx
// Display public/private badge
<Row horizontal="space-between">
  <Heading variant="display-strong-m">{name}</Heading>
  <Badge 
    icon={isPublic ? "globe" : "lock"}
    label={isPublic ? "Public" : "Private"}
    variant={isPublic ? "success" : "warning"}
  />
</Row>
```

**ChatPanel:**
- Use `Column` with `gap="12"` for message list
- Auto-scroll to bottom on new messages
- Voice activity indicator: green ring around avatar

**MemberList:**
- Grid of avatars with status indicators
- Host crown icon
- Ready checkmark
- Speaking ring (green pulse when voice active)

**VoiceBar:**
- Connection status indicator
- Mute toggle button
- Join/Leave call button
- Audio level visualization (optional)

### AIPicks Components

**SwipeCard:**
- Full-screen or large card with drag gestures
- Image background with gradient overlay
- Info overlay at bottom
- Like/Dislike buttons with scale animation on press

**PreferenceIndicator:**
- Visual representation of user vector
- Updated in real-time after swipes
- Minimal, elegant visualization

### Tour Builder Components

**Timeline:**
- Vertical `Column` with connecting line
- Each stop as a `Row` with time, location, duration
- Drag-and-drop reordering (Framer Motion Reorder)

**MapIntegration:**
- Embedded map component
- Route visualization
- Location markers with hover cards

### Foodie Feed Components

**ReelCard:**
- 9:16 aspect ratio
- Video with overlay UI
- Engagement buttons (like, comment, share)

**TasteVault:**
- Collection grid
- Cover image with gradient
- Item count badge

---

## State Management

### Auth Context

```tsx
// Use from @/context/AuthContext (NOT @/hooks/useAuth)
const { isInitializing, isLoggedIn, user, login, logout, error, clearError } = useAuth();
```

### API Integration

```tsx
// lib/api.ts helpers
import { apiGet, apiPost } from '@/lib/api';

// Usage
const data = await apiGet('/groups');
const result = await apiPost('/groups/join-by-code', { code });
```

### Real-time Hooks

```tsx
// hooks/useVoiceRoom.ts
const { 
  isConnected, 
  isMuted, 
  speakingUsers, 
  toggleMute, 
  joinCall, 
  leaveCall 
} = useVoiceRoom(roomId);
```

---

## Accessibility

**Required for all components:**
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements for dynamic content

```tsx
<IconButton
  tooltip="Join room"
  aria-label="Join room"
  onClick={onJoin}
>
  <Icon name="enter" />
</IconButton>
```

---

## Common Mistakes to Avoid

1. **❌ Using `<div>`** → ✅ Use `<Column>`, `<Row>`, or `<Grid>`
2. **❌ Tailwind for layout** → ✅ Use Once UI props (`gap`, `padding`, `fillWidth`)
3. **❌ Hardcoded colors** → ✅ Use Once UI tokens (`background`, `onBackground`)
4. **❌ Hex codes** → ✅ Use Once UI color system
5. **❌ Missing barrel exports** → ✅ Always add `index.ts`
6. **❌ Inline styles** → ✅ Use Once UI props or SCSS modules

---

## File References

**Key Once UI Components:**
- `frontend/src/once-ui/components/Column.tsx`
- `frontend/src/once-ui/components/Row.tsx`
- `frontend/src/once-ui/components/Grid.tsx`
- `frontend/src/once-ui/components/Heading.tsx`
- `frontend/src/once-ui/components/Text.tsx`
- `frontend/src/once-ui/components/Button.tsx`
- `frontend/src/once-ui/components/Icon.tsx`
- `frontend/src/once-ui/components/IconButton.tsx`

**TasteMap Examples:**
- `frontend/src/app/group-rooms/page.tsx` - Lobby list page
- `frontend/src/app/group-rooms/[id]/page.tsx` - Room interior
- `frontend/src/context/AuthContext.tsx` - Auth provider
