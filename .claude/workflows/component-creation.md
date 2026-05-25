---
description: Once UI component development workflow
---

# Component Creation Workflow

Workflow for building reusable React components with Once UI primitives.

## When to Use

Use this workflow when:
- Creating new UI components
- Building feature-specific components
- Refactoring existing components to Once UI
- Adding shared primitive wrappers

## Prerequisites

Before starting:
1. Review `01-frontend-ui.md` for Once UI fundamentals
2. Identify the Once UI primitives needed
3. Understand the component's context (page, feature, layout)

## Steps

### 1. Analyze Component Requirements

Define what the component needs to do.

**Actions:**
- [ ] Define component purpose and behavior
- [ ] List required props (data, callbacks, variants)
- [ ] Identify children/content structure
- [ ] Determine if it needs animations
- [ ] Check for accessibility requirements

**Output:** Component specification

**Prompt Template:**
```
I need to create a {COMPONENT_NAME} component that:
- Purpose: {PURPOSE}
- Props needed: {PROP_LIST}
- Will be used in: {LOCATION}
- Needs animation: {YES/NO}

What Once UI primitives should I use? What's the recommended folder location?
```

---

### 2. Identify Once UI Primitives

Select the right primitives for the layout.

**Actions:**
- [ ] Choose layout primitive (Column/Row/Grid)
- [ ] Identify text components (Heading/Text)
- [ ] List interactive components (Button/IconButton/Input)
- [ ] Check for specialized components (Badge/Avatar/Card)

**Primitive Selection Guide:**

| Layout Need | Primitive | Props |
|-------------|-----------|-------|
| Vertical stack | `<Column>` | `gap`, `padding`, `horizontal` |
| Horizontal row | `<Row>` | `gap`, `horizontal`, `vertical` |
| Equal grid | `<Grid>` | `columns`, `gap` |
| Page heading | `<Heading>` | `variant="display-strong-*"` |
| Body text | `<Text>` | `variant="body-default-*"` |
| Container | `<Column background="surface">` | `radius`, `border` |

**Output:** List of primitives with prop configurations

---

### 3. Define Props Interface

Create TypeScript interface extending Flex props.

**Actions:**
- [ ] Extend `React.ComponentProps<typeof Column>` or `Row`
- [ ] Define data props (content, configuration)
- [ ] Define callback props (onClick, onChange)
- [ ] Add variant/size props if needed
- [ ] Document props with JSDoc comments

**Rules:**
- Always spread Flex props for layout flexibility
- Use specific types (not `any`)
- Optional props marked with `?`
- Callback props return `void` or `Promise<void>`

**Output:** TypeScript interface definition

**Example:**
```typescript
// components/features/lobby/RoomCard.tsx
import { Column } from '@/once-ui/components';

interface RoomCardProps extends React.ComponentProps<typeof Column> {
  /** Room ID for navigation */
  id: number;
  /** Room display name */
  name: string;
  /** Short description */
  description?: string;
  /** Number of current members */
  memberCount: number;
  /** Public or private room */
  isPublic: boolean;
  /** Click handler for join button */
  onJoin: (id: number) => void;
  /** Optional click handler for entire card */
  onClick?: () => void;
}
```

---

### 4. Implement Semantic Layout

Build the component structure with Once UI.

**Actions:**
- [ ] Create wrapper with appropriate primitive
- [ ] Add semantic spacing with `gap` prop
- [ ] Apply padding with `padding` or shorthands
- [ ] Set colors with `background`/`onBackground`
- [ ] Add interactive elements (buttons, links)

**Rules (CRITICAL):**
- **NEVER use `<div>`** - always use `<Column>`, `<Row>`, or `<Grid>`
- **NEVER use Tailwind for layout** - use `fillWidth`, `gap`, `padding`
- **NEVER use hex colors** - use `background`, `onBackground` tokens

**Output:** Component implementation

**Example - RoomCard:**
```tsx
import { Column, Row, Heading, Text, Button, Icon, Badge } from '@/once-ui/components';

export function RoomCard({
  id,
  name,
  description,
  memberCount,
  isPublic,
  onJoin,
  onClick,
  ...flexProps  // Spread for layout flexibility
}: RoomCardProps) {
  return (
    <Column
      background="surface"
      radius="l"           // Large radius
      padding="24"        // 1.5rem padding
      gap="16"            // 1rem gap between children
      fillWidth           // Fluid width
      {...flexProps}      // Allow overrides from parent
    >
      {/* Header row with title and visibility badge */}
      <Row horizontal="space-between" vertical="center">
        <Heading variant="display-strong-m">{name}</Heading>
        <Badge
          icon={isPublic ? "globe" : "lock"}
          label={isPublic ? "Public" : "Private"}
          variant={isPublic ? "success" : "warning"}
        />
      </Row>
      
      {/* Description with neutral color */}
      {description && (
        <Text variant="body-default-m" onBackground="neutral-medium">
          {description}
        </Text>
      )}
      
      {/* Footer with member count and action */}
      <Row horizontal="space-between" vertical="center">
        <Row gap="8" vertical="center">
          <Icon name="users" size="s" onBackground="neutral-weak" />
          <Text variant="body-default-s" onBackground="neutral-weak">
            {memberCount} members
          </Text>
        </Row>
        
        <Button onClick={() => onJoin(id)} variant="primary" size="m">
          Join Room
        </Button>
      </Row>
    </Column>
  );
}
```

