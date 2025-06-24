# Mobile Notifications System

## Overview
The mobile notifications system provides real-time alerts when users claim bonuses, with mobile-optimized design and smart CTA hiding functionality.

## Features

### 🎯 **Responsive Design**
- **Mobile**: Almost full width `calc(100vw - 2rem)`, centralized positioning (`left-1/2 transform -translate-x-1/2`)
- **Desktop**: Fixed width, positioned in left bottom corner (`md:left-4 md:translate-x-0`)
- **Adaptive**: Seamlessly transitions between mobile and desktop layouts

### 📱 **Smart CTA Management**
- **Auto-Hide**: Sticky CTAs automatically hide when notifications appear
- **Smooth Transition**: CTAs return seamlessly when notifications disappear
- **Context-Aware**: Uses React Context for global state management

### ✨ **Enhanced UX**
- **Slide-Up Animation**: Notifications slide up from bottom with smooth transitions
- **Optimized Spacing**: Reduced padding and logo sizes on mobile
- **Touch-Friendly**: Larger touch targets and improved mobile interaction

## Implementation

### Core Components

#### `NotificationContext.tsx`
Provides global state management for notification visibility:
```tsx
const { hasActiveNotifications, setHasActiveNotifications } = useNotifications();
```

#### `OfferNotifications.tsx`
Main notification component with mobile-optimized styling:
- **Container**: Fixed bottom center positioning
- **Width**: `w-[calc(100vw-2rem)] max-w-[480px]` 
- **Animation**: Slide-up from bottom (`translate-y-full` to `translate-y-0`)

#### `ClientStickyWrapper.tsx`  
Sticky CTA component that respects notification state:
```tsx
if (!isVisible || hasActiveNotifications) return null;
```

### Mobile Styles

#### Notification Container
```css
.notification-container {
  position: fixed;
  bottom: 1rem;
  /* Mobile: Centralized */
  left: 50%;
  transform: translateX(-50%);
  /* Desktop: Left corner */
  @media (min-width: 768px) {
    left: 1rem;
    transform: translateX(0);
  }
  width: calc(100vw - 2rem);
  max-width: 480px;
}
```

#### Responsive Design
- **Mobile**: Compact 12x12 logos, smaller padding, optimized text
- **Desktop**: Larger 16x16 logos, generous padding, enhanced visuals

## Technical Details

### State Management
1. **OfferNotifications** tracks active notifications array
2. **useEffect** updates global context when notifications change
3. **ClientStickyWrapper** subscribes to context for CTA visibility

### Animation Flow
1. Notification appears: slides up (`translate-y-0`)
2. Auto-hide after 10s: slides down (`translate-y-full`)
3. Remove from DOM after 300ms transition

### Mobile Optimizations
- Reduced spacing (`space-x-4 md:space-x-6`)
- Smaller logos (`w-12 h-12 md:w-16 md:h-16`)  
- Compact text (`text-sm md:text-base`)
- Reduced padding (`p-6 md:p-8`)

## Usage

### Setup
The NotificationProvider wraps the entire app in `layout.tsx`:
```tsx
<NotificationProvider>
  <AuthProvider>
    {/* App content */}
  </AuthProvider>
</NotificationProvider>
```

### Accessing Context
Any component can access notification state:
```tsx
import { useNotifications } from '@/components/NotificationContext';

const { hasActiveNotifications, setHasActiveNotifications } = useNotifications();
```

## Benefits

✅ **Responsive UX**: Optimized positioning for both mobile and desktop  
✅ **Smart CTAs**: No conflicting UI elements during notifications  
✅ **Adaptive Design**: Mobile-centralized, desktop left-corner positioning  
✅ **Smooth Animations**: Professional slide-up/down transitions  
✅ **Context-Aware**: Global state management for consistent behavior  

## Browser Support
- iOS Safari 12+
- Chrome Mobile 60+
- Firefox Mobile 68+
- Edge Mobile 79+ 