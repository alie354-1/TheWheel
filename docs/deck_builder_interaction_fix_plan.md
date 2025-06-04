# Deck Builder Interaction Fix Plan

## Issue Summary
Components in UnifiedDeckBuilder are not responding to drag/resize interactions, despite event handlers being triggered.

## Test Results from TestDeckBuilder

### Working Implementation
The TestDeckBuilder demonstrates that basic drag-and-drop functionality works correctly when:

1. **Component state is properly updated during mouse move events**
   - The `updateComponent` function directly updates state
   - Position/size changes are immediately reflected in the UI

2. **Text scales proportionally with component size**
   - Font size calculated as: `Math.min(component.width / 10, component.height / 5)px`
   - Ensures readability at all sizes

## Key Differences: TestDeckBuilder vs UnifiedDeckBuilder

### TestDeckBuilder (Working)
```typescript
// Direct state update
const updateComponent = (id: string, updates: Partial<TestComponent>) => {
  setComponents(prev => prev.map(comp => 
    comp.id === id ? { ...comp, ...updates } : comp
  ));
};

// Simple position calculation
const newX = e.clientX - dragStart.x;
const newY = e.clientY - dragStart.y;
updateComponent(selectedId, { x: newX, y: newY });
```

### UnifiedDeckBuilder (Not Working)
```typescript
// Complex nested state update through deck service
handleUpdateComponentLayout(componentId, {
  x: position.x,
  y: position.y,
  width: size.width,
  height: size.height
});

// Position calculation with zoom
const scaledDeltaX = deltaX / zoomLevel;
const scaledDeltaY = deltaY / zoomLevel;
```

## Root Causes

1. **State Update Chain Complexity**
   - UnifiedDeckBuilder uses: Component → Section → Deck → useDeck hook → DeckService
   - Multiple layers of immutability checks and updates
   - Possible state mutation or update failure at any level

2. **Zoom Calculations**
   - Division by `zoomLevel` may produce incorrect values
   - If `zoomLevel` is 0 or very small, positions become extreme
   - Zoom recalculation on every render may interfere with updates

3. **React-Draggable Integration**
   - Conflicts between react-draggable and manual resize handling
   - Both trying to control position updates

## Fix Implementation Plan

### Phase 1: Immediate Fixes
1. **Add comprehensive logging to trace state updates**
   ```typescript
   console.log('Before update:', { component, position });
   handleUpdateComponentLayout(componentId, newLayout);
   console.log('After update:', { updatedComponent });
   ```

2. **Verify zoom calculations**
   - Add bounds checking: `const safeZoomLevel = Math.max(0.1, zoomLevel);`
   - Log zoom values during interactions

3. **Simplify VisualComponentRenderer**
   - Remove react-draggable temporarily
   - Implement manual drag handling like TestDeckBuilder
   - Once working, carefully reintegrate react-draggable

### Phase 2: State Management Fixes
1. **Audit the state update chain**
   - Add logging at each level (Component → Section → Deck)
   - Verify immutability is maintained
   - Check for any state mutations

2. **Consider flattening component state**
   - Store components in a flat map instead of nested in sections
   - Simplify update logic

### Phase 3: Long-term Improvements
1. **Implement proper zoom handling**
   - Store zoom as part of viewport state, not component state
   - Apply zoom via CSS transform on container, not individual calculations

2. **Create a unified interaction system**
   - Single source of truth for drag/resize state
   - Consistent event handling across all components

## Testing Strategy

1. **Start with UnifiedDeckBuilder in isolation**
   - Remove all features except basic drag/drop
   - Gradually add back zoom, resize, etc.

2. **Compare behavior side-by-side**
   - Run TestDeckBuilder and UnifiedDeckBuilder simultaneously
   - Log and compare state updates

3. **Unit test state updates**
   - Test each level of the state update chain
   - Verify immutability and correct updates

## Next Steps

1. Apply Phase 1 fixes to UnifiedDeckBuilder
2. Test basic drag functionality without zoom
3. Gradually reintroduce features once base functionality works
4. Document any additional issues discovered

## Success Criteria

- Components move when dragged
- Components resize when handles are dragged
- State updates are reflected immediately in the UI
- Zoom doesn't break interactions
- No components disappear or jump to incorrect positions
