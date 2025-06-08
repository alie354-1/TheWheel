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
  onSelect?: (id: string | null, multiSelect?: boolean) => void;
  onUpdateLayout?: (id: string, layout: Partial<VisualComponentLayout>) => void;
  onOpenEditor?: (componentId: string) => void;
  onDeleteComponent?: (componentId: string) => void;
  selectedComponentIds?: Set<string>;
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
  selectedComponentIds,
  onAddComponentRequested,
}) => {
  
  const [resizingComponentId, setResizingComponentId] = useState<string | null>(null);
  const resizingComponentIdRef = useRef<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const resizeDirectionRef = useRef<string | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Define the resize move handler without useCallback to avoid closure issues
  function handleResizeMove(e: MouseEvent) {
    const resizingId = resizingComponentIdRef.current;
    const direction = resizeDirectionRef.current;
    if (!resizingId || !direction || !onUpdateLayout || !section?.components) {
      return;
    }

    const component = section.components.find(c => c.id === resizingId);
    if (!component) {
      return;
    }
    
    let newLayout: Partial<VisualComponentLayout> = {};

    const deltaX = e.clientX - window._initialResizeMouseX;
    const deltaY = e.clientY - window._initialResizeMouseY;

    const scaledDeltaX = deltaX / zoomLevel;
    const scaledDeltaY = deltaY / zoomLevel;

    if (direction.includes('right')) {
      const newWidth = Math.max(20, window._initialResizeWidth + scaledDeltaX);
      newLayout.width = newWidth;
    }
    
    if (direction.includes('left')) {
      const newWidth = Math.max(20, window._initialResizeWidth - scaledDeltaX);
      newLayout.x = window._initialResizeX + window._initialResizeWidth - newWidth;
      newLayout.width = newWidth;
    }
    
    if (direction.includes('bottom')) {
      const newHeight = Math.max(20, window._initialResizeHeight + scaledDeltaY);
      newLayout.height = newHeight;
    }
    
    if (direction.includes('top')) {
      const newHeight = Math.max(20, window._initialResizeHeight - scaledDeltaY);
      newLayout.y = window._initialResizeY + window._initialResizeHeight - newHeight;
      newLayout.height = newHeight;
    }
    
    Object.entries(newLayout).forEach(([key, value]) => {
      if (!Number.isFinite(value)) {
        newLayout[key as keyof VisualComponentLayout] = component.layout[key as keyof VisualComponentLayout];
      }
    });
    
    onUpdateLayout(resizingId, newLayout);
  }

  function handleResizeEnd(e: MouseEvent) {
    if (window._resizeMouseMoveListener) {
      document.removeEventListener('mousemove', window._resizeMouseMoveListener);
      window._resizeMouseMoveListener = null;
    }
    if (window._resizeMouseUpListener) {
      document.removeEventListener('mouseup', window._resizeMouseUpListener);
      window._resizeMouseUpListener = null;
    }
    
    resizingComponentIdRef.current = null;
    resizeDirectionRef.current = null;
    
    setResizingComponentId(null);
    setResizeDirection(null);
  }

  const handleResizeStart = (componentId: string, direction: string, componentLayout: VisualComponentLayout) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    resizingComponentIdRef.current = componentId;
    resizeDirectionRef.current = direction;
    
    setResizingComponentId(componentId);
    setResizeDirection(direction);
    
    window._initialResizeMouseX = e.clientX;
    window._initialResizeMouseY = e.clientY;
    window._initialResizeWidth = componentLayout.width;
    window._initialResizeHeight = componentLayout.height;
    window._initialResizeX = componentLayout.x;
    window._initialResizeY = componentLayout.y;
    
    window._resizeMouseMoveListener = handleResizeMove;
    window._resizeMouseUpListener = handleResizeEnd;

    document.addEventListener('mousemove', window._resizeMouseMoveListener);
    document.addEventListener('mouseup', window._resizeMouseUpListener);
  };
  
  useEffect(() => {
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
    if (previewMode) return;
    
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    const isBackgroundClick = target === currentTarget;
    
    const isSelectionOutlineClick = target.classList.contains('component-selection-outline');
    const isResizeHandleClick = target.classList.contains('resize-handle');
    
    if (isSelectionOutlineClick || isResizeHandleClick) {
      return;
    }
    
    if (selectedComponentIds && selectedComponentIds.size > 0 && section?.components) {
      const selectedComponent = section.components.find(c => selectedComponentIds.has(c.id));
      if (selectedComponent) {
        const rect = currentTarget.getBoundingClientRect();
        const scrollLeft = currentTarget.scrollLeft || 0;
        const scrollTop = currentTarget.scrollTop || 0;
        
        const clickX = (e.clientX - rect.left + scrollLeft) / zoomLevel;
        const clickY = (e.clientY - rect.top + scrollTop) / zoomLevel;
        
        const padding = 20;
        const isWithinComponentBounds = 
          clickX >= selectedComponent.layout.x - padding &&
          clickX <= selectedComponent.layout.x + selectedComponent.layout.width + padding &&
          clickY >= selectedComponent.layout.y - padding &&
          clickY <= selectedComponent.layout.y + selectedComponent.layout.height + padding;
        
        if (isWithinComponentBounds) {
          return;
        }
      }
    }
    
    if (isBackgroundClick && onAddComponentRequested) {
      const rect = currentTarget.getBoundingClientRect();
      const scrollLeft = currentTarget.scrollLeft || 0;
      const scrollTop = currentTarget.scrollTop || 0;
      
      const x = (e.clientX - rect.left + scrollLeft) / zoomLevel;
      const y = (e.clientY - rect.top + scrollTop) / zoomLevel;
      
      onAddComponentRequested(x, y);
    } else if (isBackgroundClick && onSelect) {
      onSelect(null);
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
  
  const sectionSlideStyle = section?.slideStyle || {};

  const slideStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    position: logicalWidth === undefined ? 'absolute' : 'relative',
    width: logicalWidth === undefined ? '100%' : `${logicalWidth}px`,
    height: logicalHeight === undefined ? '100%' : `${logicalHeight}px`,
    top: logicalWidth === undefined ? 0 : undefined,
    left: logicalWidth === undefined ? 0 : undefined,
    right: logicalWidth === undefined ? 0 : undefined,
    bottom: logicalWidth === undefined ? 0 : undefined,
  };

  if (sectionSlideStyle.backgroundColor) {
    slideStyle.backgroundColor = sectionSlideStyle.backgroundColor;
  } 
  else if (sectionSlideStyle.background) {
    slideStyle.background = sectionSlideStyle.background;
  }
  else if (theme?.colors?.slideBackground) {
    slideStyle.background = theme.colors.slideBackground;
  }
  const { backgroundColor, background, ...otherSectionSlideStyles } = sectionSlideStyle;
  Object.assign(slideStyle, otherSectionSlideStyles);
  
  if (style) {
    Object.assign(slideStyle, style);
  }

  // Always prioritize section dimensions, with logical dimensions as a secondary source if explicitly provided
  const actualWidth = section?.width || logicalWidth || 960;
  const actualHeight = section?.height || logicalHeight || 540;
  
  console.log('PreviewSlide dimensions:', {
    sectionId: section?.id,
    sectionWidth: section?.width,
    sectionHeight: section?.height,
    providedLogicalWidth: logicalWidth, 
    providedLogicalHeight: logicalHeight,
    actualWidthUsed: actualWidth,
    actualHeightUsed: actualHeight
  });
  
  const finalSlideStyle: React.CSSProperties = previewMode ? {
    ...slideStyle,
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: `${actualWidth}px`,
    height: `${actualHeight}px`,
    transform: `translate(-50%, -50%) scale(${zoomLevel})`,
    transformOrigin: 'center center',
  } : {
    ...slideStyle,
    overflow: 'hidden',
    pointerEvents: 'auto',
    display: 'block',
    position: 'relative',
    transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
    transformOrigin: 'top left',
  };
  
  return (
    <div
      ref={slideRef}
      className="preview-slide-content"
      style={finalSlideStyle}
      onClick={handleSlideClick}
    >
      {componentsToRender.length > 0 &&
        componentsToRender.map((component: VisualComponent) => {
          const isSelected = !previewMode && selectedComponentIds?.has(component.id);
          return (
            <VisualComponentRenderer
              key={component.id}
              component={component}
              themeSettings={theme ? {
                primaryColor: theme.colors.primary,
                secondaryColor: theme.colors.secondary,
                accentColor: theme.colors.accent,
                backgroundColor: theme.colors.background,
                textColor: theme.colors.text,
                fontFamily: theme.fonts.body,
              } : undefined}
              previewMode={previewMode}
              onSelect={!previewMode ? onSelect : undefined}
              onUpdateLayout={!previewMode ? onUpdateLayout : undefined}
              onOpenEditor={!previewMode ? onOpenEditor : undefined}
              onDeleteComponent={!previewMode ? onDeleteComponent : undefined}
              selectedComponentIds={selectedComponentIds}
              slideZoomLevel={zoomLevel}
            />
          );
        })}

      {!previewMode && selectedComponentIds && selectedComponentIds.size > 0 && Array.from(selectedComponentIds).map(id => {
        const selectedVisualComponent = componentsToRender.find(c => c.id === id);
        if (!selectedVisualComponent) return null;

        const outlineStyle: React.CSSProperties = {
          position: 'absolute',
          left: selectedVisualComponent.layout.x - 2,
          top: selectedVisualComponent.layout.y - 2,
          width: selectedVisualComponent.layout.width + 4,
          height: selectedVisualComponent.layout.height + 4,
          border: `2px solid ${selectedComponentIds.size > 1 ? '#f59e0b' : '#3b82f6'}`,
          pointerEvents: 'none',
          zIndex: 999
        };

        return <div key={`outline-${id}`} style={outlineStyle} className="component-selection-outline" />;
      })}

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
