import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DeckSection, DeckTheme, VisualComponent, VisualComponentLayout } from '../../types/index.ts';
import { VisualComponentRenderer } from '../../components/VisualComponentRenderer.tsx';
import { ResizeHandle } from '../../components/ResizeHandle.tsx';

// Add these properties to the Window interface
declare global {
  interface Window {
    _initialResizeMouseX: number;
    _initialResizeMouseY: number;
    _initialResizeWidth: number;
    _initialResizeHeight: number;
    _initialResizeX: number;
    _initialResizeY: number;
    _resizeMouseMoveListener: ((e: MouseEvent) => void) | null;
    _resizeMouseUpListener: ((e: MouseEvent) => void) | null;
  }
}

interface PreviewSlideProps {
  section: DeckSection | undefined | null;
  theme?: DeckTheme | null;
  zoomLevel: number;
  logicalWidth?: number; // Made optional
  logicalHeight?: number; // Made optional
  previewMode?: boolean;
  style?: React.CSSProperties; // Added style prop
  onSelect?: (id: string | null) => void;
  onUpdateLayout?: (id: string, layout: Partial<VisualComponentLayout>) => void;
  onOpenEditor?: (componentId: string) => void;
  onDeleteComponent?: (componentId: string) => void;
  selectedComponentId?: string | null;
  onAddComponentRequested?: (x: number, y: number) => void; // New prop for adding components
}

