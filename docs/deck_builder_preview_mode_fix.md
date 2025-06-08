# Deck Builder Preview Mode Fix

## Issue Description
The preview mode screen was padding the background color instead of stretching the canvas to match the bigger screen in fullscreen mode.

## Root Cause
The issue was caused by multiple layers of scaling and transformation:
1. `PreviewSlide` component was calculating and applying its own scale transform
2. `DeckPreviewer` component was wrapping the slide in a scaled wrapper
3. In fullscreen mode, both scaling mechanisms were active, causing the slide to not fill the screen properly

## Solution Applied

### 1. Fixed PreviewSlide Component
- Modified the scale calculation to only apply when `previewMode` is true
- In edit mode (when `previewMode` is false), the slide fills its container without scaling
- Added proper absolute positioning styles to ensure the slide fills its parent

### 2. Fixed DeckPreviewer Component  
- Added conditional rendering for fullscreen vs normal mode
- In fullscreen mode, render `PreviewSlide` directly without a wrapper
- Set PreviewSlide to fill the viewport with absolute positioning in fullscreen
- In normal mode, continue using the wrapper with scaling for proper preview

### 3. Key Changes

#### PreviewSlide.tsx
```tsx
// Only calculate scale in preview mode
const scale = previewMode 
  ? Math.min(availableWidth / logicalWidth, availableHeight / logicalHeight) 
  : 1;

// Apply positioning based on mode
const slideStyle = previewMode ? {
  // Centered scaling for preview
  transform: `scale(${scale})`,
  transformOrigin: 'center center',
} : {
  // Fill container in edit mode
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
};
```

#### DeckPreviewer.tsx
```tsx
{isFullscreen ? (
  // In fullscreen mode, let PreviewSlide fill the viewport directly
  <PreviewSlide
    // ... props
    style={{
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  />
) : (
  // In normal mode, use the wrapper with scaling
  <div className="preview-slide-wrapper" style={wrapperStyle}>
    <PreviewSlide />
  </div>
)}
```

## Result
- In fullscreen mode, the slide now properly fills the entire viewport
- The slide content scales appropriately to fit the screen
- No more padding or letterboxing issues
- Edit mode works correctly with components filling the canvas
