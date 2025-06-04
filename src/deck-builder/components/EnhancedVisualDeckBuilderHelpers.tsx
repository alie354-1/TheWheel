import React, { useState, Suspense, lazy, ChangeEvent, useEffect, useCallback, useRef } from 'react';
import { DeckSection, VisualComponent } from '../types/index.ts';
import { BLOCK_REGISTRY, BlockType, EditableProp } from '../types/blocks.ts';
import { Settings, Eye, ChevronLeft, ChevronRight, icons, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconSelector } from './IconSelector.tsx';

const getLucideIcon = (name?: string): LucideIcon | null => {
  if (!name) return null;
  const iconKey = name.replace(/-/g, '');
  const IconComponent = (icons as Record<string, LucideIcon>)[iconKey];
  return IconComponent || null;
};

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted?: string; 
  border: string;
}

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: { from: string; to: string; direction: string };
  image?: string;
}

export function convertCssToSlideBackground(cssStyle: React.CSSProperties | undefined, theme: ColorTheme): SlideBackground {
  if (!cssStyle) return { type: 'solid', color: theme.background };
  
  const backgroundValue = cssStyle.background;
  if (typeof backgroundValue === 'string') {
    if (backgroundValue.startsWith('url(')) {
      return { type: 'image', image: backgroundValue.replace(/url\(['"]?(.*?)['"]?\)/, '$1') };
    }
    if (backgroundValue.startsWith('linear-gradient')) {
      const parts = backgroundValue.match(/linear-gradient\((.+?), (.+?), (.+?)\)/);
      if (parts && parts.length === 4) {
        return { type: 'gradient', gradient: { direction: parts[1].trim(), from: parts[2].trim(), to: parts[3].trim() } };
      }
    }
  }
  
  let colorValue: string | undefined = theme.background; 
  if (typeof cssStyle.backgroundColor === 'string') {
    colorValue = cssStyle.backgroundColor;
  } else if (typeof backgroundValue === 'string' && 
             !backgroundValue.startsWith('url(') && 
             !backgroundValue.startsWith('linear-gradient') &&
             !backgroundValue.includes(' ') 
            ) {
    colorValue = backgroundValue;
  }
  return { type: 'solid', color: colorValue };
}

export function convertSlideBackgroundToCss(slideBg: SlideBackground | undefined): React.CSSProperties {
  if (!slideBg) return {};
  switch (slideBg.type) {
    case 'solid':
      return { backgroundColor: slideBg.color };
    case 'gradient':
      if (slideBg.gradient) {
        return { background: `linear-gradient(${slideBg.gradient.direction}, ${slideBg.gradient.from}, ${slideBg.gradient.to})` };
      }
      return {};
    case 'image':
      return { background: `url('${slideBg.image}') center/cover no-repeat` };
    default:
      return {};
  }
}

export function getSlideBackground(slideStyle: DeckSection['slideStyle'] | undefined, theme: ColorTheme): string {
  if (slideStyle?.background && typeof slideStyle.background === 'string') return slideStyle.background;
  if (slideStyle?.backgroundColor && typeof slideStyle.backgroundColor === 'string') return slideStyle.backgroundColor;
  return theme.background;
}

export interface EnhancedSlideCanvasProps {
  slide: DeckSection | undefined; 
  selectedComponentId: string | null;
  onComponentSelect: (id: string) => void;
  onComponentUpdate: (id: string, updates: Partial<VisualComponent>) => void; 
  onComponentDelete: (id: string) => void;
  theme: ColorTheme;
  deckLogo: string | null;
  previewMode?: boolean;
}

export function EnhancedSlideCanvas({ slide, selectedComponentId, onComponentSelect, onComponentUpdate, onComponentDelete, theme, deckLogo, previewMode = false }: EnhancedSlideCanvasProps) {
  if (!slide) return null;
  const slideWidth = 1000; // Example: replace with actual slide width
  const slideHeight = 700; // Example: replace with actual slide height

  return (
    <div className="h-full relative">
      {deckLogo && (<div className="absolute top-4 right-4 z-10"><img src={deckLogo} alt="Logo" className="h-12 w-auto object-contain opacity-80" /></div>)}
      {slide.components.length === 0 ? (<div className="h-full flex items-center justify-center text-gray-500"><div className="text-center"><div className="text-4xl mb-4">📄</div><p className="text-lg font-medium mb-2">Empty Slide</p><p className="text-sm">Add components from the library to get started</p></div></div>) : (slide.components.map((component: VisualComponent) => {
        const isActuallySelected = !previewMode && component.id === selectedComponentId;
        return (<EnhancedDraggableComponent 
                  key={component.id} 
                  component={component} 
                  isSelected={isActuallySelected} 
                  onSelect={() => onComponentSelect(component.id)} 
                  onUpdate={(updates) => onComponentUpdate(component.id, updates)} 
                  onDelete={() => onComponentDelete(component.id)} 
                  theme={theme} 
                  previewMode={previewMode}
                  containerWidth={slideWidth} // Pass container dimensions
                  containerHeight={slideHeight}
                />);
      }))}
    </div>
  );
}

interface EnhancedDraggableComponentProps {
  component: VisualComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<VisualComponent>) => void;
  onDelete: () => void;
  theme: ColorTheme;
  previewMode?: boolean;
  containerWidth?: number;
  containerHeight?: number;
}

const DEFAULT_COLOR_THEME: ColorTheme = {
  id: 'default-fallback-theme',
  name: 'Default Fallback Theme',
  primary: '#4A90E2',
  secondary: '#7B8A8B',
  accent: '#F5A623',
  background: '#FFFFFF',
  text: '#333333',
  textMuted: '#777777',
  border: '#DDDDDD',
};

export function EnhancedDraggableComponent({ component, isSelected, onSelect, onUpdate, onDelete, theme, previewMode = false, containerWidth, containerHeight }: EnhancedDraggableComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const activeTheme = { 
    ...DEFAULT_COLOR_THEME, 
    ...(theme || {}),
    primary: theme?.primary || DEFAULT_COLOR_THEME.primary,
    secondary: theme?.secondary || DEFAULT_COLOR_THEME.secondary,
    accent: theme?.accent || DEFAULT_COLOR_THEME.accent,
    background: theme?.background || DEFAULT_COLOR_THEME.background,
    text: theme?.text || DEFAULT_COLOR_THEME.text,
    border: theme?.border || DEFAULT_COLOR_THEME.border,
    textMuted: theme?.textMuted || DEFAULT_COLOR_THEME.textMuted,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (previewMode || e.target !== e.currentTarget) return;
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    const startX = e.clientX - component.layout.x;
    const startY = e.clientY - component.layout.y;
    const handleMouseMove = (e_move: MouseEvent) => {
      let newX = e_move.clientX - startX;
      let newY = e_move.clientY - startY;

      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      if (containerWidth !== undefined) {
        newX = Math.min(newX, containerWidth - component.layout.width);
      }
      if (containerHeight !== undefined) {
        newY = Math.min(newY, containerHeight - component.layout.height);
      }
      newX = Math.max(0, newX); // Re-clamp after potentially being pushed by right/bottom boundary
      newY = Math.max(0, newY);

      onUpdate({ layout: { ...component.layout, x: newX, y: newY } });
    };
    const handleMouseUp = () => { setIsDragging(false); document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const layoutStyles: React.CSSProperties = {
    position: 'absolute',
    left: component.layout.x,
    top: component.layout.y,
    width: component.layout.width,
    height: component.layout.height,
    zIndex: component.layout.zIndex,
    overflow: 'hidden', 
  };

  const appearanceStyles: React.CSSProperties = {
    backgroundColor: component.style?.backgroundColor || 'transparent',
    color: component.style?.color || activeTheme.text,
    borderColor: component.style?.borderColor || activeTheme.border,
    borderWidth: component.style?.borderWidth || (component.style?.borderColor ? '1px' : '0px'),
    borderStyle: component.style?.borderStyle || (component.style?.borderColor ? 'solid' : 'none'),
    borderRadius: component.style?.borderRadius,
    opacity: component.style?.opacity,
    boxShadow: component.style?.boxShadow || 'none',
  };
  
  const combinedStyles: React.CSSProperties = {
    ...layoutStyles,
    ...appearanceStyles,
  };

  const getComponentClasses = () => {
    if (previewMode) {
      return 'cursor-default'; 
    }
    let classes = 'transition-all cursor-move z-10'; 
    if (isSelected) {
      classes += ' ring-2 ring-blue-500 ring-opacity-50';
    } else {
      classes += ' hover:ring-1 hover:ring-gray-300';
    }
    if (isDragging) {
      classes += ' opacity-75 z-50'; 
    }
    return classes;
  };

  return (
    <div 
      className={getComponentClasses()}
      style={combinedStyles}
      onMouseDown={handleMouseDown} 
      onClick={(e) => { 
        if (!previewMode && e.target === e.currentTarget) { 
          onSelect();
        }
      }}
    >
      <div className="w-full h-full"> 
        <EnhancedComponentRenderer 
          component={component} 
          theme={activeTheme} 
          onLayoutUpdateRequest={(layoutUpdate) => {
            // The autoHeight logic was here, now commented out in EnhancedComponentRenderer
            // if (component.style?.autoHeight && layoutUpdate.height && layoutUpdate.height !== component.layout.height) {
            //   onUpdate({ layout: { ...component.layout, height: layoutUpdate.height } });
            // }
          }}
        />
      </div>
      {!previewMode && ( 
        <div style={{ display: isSelected ? 'block' : 'none' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 z-20 flex items-center justify-center"
          >
            ×
          </button>
          {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(handleName => (
            <div 
              key={handleName} 
              className={`absolute bg-blue-500 border border-white rounded-full w-3 h-3 transform ${handleName.includes('n') ? '-top-1.5' : ''} ${handleName.includes('s') ? '-bottom-1.5' : ''} ${handleName.includes('w') ? '-left-1.5' : ''} ${handleName.includes('e') ? '-right-1.5' : ''} ${handleName === 'n' || handleName === 's' ? 'left-1/2 -translate-x-1/2' : ''} ${handleName === 'w' || handleName === 'e' ? 'top-1/2 -translate-y-1/2' : ''} cursor-${handleName}-resize`}
              style={{ zIndex: 9999 }} 
              onMouseDown={(e_resize_down) => {
                if (previewMode) return; 
                e_resize_down.stopPropagation(); 
                const initialX = e_resize_down.clientX; 
                const initialY = e_resize_down.clientY;
              const initialWidth = component.layout.width;
              const initialHeight = component.layout.height;
              const initialCompX = component.layout.x;
              const initialCompY = component.layout.y;
              const aspectRatio = initialWidth / initialHeight;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - initialX;
                const dy = moveEvent.clientY - initialY;
                let newWidth = initialWidth;
                let newHeight = initialHeight;
                let newX = initialCompX;
                let newY = initialCompY;
                const shiftPressed = moveEvent.shiftKey;

                if (handleName.includes('e')) {
                  newWidth = Math.max(50, initialWidth + dx);
                  if (shiftPressed) {
                    newHeight = Math.max(50, newWidth / aspectRatio);
                    if (newHeight < 50) { newHeight = 50; newWidth = Math.max(50, newHeight * aspectRatio); }
                  }
                }
                if (handleName.includes('w')) {
                  newWidth = Math.max(50, initialWidth - dx);
                  if (newWidth > 50) newX = initialCompX + dx; else newX = initialCompX + (initialWidth - 50);
                  if (shiftPressed) {
                    newHeight = Math.max(50, newWidth / aspectRatio);
                     if (newHeight < 50) { newHeight = 50; newWidth = Math.max(50, newHeight * aspectRatio);
                        if (newWidth > 50) newX = initialCompX + (initialWidth - newWidth); else newX = initialCompX + (initialWidth - 50); }
                  }
                }
                if (handleName.includes('s')) {
                  newHeight = Math.max(50, initialHeight + dy);
                  if (shiftPressed) {
                    newWidth = Math.max(50, newHeight * aspectRatio);
                    if (newWidth < 50) { newWidth = 50; newHeight = Math.max(50, newWidth / aspectRatio); }
                  }
                }
                if (handleName.includes('n')) {
                  newHeight = Math.max(50, initialHeight - dy);
                  if (newHeight > 50) newY = initialCompY + dy; else newY = initialCompY + (initialHeight - 50);
                  if (shiftPressed) {
                    newWidth = Math.max(50, newHeight * aspectRatio);
                    if (newWidth < 50) { newWidth = 50; newHeight = Math.max(50, newWidth / aspectRatio);
                        if (newHeight > 50) newY = initialCompY + (initialHeight - newHeight); else newY = initialCompY + (initialHeight - 50); }
                  }
                }

                if (shiftPressed) {
                  if (handleName === 'se') {
                    const widthChange = initialWidth + dx; const heightChange = initialHeight + dy;
                    if (widthChange / aspectRatio > heightChange) { newWidth = Math.max(50, widthChange); newHeight = Math.max(50, newWidth / aspectRatio);
                    } else { newHeight = Math.max(50, heightChange); newWidth = Math.max(50, newHeight * aspectRatio); }
                  } else if (handleName === 'sw') {
                    const widthChange = initialWidth - dx; const heightChange = initialHeight + dy;
                     if (widthChange / aspectRatio > heightChange) { newWidth = Math.max(50, widthChange); newHeight = Math.max(50, newWidth / aspectRatio);
                    } else { newHeight = Math.max(50, heightChange); newWidth = Math.max(50, newHeight * aspectRatio); }
                    if (newWidth > 50) newX = initialCompX + (initialWidth - newWidth); else newX = initialCompX + (initialWidth - 50);
                  } else if (handleName === 'ne') {
                    const widthChange = initialWidth + dx; const heightChange = initialHeight - dy;
                    if (widthChange / aspectRatio > heightChange) { newWidth = Math.max(50, widthChange); newHeight = Math.max(50, newWidth / aspectRatio);
                    } else { newHeight = Math.max(50, heightChange); newWidth = Math.max(50, newHeight * aspectRatio); }
                    if (newHeight > 50) newY = initialCompY + (initialHeight - newHeight); else newY = initialCompY + (initialHeight - 50);
                  } else if (handleName === 'nw') {
                    const widthChange = initialWidth - dx; const heightChange = initialHeight - dy;
                    if (widthChange / aspectRatio > heightChange) { newWidth = Math.max(50, widthChange); newHeight = Math.max(50, newWidth / aspectRatio);
                    } else { newHeight = Math.max(50, heightChange); newWidth = Math.max(50, newHeight * aspectRatio); }
                    if (newWidth > 50) newX = initialCompX + (initialWidth - newWidth); else newX = initialCompX + (initialWidth - 50);
                    if (newHeight > 50) newY = initialCompY + (initialHeight - newHeight); else newY = initialCompY + (initialHeight - 50);
                  }
                }
                
                // Boundary checks
                if (containerWidth !== undefined) {
                  if (newX < 0) { newWidth += newX; newX = 0; } // Shrink width if X is negative
                  if (newX + newWidth > containerWidth) { newWidth = containerWidth - newX; }
                }
                if (containerHeight !== undefined) {
                  if (newY < 0) { newHeight += newY; newY = 0; } // Shrink height if Y is negative
                  if (newY + newHeight > containerHeight) { newHeight = containerHeight - newY; }
                }

                newWidth = Math.max(50, newWidth);
                newHeight = Math.max(50, newHeight);
                newX = Math.max(0, newX); // Ensure X is not negative after width adjustment
                newY = Math.max(0, newY); // Ensure Y is not negative after height adjustment

                // Re-apply aspect ratio if shift was pressed and boundaries/min-size broke it
                if (shiftPressed) {
                    const currentAR = newWidth / newHeight;
                    if (Math.abs(currentAR - aspectRatio) > 0.01) { // If aspect ratio is off
                        // Attempt to preserve the dimension that was likely driving the resize or less affected by clamp
                        if (handleName.includes('e') || handleName.includes('w')) { // Width was likely driver
                            newHeight = Math.max(50, newWidth / aspectRatio);
                            if (newHeight < 50) { newHeight = 50; newWidth = Math.max(50, newHeight * aspectRatio); }
                        } else if (handleName.includes('s') || handleName.includes('n')) { // Height was likely driver
                            newWidth = Math.max(50, newHeight * aspectRatio);
                            if (newWidth < 50) { newWidth = 50; newHeight = Math.max(50, newWidth / aspectRatio); }
                        } else { // Diagonal, prioritize width then height
                           newHeight = Math.max(50, newWidth / aspectRatio);
                           if (newHeight < 50) { newHeight = 50; newWidth = Math.max(50, newHeight * aspectRatio); }
                        }
                    }
                }
                
                // Final position adjustment for W/N handles after all size changes
                if (handleName.includes('w')) newX = initialCompX + (initialWidth - newWidth);
                if (handleName.includes('n')) newY = initialCompY + (initialHeight - newHeight);

                // Final clamping of position and size
                newX = Math.max(0, newX);
                newY = Math.max(0, newY);
                if (containerWidth !== undefined) {
                    newWidth = Math.min(newWidth, containerWidth - newX);
                    newX = Math.min(newX, containerWidth - newWidth); // Re-clamp X if width was reduced
                }
                 if (containerHeight !== undefined) {
                    newHeight = Math.min(newHeight, containerHeight - newY);
                    newY = Math.min(newY, containerHeight - newHeight); // Re-clamp Y if height was reduced
                }
                newX = Math.max(0, newX); 
                newY = Math.max(0, newY);
                newWidth = Math.max(50, newWidth);
                newHeight = Math.max(50, newHeight);


                onUpdate({ layout: { x: newX, y: newY, width: newWidth, height: newHeight, zIndex: component.layout.zIndex } });
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); 
              };
              document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        ))}
      </div>
      )} 
    </div>
  );
}

interface EnhancedComponentRendererProps {
  component: VisualComponent;
  theme: ColorTheme;
  onLayoutUpdateRequest?: (layoutUpdate: Partial<VisualComponent['layout']>) => void;
}

function EnhancedComponentRenderer({ component, theme, onLayoutUpdateRequest }: EnhancedComponentRendererProps) {
  const { type, data } = component;
  const blockType = type as BlockType;
  
  // Create a mutable copy of component.style to safely delete custom properties
  const styleCopy = { ...component.style };
  delete (styleCopy as any).autoHeight;
  delete (styleCopy as any).cardBackgroundColor;
  delete (styleCopy as any).iconColor;
  delete (styleCopy as any).valueColor;
  delete (styleCopy as any).labelColor;
  delete (styleCopy as any).descriptionColor;
  // Add any other known custom flags here to ensure they are stripped

  const componentAppearanceStyles = filterLayoutStyleProps(styleCopy); // Pass the cleaned copy
  const textBlockRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (blockType === 'text' && (component.style as any)?.autoHeight && textBlockRef.current && onLayoutUpdateRequest) {
  //     const currentHeight = component.layout.height;
  //     // Ensure padding is accounted for if box-sizing is border-box (p-2 means 0.5rem * 2 = 1rem total vertical padding)
  //     const paddingOffset = (textBlockRef.current.offsetHeight - textBlockRef.current.clientHeight); // approx padding
  //     const scrollHeight = textBlockRef.current.scrollHeight + paddingOffset;

  //     if (Math.abs(scrollHeight - currentHeight) > 2) { 
  //       onLayoutUpdateRequest({ height: scrollHeight });
  //     }
  //   }
  // }, [component.data.text, component.layout.width, (component.style as any)?.autoHeight, blockType, onLayoutUpdateRequest, component.layout.height]);


  switch (blockType) {
    case 'text': {
      let fontSize = component.style?.fontSize || '1rem'; 
      let fontWeight = component.style?.fontWeight || 'normal';
      const textAlign = component.style?.textAlign || 'left';

      if (data.variant === 'heading') {
        fontSize = component.style?.fontSize || '2em'; 
        fontWeight = component.style?.fontWeight || 'bold';
      } else if (data.variant === 'subheading') {
        fontSize = component.style?.fontSize || '1.5em'; 
        fontWeight = component.style?.fontWeight || '600';
      }
      
      const textStyles: React.CSSProperties = {
        ...componentAppearanceStyles,
        boxSizing: 'border-box',    
        color: component.style?.color || theme.text, 
        fontSize: fontSize,         
        fontWeight: fontWeight,     
        textAlign: textAlign as ('left' | 'right' | 'center' | 'justify' | 'inherit'),
        lineHeight: component.style?.lineHeight || 'normal',
        wordBreak: 'break-word',
        overflowY: 'auto', 
      };

      return (
        <div 
          ref={textBlockRef}
          className={`w-full p-2 text-left h-full`} 
          style={textStyles}
          dangerouslySetInnerHTML={{ __html: data.text || "Sample Text (data.text was empty)" }}
        />
      );
    }
    case 'chart': {
      const finalStyles: React.CSSProperties = {
        ...componentAppearanceStyles,
        boxSizing: 'border-box',
        color: componentAppearanceStyles.color || theme.text,
      };
      return (
        <div className="w-full h-full p-2" style={finalStyles}>
          <h3 className="text-sm font-bold mb-2" style={{color: finalStyles.color}}>{data.title || 'Chart'}</h3>
          <div className="h-20 bg-opacity-20 rounded flex items-end justify-around p-2" style={{ backgroundColor: theme.primary }}>
            {[8, 12, 16, 10].map((h, i) => (<div key={i} className="w-4 rounded-t" style={{ backgroundColor: theme.primary, height: `${h * 4}px` }}/>))}
          </div>
        </div>
      );
    }
    case 'quote': {
      const finalStyles: React.CSSProperties = {
        ...componentAppearanceStyles,
        boxSizing: 'border-box',
        color: componentAppearanceStyles.color || theme.text,
      };
      return (
        <div className="w-full h-full flex flex-col justify-center p-4" style={finalStyles}>
          <blockquote className="text-sm italic mb-2">"{data.quote || 'Sample quote text'}"</blockquote>
          <cite className="text-xs">- {data.author || 'Author'}, {data.company || 'Company'}</cite>
        </div>
      );
    }
    case 'statsDisplay': {
      const stats = data.stats || [];
      const gridCols = data.columns || Math.min(stats.length, 3) || 1; 
      const finalStyles: React.CSSProperties = {
        ...componentAppearanceStyles,
        boxSizing: 'border-box',
      };
      return (
        <div className="w-full h-full p-2 flex flex-col" style={finalStyles}>
          {data.title && <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: component.style?.color || theme.text }}>{data.title}</h3>}
          <div className={`grid gap-4 flex-1 items-center w-full`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`}}>
            {stats.map((stat: any, index: number) => {
              const IconComponent = getLucideIcon(stat.icon);
              return (
                <div key={index} className="text-center p-2 rounded-md" style={{ backgroundColor: (component.style as any)?.cardBackgroundColor || 'transparent' }}>
                  {IconComponent && (
                    <Suspense fallback={<div className="h-6 w-6 mx-auto mb-1 bg-gray-200 rounded"></div>}>
                      <IconComponent 
                        className="h-6 w-6 mx-auto mb-1" 
                        style={{ color: stat.color || (component.style as any)?.iconColor || theme.accent }} 
                      />
                    </Suspense>
                  )}
                  <div className="text-xl font-bold" style={{ color: stat.color || (component.style as any)?.valueColor || theme.primary }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: (component.style as any)?.labelColor || theme.text }}>
                    {stat.label}
                  </div>
                  {stat.description && <p className="text-xs mt-1 text-gray-500" style={{color: (component.style as any)?.descriptionColor || theme.textMuted || theme.text}}>{stat.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case 'heroImage':
    case 'image': 
    case 'customImage':
    case 'imageWithCaption': {
      const finalStyles: React.CSSProperties = {
        ...componentAppearanceStyles,
        boxSizing: 'border-box',
      };
      return (
        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center overflow-hidden" style={finalStyles}>
          {data.src ? (
            <img src={data.src} alt={data.alt || data.caption || 'Image'} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs" style={{color: componentAppearanceStyles.color || theme.text}}>{data.caption || 'Image'}</div>
            </div>
          )}
        </div>
      );
    }
    default: {
      const finalStyles: React.CSSProperties = {
        ...componentAppearanceStyles,
        boxSizing: 'border-box',
        color: componentAppearanceStyles.color || theme.text,
      };
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500 p-2" style={finalStyles}>
          <div className="text-center">
            <div className="text-lg mb-1">📄</div>
            <div className="text-xs">{type}</div>
          </div>
        </div>
      );
    }
  }
}

const filterLayoutStyleProps = (style: React.CSSProperties | undefined): React.CSSProperties => {
  if (!style) return {};
  const {
    position, left, top, right, bottom, width, height, minWidth, maxWidth, minHeight, maxHeight,
    margin, marginTop, marginRight, marginBottom, marginLeft,
    flex, flexGrow, flexShrink, flexBasis,
    grid, gridArea, gridColumn, gridRow, 
    alignSelf, justifySelf, order,
    float, clear,
    transform, transformOrigin,
    // Explicitly destructure custom flags to remove them from appearanceProps
    autoHeight, 
    cardBackgroundColor, 
    iconColor, 
    valueColor, 
    labelColor, 
    descriptionColor,
    ...appearanceProps 
  } = style as any; 
  return appearanceProps;
};

interface EnhancedPropertiesPanelProps {
  selectedComponent: VisualComponent | undefined;
  onComponentUpdate: (updates: Partial<VisualComponent>) => void;
  theme: ColorTheme;
  onOpenEditorModal?: (component: VisualComponent) => void; 
}

export function EnhancedPropertiesPanel({ selectedComponent, onComponentUpdate, theme, onOpenEditorModal }: EnhancedPropertiesPanelProps) {
  if (!selectedComponent) {
    return (<div className="h-full flex flex-col"><div className="p-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900 flex items-center"><Settings className="h-5 w-5 mr-2" />Properties</h2></div><div className="flex-1 flex items-center justify-center text-gray-500"><div className="text-center"><div className="text-3xl mb-2">⚙️</div><p className="text-sm">Select a component to edit its properties</p></div></div></div>);
  }
  const blockType = selectedComponent.type as BlockType;
  const blockMeta = BLOCK_REGISTRY[blockType];

  const handleStatItemChange = (statIndex: number, field: string, value: any) => {
    const currentStats = selectedComponent.data.stats || [];
    const newStats = currentStats.map((stat: any, index: number) => 
      index === statIndex ? { ...stat, [field]: value } : stat
    );
    onComponentUpdate({ data: { ...selectedComponent.data, stats: newStats } });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900 flex items-center"><Settings className="h-5 w-5 mr-2" />Properties</h2><p className="text-sm text-gray-600 mt-1 capitalize">{selectedComponent.type.replace('-', ' ')}</p></div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Position</label><div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">X</label><input type="number" value={selectedComponent.layout.x} onChange={(e) => onComponentUpdate({ layout: { ...selectedComponent.layout, x: parseInt(e.target.value) || 0 } })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/></div><div><label className="text-xs text-gray-500">Y</label><input type="number" value={selectedComponent.layout.y} onChange={(e) => onComponentUpdate({ layout: { ...selectedComponent.layout, y: parseInt(e.target.value) || 0 } })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/></div></div></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Size</label><div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">Width</label><input type="number" value={selectedComponent.layout.width} onChange={(e) => onComponentUpdate({ layout: { ...selectedComponent.layout, width: parseInt(e.target.value) || 100 } })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/></div><div><label className="text-xs text-gray-500">Height</label><input type="number" value={selectedComponent.layout.height} onChange={(e) => onComponentUpdate({ layout: { ...selectedComponent.layout, height: parseInt(e.target.value) || 100 } })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/></div></div></div>
        
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Styling</label><div className="space-y-3"><div><label className="text-xs text-gray-500">Background Color</label><input type="color" value={selectedComponent.style?.backgroundColor || '#ffffff'} onChange={(e) => onComponentUpdate({ style: { ...selectedComponent.style, backgroundColor: e.target.value } })} className="w-full h-8 border border-gray-300 rounded"/></div><div><label className="text-xs text-gray-500">Text Color</label><input type="color" value={(selectedComponent.style?.color as string) || theme.text} onChange={(e) => onComponentUpdate({ style: { ...(selectedComponent.style || {}), color: e.target.value } })} className="w-full h-8 border border-gray-300 rounded"/></div><div><label className="text-xs text-gray-500">Opacity</label><input type="range" min="0" max="1" step="0.1" value={selectedComponent.style?.opacity ?? 1} onChange={(e) => onComponentUpdate({ style: { ...(selectedComponent.style || {}), opacity: parseFloat(e.target.value) } })} className="w-full"/></div><div className="flex items-center"><input type="checkbox" checked={!!selectedComponent.style?.boxShadow && selectedComponent.style.boxShadow !== 'none'} onChange={(e) => onComponentUpdate({ style: { ...(selectedComponent.style || {}), boxShadow: e.target.checked ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none' } })} className="mr-2"/><label className="text-xs text-gray-500">Drop Shadow</label></div></div></div>

        {onOpenEditorModal && selectedComponent && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onOpenEditorModal(selectedComponent)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Open Full Editor
            </button>
          </div>
        )}

        {blockMeta?.editableProps?.map((prop: EditableProp) => {
          if (prop.type === 'object_array' && prop.name === 'stats' && blockType === 'statsDisplay') {
            const stats = selectedComponent.data.stats || [];
            return (
              <div key={prop.name} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{prop.label}</label>
                {stats.map((statItem: any, statIndex: number) => (
                  <div key={statIndex} className="p-3 border border-gray-200 rounded-md space-y-2">
                    <h4 className="text-xs font-semibold text-gray-600">Stat Item {statIndex + 1}</h4>
                    {prop.itemSchema?.map((itemProp: EditableProp) => (
                      <div key={itemProp.name}>
                        <label className="block text-xs text-gray-500 mb-1">{itemProp.label}</label>
                        {itemProp.name === 'icon' ? (
                          <IconSelector
                            value={statItem[itemProp.name]}
                            onChange={(iconName: string | undefined) => handleStatItemChange(statIndex, itemProp.name, iconName)}
                          />
                        ) : itemProp.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={statItem[itemProp.name] || ''}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleStatItemChange(statIndex, itemProp.name, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : itemProp.type === 'color' ? (
                           <input type="color" value={statItem[itemProp.name] || '#000000'} onChange={(e) => handleStatItemChange(statIndex, itemProp.name, e.target.value)} className="w-full h-8 border border-gray-300 rounded"/>
                        ) : itemProp.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={statItem[itemProp.name] || false}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleStatItemChange(statIndex, itemProp.name, e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        ) : ( 
                          <input
                            type={itemProp.type === 'number' ? 'number' : 'text'}
                            value={statItem[itemProp.name] || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleStatItemChange(statIndex, itemProp.name, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        )}
                      </div>
                    ))}
                     <button 
                        onClick={() => {
                            const currentStatsArray = Array.isArray(selectedComponent.data.stats) ? selectedComponent.data.stats : [];
                            const newStats = currentStatsArray.filter((_:any, i:number) => i !== statIndex);
                            onComponentUpdate({ data: { ...selectedComponent.data, stats: newStats } });
                        }}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                        Remove Stat
                    </button>
                  </div>
                ))}
                <button 
                    onClick={() => {
                        const currentStatsArray = Array.isArray(selectedComponent.data.stats) ? selectedComponent.data.stats : [];
                        const newStatItem = prop.itemSchema?.reduce((acc: any, p: EditableProp) => {
                            acc[p.name] = p.type === 'number' ? 0 : p.type === 'checkbox' ? false : (p.name === 'icon' ? undefined : ''); 
                            return acc;
                        }, {} as any); 
                        if (newStatItem) {
                           onComponentUpdate({ data: { ...selectedComponent.data, stats: [...currentStatsArray, newStatItem] } });
                        }
                    }}
                    className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add Stat Item
                </button>
              </div>
            );
          } else if (prop.type !== 'object_array') { 
             if (prop.type === 'textarea') {
               return (
                 <div key={prop.name}>
                   <label className="block text-sm font-medium text-gray-700 mb-1">{prop.label}</label>
                   <textarea
                     rows={3}
                     value={(selectedComponent.data as any)[prop.name] || ''}
                     onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onComponentUpdate({ data: { ...selectedComponent.data, [prop.name]: e.target.value } })}
                     className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                   />
                 </div>
               );
             }
             
             let inputType: string = prop.type;
             if (prop.type === 'json' || prop.type === 'string_array' || prop.type === 'competitive_positioning' || prop.type === 'market_segments' || prop.type === 'skill_matrix' || prop.type === 'competitor_features' || prop.type === 'chart_data') {
                inputType = 'text'; 
             }

             if (prop.name === 'icon' || prop.name === 'iconName' || (prop.label && prop.label.toLowerCase().includes('icon'))) {
                return (
                  <div key={prop.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{prop.label}</label>
                    <IconSelector
                        value={(selectedComponent.data as any)[prop.name]}
                        onChange={(iconName: string | undefined) => onComponentUpdate({ data: { ...selectedComponent.data, [prop.name]: iconName }})}
                    />
                  </div>
                );
             }
             
             return (
              <div key={prop.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{prop.label}</label>
                <input
                  type={inputType}
                  value={(selectedComponent.data as any)[prop.name] || (prop.type === 'checkbox' ? false : '')}
                  checked={prop.type === 'checkbox' ? (selectedComponent.data as any)[prop.name] || false : undefined}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = prop.type === 'checkbox' ? e.target.checked : e.target.value;
                    onComponentUpdate({ data: { ...selectedComponent.data, [prop.name]: value } });
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            );
          }
          return null; 
        })}
      </div>
    </div>
  );
}
