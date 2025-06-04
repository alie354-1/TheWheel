# Deck Builder Debugging Guide

## Current Issues and Fixes Applied

### 1. Components Disappearing on Click/Drag
**Problem**: Components were disappearing when clicked or dragged.

**Fixes Applied**:
- Added `e.stopPropagation()` to component select handler in VisualComponentRenderer
- Added console logging to track selection events
- Added onClick handler to resize handles to prevent event bubbling

**Debug Steps**:
1. Open browser console
2. Click on a component
3. Look for these console logs:
   - "Component select event" - should show componentId and event details
   - "Slide click event" - should NOT appear when clicking on a component
   - Check if `isBackgroundClick` is false when clicking components

### 2. Component Resize Not Working
**Problem**: Resize handles appear but resizing doesn't work properly.

**Fixes Applied**:
- Moved resize logic to PreviewSlide to avoid state conflicts
- Added console logging for resize events
- Properly scaled mouse deltas by zoom level
- Added onClick handlers to prevent accidental deselection

**Debug Steps**:
1. Select a component
2. Check console for "Rendering handles for component" log
3. Mouse down on a handle and check for:
   - "Handle mouseDown event triggered"
   - "Resize start" log
4. Drag and check for:
   - "Resize move event" logs with delta values
5. Release and check for:
   - "Resize end event" log

### 3. Component Movement Issues
**Problem**: Components not moving correctly when dragged.

**Debug Steps**:
1. Check if Draggable is disabled (`previewMode` prop)
2. Look for "Drag stop event" in console
3. Verify that the new x/y coordinates are different from original

## Console Logging Added

### Selection Events
```javascript
console.log('Component select event:', {
  componentId: component.id,
  target: e.target,
  currentTarget: e.currentTarget,
  nativeEvent: e.nativeEvent
});
```

### Resize Events
```javascript
console.log('Handle mouseDown event triggered', {
  position,
  componentId: selectedVisualComponent.id,
  mouseX: e.clientX,
  mouseY: e.clientY
});

console.log('Resize deltas', { 
  deltaX, 
  deltaY, 
  scaledDeltaX, 
  scaledDeltaY, 
  zoomLevel
});
```

### Drag Events
```javascript
console.log('Drag stop event', {
  componentId: component.id,
  originalX: component.layout.x,
  originalY: component.layout.y,
  newX: draggableData.x,
  newY: draggableData.y,
  slideZoomLevel
});
```

## Common Issues and Solutions

### Issue: Component disappears after selection
**Check**: 
- Is the component being removed from state?
- Is onSelect being called with null?
- Is the parent re-rendering and losing component data?
- Check the console for "Click is within selected component bounds" messages

### Issue: Component deselects when clicking near it
**Check**:
- Look for "isSelectionOutlineClick" or "isResizeHandleClick" in console
- Check if "isWithinComponentBounds" calculation is working
- Verify the padding value (20px) is sufficient for your handle size

### Issue: Resize calculations are wrong
**Check**:
- Is zoomLevel being passed correctly?
- Are initial values being stored properly?
- Are layout updates sanitized for NaN/Infinity?

### Issue: Components jump when dragged
**Check**:
- Is the Draggable position prop synchronized with component.layout?
- Is bounds="parent" working correctly?
- Is the zoom level affecting drag calculations?

## Testing Checklist

1. **Component Selection**
   - [ ] Click component - should select
   - [ ] Click background - should deselect
   - [ ] Click another component - should switch selection

2. **Component Dragging**
   - [ ] Drag component - should move smoothly
   - [ ] Release - should update position
   - [ ] Component should stay within bounds

3. **Component Resizing**
   - [ ] Resize handles visible when selected
   - [ ] Each handle resizes correctly
   - [ ] Minimum size constraints work
   - [ ] Layout updates are saved

4. **Zoom Behavior**
   - [ ] Components scale with zoom
   - [ ] Interactions work at all zoom levels
   - [ ] Coordinates are properly scaled

## Next Steps

If issues persist after checking the above:

1. Add more detailed logging to track state changes
2. Use React DevTools to inspect component props and state
3. Check for any errors in the browser console
4. Verify that all event handlers are properly bound
5. Test with a minimal component setup to isolate issues

## State Flow Diagram

```
User Click → VisualComponentRenderer.handleSelect() 
    ↓ (stopPropagation)
    → onSelect(componentId)
    → UnifiedDeckBuilder updates selectedComponentId
    → PreviewSlide re-renders with selection
    → Resize handles appear

User Drag Handle → PreviewSlide.handleResizeStart()
    ↓
    → Document mousemove listener
    → handleResizeMove() calculates new dimensions
    → onUpdateLayout() updates component
    → Component re-renders with new size
