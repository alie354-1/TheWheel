import React from 'react';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
// useCollapsibleNavigator is not used here, consider removing if not needed by SlidePreviewPanel itself
// import { useCollapsibleNavigator } from '../hooks/useCollapsibleNavigator'; 
import * as Tooltip from '@radix-ui/react-tooltip';
import { DeckSection, VisualComponent } from '../types'; // Import DeckSection and VisualComponent

// ColorTheme might be needed for getSlideBackground if it relies on theme fallbacks
interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}


interface SlidePreviewPanelProps {
  slides: DeckSection[]; // Use DeckSection
  currentSlideId: string | null; // Allow null
  onSlideSelect: (slideId: string | null) => void; // Allow null
  onAddSlide: () => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onMoveSlide?: (slideId: string, direction: 'up' | 'down') => void; // Make optional if not always used
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  colorThemes: ColorTheme[]; // Add colorThemes to props for background fallback
}

export function SlidePreviewPanel({
  slides,
  currentSlideId,
  onSlideSelect,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlide, // Keep optional or ensure it's always provided
  collapsed,
  setCollapsed,
  colorThemes
}: SlidePreviewPanelProps) {
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);
  
  // Use a theme for fallback, assuming the first one if no specific theme context is passed
  const defaultTheme = colorThemes[0] || { background: '#ffffff', text: '#000000', border: '#cccccc' };


  const getSlideBackground = (slide: DeckSection) => {
    const themeForSlide = colorThemes.find(t => t.id === (slide as any).theme /* temp access if theme is on slide */) || defaultTheme;
    if (slide.slideStyle?.background) return slide.slideStyle.background as string;
    if (slide.slideStyle?.backgroundColor) return slide.slideStyle.backgroundColor;
    // Fallback to theme background if no specific style is set
    return themeForSlide.background;
  };

  return (
    <div
      className="h-full flex flex-col bg-gray-50 transition-all duration-200"
      style={{
        width: collapsed ? 48 : 264,
        minWidth: collapsed ? 48 : 180,
        maxWidth: collapsed ? 48 : 320,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div className="p-2 border-b border-gray-200 bg-white flex items-center justify-between">
        {collapsed ? (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setCollapsed(false)}
                className="p-1 rounded hover:bg-gray-100 transition"
                aria-label="Expand slide navigator"
              >
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="right" className="z-50 px-2 py-1 rounded bg-gray-900 text-white text-xs shadow">
                Expand slide navigator
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Slides</h2>
              <span className="text-sm text-gray-500">{slides.length} slides</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onAddSlide}
                className="px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setCollapsed(true)}
                    className="p-1 rounded hover:bg-gray-100 transition"
                    aria-label="Collapse slide navigator"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-500" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="left" className="z-50 px-2 py-1 rounded bg-gray-900 text-white text-xs shadow">
                    Collapse slide navigator
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </>
        )}
      </div>

      {/* Slides List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {sortedSlides.map((slide, index) =>
            collapsed ? (
              <Tooltip.Root key={slide.id}>
                <Tooltip.Trigger asChild>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer mb-2 border-2 transition-all ${
                      slide.id === currentSlideId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => onSlideSelect(slide.id)}
                    tabIndex={0}
                    aria-label={slide.title || `Slide ${index + 1}`}
                  >
                    <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" className="z-50 px-2 py-1 rounded bg-gray-900 text-white text-xs shadow">
                    {slide.title || `Slide ${index + 1}`}
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ) : (
              <SlidePreviewItem
                key={slide.id}
                slide={slide}
                index={index}
                isSelected={slide.id === currentSlideId}
                isFirst={index === 0}
                isLast={index === sortedSlides.length - 1}
                background={getSlideBackground(slide)}
                onSelect={() => onSlideSelect(slide.id)}
                onDelete={() => onDeleteSlide(slide.id)}
                onDuplicate={() => onDuplicateSlide(slide.id)}
                onMoveUp={() => onMoveSlide && onMoveSlide(slide.id, 'up')}
                onMoveDown={() => onMoveSlide && onMoveSlide(slide.id, 'down')}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

interface SlidePreviewItemProps {
  slide: DeckSection; // Use DeckSection
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  background: string;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SlidePreviewItem({
  slide,
  index,
  isSelected,
  isFirst,
  isLast,
  background,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}: SlidePreviewItemProps) {
  return (
    <div
      className={`group relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      {/* Slide Number */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center z-10">
        {index + 1}
      </div>

      {/* Slide Preview */}
      <div className="p-3">
        <div
          className="w-full h-20 rounded border border-gray-200 mb-2 overflow-hidden relative"
          style={{
            background: background,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Content Preview - adapt to VisualComponent structure */}
          <div className="absolute inset-2 text-xs text-gray-600 overflow-hidden">
            {(slide.components || []).slice(0, 2).map((component: VisualComponent, idx: number) => (
              <div key={idx} className="mb-1 truncate">
                {component.type === 'text' && component.data.variant === 'heading' && component.data.text && (
                  <div className="bg-gray-100 bg-opacity-80 rounded px-1 py-0.5 font-medium">
                    {(component.data.text as string).substring(0, 15)}...
                  </div>
                )}
                {component.type === 'text' && component.data.variant !== 'heading' && component.data.textContent && (
                  <div className="bg-white bg-opacity-80 rounded px-1 py-0.5">
                    {(component.data.textContent as string).substring(0, 20)}...
                  </div>
                )}
                {component.type === 'image' && (
                  <div className="bg-blue-100 bg-opacity-80 rounded px-1 py-0.5">
                    [Image: {component.data.altText || (component.data.src as string)?.substring(0,10) || 'Image'}]
                  </div>
                )}
                 {/* Add more component type previews as needed */}
              </div>
            ))}
             {(slide.components || []).length === 0 && (
              <div className="text-center text-gray-400 text-xs italic">Empty Slide</div>
            )}
          </div>
        </div>

        {/* Slide Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
            {slide.title || `Slide ${index + 1}`}
          </h3>
          
          {/* Action Buttons - shown on hover or when selected */}
          <div className={`flex items-center space-x-1 ml-2 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}>
            {/* Move Up */}
            {!isFirst && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
            )}
            
            {/* Move Down */}
            {!isLast && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            )}
            
            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Duplicate slide"
            >
              <Copy className="h-3 w-3" />
            </button>
            
            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Delete slide"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