**Example - MemberList (Grid):**
```tsx
import { Grid, Column, Avatar, Text, Icon } from '@/once-ui/components';

interface MemberListProps {
  members: Array<{
    userId: number;
    username: string;
    avatarUrl?: string;
    isHost: boolean;
    isReady: boolean;
    isSpeaking: boolean;
  }>;
}

export function MemberList({ members }: MemberListProps) {
  return (
    <Grid columns={4} gap="16" fillWidth>
      {members.map(member => (
        <Column
          key={member.userId}
          gap="8"
          horizontal="center"
          padding="12"
          background={member.isSpeaking ? "success-weak" : "transparent"}
          radius="m"
        >
          {/* Avatar with speaking ring */}
          <div style={{ position: 'relative' }}>
            <Avatar
              src={member.avatarUrl}
              fallback={member.username[0]}
              size="l"
            />
            {member.isSpeaking && (
              <div
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: '2px solid var(--success-solid-medium)',
                }}
              />
            )}
            {member.isHost && (
              <Icon
                name="crown"
                size="s"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                }}
              />
            )}
          </div>
          
          <Text variant="body-default-s" align="center">
            {member.username}
          </Text>
          
          {member.isReady && (
            <Icon name="check" size="xs" onBackground="success-medium" />
          )}
        </Column>
      ))}
    </Grid>
  );
}
```

---

### 5. Add Framer Motion (if interactive)

Add animations for interactive components.

**Actions:**
- [ ] Identify animation triggers (hover, click, mount)
- [ ] Add motion wrappers with variants
- [ ] Implement gesture handlers if needed
- [ ] Test animation performance

**When to Use Motion:**
- Page transitions
- List item entrance animations
- Swipe gestures (AIPicks)
- Modal/dialog appearances
- Hover effects on cards

**Output:** Animated component version

**Example - Animated Card:**
```tsx
import { motion } from 'framer-motion';
import { Column, Heading, Text } from '@/once-ui/components';

export function AnimatedCard({ title, description, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
    >
      <Column background="surface" padding="24" radius="l" gap="12">
        <Heading variant="display-strong-m">{title}</Heading>
        <Text variant="body-default-m">{description}</Text>
      </Column>
    </motion.div>
  );
}
```

**Example - Swipeable Card (AIPicks):**
```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

export function SwipeableCard({ location, onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 100, 200], [0, 1, 1, 0]);
  
  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipeRight();
        if (info.offset.x < -100) onSwipeLeft();
      }}
    >
      <LocationCard location={location} />
    </motion.div>
  );
}
```

---

### 6. Create Barrel Export

Add component to feature index.

**Actions:**
- [ ] Create `index.ts` if doesn't exist
- [ ] Export component from index
- [ ] Export related types/interfaces
- [ ] Re-export from parent if needed

**Output:** `index.ts` barrel file

**Example:**
```typescript
// components/features/lobby/index.ts
export { RoomCard } from './RoomCard';
export { RoomList } from './RoomList';
export { ChatPanel } from './ChatPanel';
export { MemberList } from './MemberList';
export { VoiceBar } from './VoiceBar';
export { ReadyBar } from './ReadyBar';

// Re-export types
export type { RoomCardProps } from './RoomCard';
export type { MemberListProps } from './MemberList';
```

---

### 7. Add Accessibility

Ensure component is accessible.

**Actions:**
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen reader if critical

**Patterns:**
```tsx
// Button with tooltip and aria-label
<IconButton
  tooltip="Join voice call"
  aria-label="Join voice call"
  onClick={onJoin}
>
  <Icon name="microphone" />
</IconButton>

// Card with click handler (add role and tabIndex)
<Column
  role="button"
  tabIndex={0}
  onClick={onClick}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
  aria-label={`Join ${name} room`}
>
  {/* Content */}
</Column>
```

---

### 8. Test Component

Verify component renders correctly.

**Actions:**
- [ ] Test in isolation (Storybook if available)
- [ ] Test in actual page context
- [ ] Verify responsive behavior
- [ ] Check dark mode appearance
- [ ] Test all prop combinations

**Output:** Verified working component

---

## Common Component Patterns

### Card with Actions

```tsx
<Column background="surface" padding="24" radius="l" gap="16">
  <Heading variant="display-strong-m">{title}</Heading>
  <Text variant="body-default-m">{description}</Text>
  <Row horizontal="end" gap="8">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </Row>
</Column>
```

### List Item

```tsx
<Row 
  gap="16" 
  vertical="center"
  padding="16"
  background="surface"
  radius="m"
>
  <Avatar src={avatar} />
  <Column gap="4" fillWidth>
    <Text variant="body-strong-m">{name}</Text>
    <Text variant="body-default-s" onBackground="neutral-weak">
      {subtitle}
    </Text>
  </Column>
  <IconButton tooltip="More" icon="more-vertical" />
</Row>
```

### Form Layout

```tsx
<Column gap="24" fillWidth maxWidth="s" horizontal="center">
  <Heading variant="display-strong-m">Create Account</Heading>
  
  <Column gap="8" fillWidth>
    <Text variant="body-default-m">Email</Text>
    <Input type="email" placeholder="your@email.com" fillWidth />
  </Column>
  
  <Column gap="8" fillWidth>
    <Text variant="body-default-m">Password</Text>
    <Input type="password" placeholder="••••••••" fillWidth />
  </Column>
  
  <Button variant="primary" size="l" fillWidth>
    Sign Up
  </Button>
</Column>
```

---

## Troubleshooting

**Component not styling correctly:**
- Check you're using Once UI primitives, not `<div>`
- Verify you're using `fillWidth` not `w-full`
- Ensure `background` and `onBackground` are both set

**Animations not working:**
- Verify `framer-motion` is installed
- Check for conflicting CSS
- Use `motion.div` not `motion.Column` (Once UI components aren't motion components)

**Props not being applied:**
- Ensure you're spreading `{...flexProps}` on the root element
- Check TypeScript interface extends the right type

**Colors wrong in dark mode:**
- Use `background`/`onBackground` pairs, not hardcoded colors
- Use `surface` for elevated elements