const PreviewSlide: React.FC<PreviewSlideProps> = ({
  section,
  theme,
  zoomLevel, 
  logicalWidth, // Will be undefined in 100% fill mode
  logicalHeight, // Will be undefined in 100% fill mode
  previewMode = true,
  style, // Destructure style prop
  onSelect,
  onUpdateLayout,
  onOpenEditor,
  onDeleteComponent,
  selectedComponentId,
  onAddComponentRequested,
}) => {
  
  const [resizingComponentId, setResizingComponentId] = useState<string | null>(null);
  const resizingComponentIdRef = useRef<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const resizeDirectionRef = useRef<string | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Define the resize move handler without useCallback to avoid closure issues
  function handleResizeMove(e: MouseEvent) {
    // console.log('Resize move event', e.clientX, e.clientY); // Reduced logging
    
    const resizingId = resizingComponentIdRef.current;
    const direction = resizeDirectionRef.current;
    if (!resizingId || !direction || !onUpdateLayout || !section?.components) {
      console.log('Early return from resize move', { resizingComponentId: resizingId, resizeDirection: direction });
      return;
    }

    const component = section.components.find(c => c.id === resizingId);
    if (!component) {
      console.log('Component not found', resizingId); // Fixed: Using resizingId from ref instead of state
      return;
    }
    
    // Create a new layout object to avoid mutating the original
    let newLayout: Partial<VisualComponentLayout> = {};

    // Calculate the mouse movement deltas
    const deltaX = e.clientX - window._initialResizeMouseX;
    const deltaY = e.clientY - window._initialResizeMouseY;

    // Scale the deltas by the zoom level to get the actual movement in logical space
    const scaledDeltaX = deltaX / zoomLevel;
    const scaledDeltaY = deltaY / zoomLevel;

    console.log('Resize deltas', { 
      deltaX, 
      deltaY, 
      scaledDeltaX, 
      scaledDeltaY, 
      zoomLevel,
      initialWidth: window._initialResizeWidth,
      initialHeight: window._initialResizeHeight,
      initialX: window._initialResizeX,
      initialY: window._initialResizeY
    });

    // Handle different resize directions
    if (direction.includes('right')) {
      // Right edge - adjust width
      const newWidth = Math.max(20, window._initialResizeWidth + scaledDeltaX);
      newLayout.width = newWidth;
    }
    
    if (direction.includes('left')) {
      // Left edge - adjust x position and width
      const newWidth = Math.max(20, window._initialResizeWidth - scaledDeltaX);
      newLayout.x = window._initialResizeX + window._initialResizeWidth - newWidth;
      newLayout.width = newWidth;
    }
    
    if (direction.includes('bottom')) {
      // Bottom edge - adjust height
      const newHeight = Math.max(20, window._initialResizeHeight + scaledDeltaY);
      newLayout.height = newHeight;
    }
    
    if (direction.includes('top')) {
      // Top edge - adjust y position and height
      const newHeight = Math.max(20, window._initialResizeHeight - scaledDeltaY);
      newLayout.y = window._initialResizeY + window._initialResizeHeight - newHeight;
      newLayout.height = newHeight;
    }
    
    // Ensure all values are finite numbers
    Object.entries(newLayout).forEach(([key, value]) => {
      if (!Number.isFinite(value)) {
        // console.warn(`Invalid ${key} value: ${value}, using original value`); // Reduced logging
        newLayout[key as keyof VisualComponentLayout] = component.layout[key as keyof VisualComponentLayout];
      }
    });
    
    // console.log('Updating layout', { // Reduced logging
    //   componentId: resizingId,
    //   originalLayout: component.layout,
    //   newLayout
    // });
    
    // Update the component layout
    onUpdateLayout(resizingId, newLayout);
  }

  // Define the resize end handler
  function handleResizeEnd(e: MouseEvent) {
    // console.log('Resize end event'); // Reduced logging
    
    // Clean up event listeners
    if (window._resizeMouseMoveListener) {
      document.removeEventListener('mousemove', window._resizeMouseMoveListener);
      window._resizeMouseMoveListener = null;
    }
    if (window._resizeMouseUpListener) {
      document.removeEventListener('mouseup', window._resizeMouseUpListener);
      window._resizeMouseUpListener = null;
    }
    
    // Important: First update the ref values
    resizingComponentIdRef.current = null;
    resizeDirectionRef.current = null;
    
    // Then update the state values (this triggers a re-render)
    setResizingComponentId(null);
    setResizeDirection(null);
  }

  // Define the resize start handler
  const handleResizeStart = (componentId: string, direction: string, componentLayout: VisualComponentLayout) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Resize start', { componentId, direction, clientX: e.clientX, clientY: e.clientY });
    
    // Important: First update the ref values (these are used by event handlers)
    resizingComponentIdRef.current = componentId;
    resizeDirectionRef.current = direction;
    
    // Then update the state values (this triggers a re-render)
    setResizingComponentId(componentId);
    setResizeDirection(direction);
    
    // Store initial values
    window._initialResizeMouseX = e.clientX;
    window._initialResizeMouseY = e.clientY;
    window._initialResizeWidth = componentLayout.width;
    window._initialResizeHeight = componentLayout.height;
    window._initialResizeX = componentLayout.x;
    window._initialResizeY = componentLayout.y;
    
    // Create bound handlers
    window._resizeMouseMoveListener = handleResizeMove;
    window._resizeMouseUpListener = handleResizeEnd;

    // Add event listeners to document
    document.addEventListener('mousemove', window._resizeMouseMoveListener);
    document.addEventListener('mouseup', window._resizeMouseUpListener);
  };
  
  // Clean up event listeners when component unmounts or when dependencies change
  useEffect(() => {
    // Clean up function
    return () => {
      if (window._resizeMouseMoveListener) {
        document.removeEventListener('mousemove', window._resizeMouseMoveListener);
        window._resizeMouseMoveListener = null;
      }
      if (window._resizeMouseUpListener) {
        document.removeEventListener('mouseup', window._resizeMouseUpListener);
        window._resizeMouseUpListener = null;
      }
    };
  }, []);

  const handleSlideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't process clicks if we're in preview mode
    if (previewMode) return;
    
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    // Check if click is on the slide background itself
    const isBackgroundClick = target === currentTarget;
    
    // Check if click is on the selection outline or a resize handle
    const isSelectionOutlineClick = target.classList.contains('component-selection-outline');
    const isResizeHandleClick = target.classList.contains('resize-handle');
    
    // console.log('Slide click event:', { // Reduced logging
    //   target,
    //   currentTarget,
    //   isBackgroundClick,
    //   isSelectionOutlineClick,
    //   isResizeHandleClick,
    //   targetClass: target.className,
    //   targetId: target.id
    // });
    
    // Don't deselect if clicking on selection outline or resize handles
    if (isSelectionOutlineClick || isResizeHandleClick) {
      return;
    }
    
    // If there's a selected component, check if the click is within its bounds (including handles)
    if (selectedComponentId && section?.components) {
      const selectedComponent = section.components.find(c => c.id === selectedComponentId);
      if (selectedComponent) {
        const rect = currentTarget.getBoundingClientRect();
        const scrollLeft = currentTarget.scrollLeft || 0;
        const scrollTop = currentTarget.scrollTop || 0;
        
        // Calculate click position relative to the slide, accounting for scroll
        const clickX = (e.clientX - rect.left + scrollLeft) / zoomLevel;
        const clickY = (e.clientY - rect.top + scrollTop) / zoomLevel;
        
        // Add padding around the component to account for handles
        const padding = 20; // Handles extend 7px + some extra space
        const isWithinComponentBounds = 
          clickX >= selectedComponent.layout.x - padding &&
          clickX <= selectedComponent.layout.x + selectedComponent.layout.width + padding &&
          clickY >= selectedComponent.layout.y - padding &&
          clickY <= selectedComponent.layout.y + selectedComponent.layout.height + padding;
        
        if (isWithinComponentBounds) {
          // console.log('Click is within selected component bounds - not deselecting'); // Reduced logging
          return;
        }
      }
    }
    
    if (isBackgroundClick && onAddComponentRequested) {
      // Click was directly on the slide background, not on a child component
      const rect = currentTarget.getBoundingClientRect();
      const scrollLeft = currentTarget.scrollLeft || 0;
      const scrollTop = currentTarget.scrollTop || 0;
      
      // Calculate position accounting for scroll and zoom
      const x = (e.clientX - rect.left + scrollLeft) / zoomLevel;
      const y = (e.clientY - rect.top + scrollTop) / zoomLevel;
      
      // console.log('Slide click at:', { x, y, zoomLevel, clientX: e.clientX, clientY: e.clientY }); // Reduced logging
      onAddComponentRequested(x, y);
    } else if (isBackgroundClick && onSelect) { // Corrected casing for onSelect
      // Deselect when clicking on empty slide area
      // console.log('Deselecting component - clicked on slide background'); // Reduced logging
      onSelect(null); // Corrected casing for onSelect
    }
  };

  if (!section) {
    return (
      <div 
        className="preview-slide-content preview-slide-placeholder" 
        style={{ 
          width: logicalWidth === undefined ? '100%' : `${logicalWidth}px`, 
          height: logicalHeight === undefined ? '100%' : `${logicalHeight}px`
        }}
        onClick={handleSlideClick}
      >
        <p>Slide content unavailable.</p>
      </div>
    );
  }

  const componentsToRender: VisualComponent[] = section.components || [];
  
  // Extract slide styles from section
  const sectionSlideStyle = section?.slideStyle || {};

  // Create the base slide style properties
  const slideStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    position: logicalWidth === undefined ? 'absolute' : 'relative', // Absolute for 100% fill case
    width: logicalWidth === undefined ? '100%' : `${logicalWidth}px`,
    height: logicalHeight === undefined ? '100%' : `${logicalHeight}px`,
    top: logicalWidth === undefined ? 0 : undefined,
    left: logicalWidth === undefined ? 0 : undefined,
    right: logicalWidth === undefined ? 0 : undefined,
    bottom: logicalWidth === undefined ? 0 : undefined,
  };

  // Apply background styles in priority order
  // 1. First, apply section's explicit backgroundColor if available
  if (sectionSlideStyle.backgroundColor) {
    slideStyle.backgroundColor = sectionSlideStyle.backgroundColor;
  } 
  // 2. Apply section's background if available (this is a shorthand property)
  else if (sectionSlideStyle.background) {
    slideStyle.background = sectionSlideStyle.background;
  }
  // 3. Apply theme background as fallback
  else if (theme?.colors?.slideBackground) {
    slideStyle.background = theme.colors.slideBackground;
  }
  // 4. Apply any other styles (but skip background/backgroundColor which we've already handled)
  const { backgroundColor, background, ...otherSectionSlideStyles } = sectionSlideStyle;
  Object.assign(slideStyle, otherSectionSlideStyles);
  
  // 5. Finally, apply any directly passed style props
  if (style) {
    Object.assign(slideStyle, style);
  }

  // We'll use a consistent rendering approach regardless of preview mode
  // No additional scaling factor is needed as that's handled by the parent component's container
  const scaleFactor = 1;
  
  // Render the components directly with proper scaling
  return (
    <div
      ref={slideRef}
      className="preview-slide-content"
      style={{
        ...slideStyle,
        // position, left, top, width, height are now all part of slideStyle
        overflow: 'hidden',
        pointerEvents: 'auto',
        display: 'block', // Keep as block to allow children to position correctly
        // Add position relative for absolute positioning of children
        position: 'relative',
      }}
      onClick={handleSlideClick}
    >
      {/* Render all components */}
      {componentsToRender.length > 0 &&
        componentsToRender.map((component: VisualComponent) => {
          // Use the original component layout - any scaling is done through container sizing
          // instead of modifying the component layout properties
          const scaledComponent = component;
          
          return (
            <VisualComponentRenderer
              key={component.id}
              component={scaledComponent}
              themeSettings={theme ? {
                primaryColor: theme.colors.primary,
                secondaryColor: theme.colors.secondary,
                accentColor: theme.colors.accent,
                backgroundColor: theme.colors.background,
                textColor: theme.colors.text,
                fontFamily: theme.fonts.body,
              } : undefined}
              previewMode={previewMode}
              onSelect={!previewMode ? onSelect : undefined} // Corrected casing for onSelect
              onUpdateLayout={!previewMode ? onUpdateLayout : undefined}
              onOpenEditor={!previewMode ? onOpenEditor : undefined}
              onDeleteComponent={!previewMode ? onDeleteComponent : undefined}
              selectedComponentId={!previewMode ? selectedComponentId : undefined}
              slideZoomLevel={zoomLevel}
            />
          );
        })}

      {/* Selection outline and handles rendered INSIDE the scaled container */}
      {!previewMode && selectedComponentId && (() => {
        const selectedVisualComponent = componentsToRender.find(c => c.id === selectedComponentId);
        if (!selectedVisualComponent) return null;

        // Outline and handles are now relative to the scaled container
        const outlineStyle: React.CSSProperties = {
          position: 'absolute',
          left: selectedVisualComponent.layout.x - 2,
          top: selectedVisualComponent.layout.y - 2,
          width: selectedVisualComponent.layout.width + 4,
          height: selectedVisualComponent.layout.height + 4,
          border: '2px solid #3b82f6',
          pointerEvents: 'none',
          zIndex: 999
        };

        const handlePositions = [
          { position: 'top-left' as const, left: -7, top: -7 },
          { position: 'top-right' as const, left: selectedVisualComponent.layout.width - 7, top: -7 },
          { position: 'bottom-left' as const, left: -7, top: selectedVisualComponent.layout.height - 7 },
          { position: 'bottom-right' as const, left: selectedVisualComponent.layout.width - 7, top: selectedVisualComponent.layout.height - 7 },
          { position: 'left' as const, left: -7, top: selectedVisualComponent.layout.height / 2 - 7 },
          { position: 'right' as const, left: selectedVisualComponent.layout.width - 7, top: selectedVisualComponent.layout.height / 2 - 7 },
          { position: 'top' as const, left: selectedVisualComponent.layout.width / 2 - 7, top: -7 },
          { position: 'bottom' as const, left: selectedVisualComponent.layout.width / 2 - 7, top: selectedVisualComponent.layout.height - 7 }
        ];

        return (
          <div style={outlineStyle} className="component-selection-outline">
            {handlePositions.map(({ position, left, top }) => (
              <div
                key={`${selectedVisualComponent.id}-${position}-handle`}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: 14,
                  height: 14,
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 3px rgba(0, 0, 0, 0.5)',
                  cursor: position.includes('left') || position.includes('right')
                    ? position.includes('top') || position.includes('bottom')
                      ? position.includes('top-left') || position.includes('bottom-right')
                        ? 'nwse-resize'
                        : 'nesw-resize'
                      : 'ew-resize'
                    : 'ns-resize',
                  zIndex: 10000,
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleResizeStart(selectedVisualComponent.id, position, selectedVisualComponent.layout)(e);
                }}
                onMouseEnter={() => { }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="resize-handle"
              />
            ))}
          </div>
        );
      })()}

      {componentsToRender.length === 0 && (
        <div
          className="preview-slide-empty"
          style={{
            padding: '2rem',
            textAlign: 'center',
            width: logicalWidth === undefined ? '100%' : `${logicalWidth}px`,
            height: logicalHeight === undefined ? '100%' : `${logicalHeight}px`,
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          <p>This slide is empty or has no visual components.</p>
        </div>
      )}
    </div>
  );
};

export default PreviewSlide;
