import React, { useEffect, useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {
  Award,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Code2,
  Edit3,
  File as FileIconLucide,
  FileCode,
  FileText,
  Flag,
  GalleryThumbnails,
  GitCompareArrows,
  Globe,
  Grid as GridIconLucide,
  Handshake,
  ImageIcon,
  Info as InfoIcon,
  Lightbulb,
  List as ListIconLucide,
  Mail,
  MapPin as MapPinIconLucide,
  MessageCircle,
  Music,
  Newspaper,
  PieChart as PieChartIconLucide,
  Quote as QuoteIconLucide,
  RefreshCcw,
  Rocket,
  Star as StarIcon,
  Table as TableIconLucide,
  TableProperties,
  Target,
  Timer as TimerIconLucide,
  Trash2,
  TrendingUp as TrendingUpIcon,
  Type,
  Users as UsersIcon,
  Zap,
} from 'lucide-react';
import { BlockType, BLOCK_REGISTRY, ChartBlock as ChartBlockType, CitationBlock as CitationBlockDataType, VisualComponentLayout } from '../types/blocks.ts';
import { CitationBlock } from './canvas/blocks/CitationBlock.tsx';
import ChartBlockComponent from '../../enhanced-idea-hub/deck-builder/components/canvas/blocks/ChartBlock.tsx';
import { VisualComponent } from '../types/index.ts';
import { ThemeSettings } from './ThemeCustomizationPanel.tsx';
import { generateUUID } from '../utils/uuid.ts';
import { ResizeHandle } from './ResizeHandle.tsx';
import { RichTextEditor } from './editors/RichTextEditor.tsx';
import { SafeTextRenderer } from './SafeTextRenderer.tsx';

type HandlePosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

interface VisualComponentRendererProps {
  component: VisualComponent;
  onSelect?: (componentId: string | null, multiSelect?: boolean) => void;
  onUpdateLayout?: (componentId: string, newLayout: Partial<VisualComponentLayout>) => void;
  onUpdateComponentData?: (componentId: string, newData: any) => void;
  onOpenEditor?: (componentId: string) => void;
  onDeleteComponent?: (componentId: string) => void;
  selectedComponentIds?: Set<string>;
  previewMode?: boolean;
  themeSettings?: Partial<ThemeSettings>;
  slideZoomLevel?: number;
}

export function VisualComponentRenderer({
  component,
  onSelect,
  onUpdateLayout,
  onUpdateComponentData,
  onOpenEditor,
  onDeleteComponent,
  selectedComponentIds,
  previewMode = false,
  themeSettings = {},
  slideZoomLevel = 1,
}: VisualComponentRendererProps): JSX.Element | null {
  const actualIsSelected = !previewMode && selectedComponentIds?.has(component.id);
  const [editingText, setEditingText] = React.useState<string | null>(null);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Component style updated:', component.style);
  }, [component.style]);

  const handleSelect = (e: React.MouseEvent) => {
    if (previewMode) return;
    e.stopPropagation();
    if (onSelect) {
      const isMultiSelect = e.metaKey || e.ctrlKey;
      onSelect(component.id, isMultiSelect);
    }
  };

  const handleDragStop = (e: DraggableEvent, draggableData: DraggableData) => {
    if (previewMode || !onUpdateLayout) return;
    if (component.layout.x !== draggableData.x || component.layout.y !== draggableData.y) {
      onUpdateLayout(component.id, { x: draggableData.x, y: draggableData.y });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: HandlePosition) => {
    if (previewMode || !onUpdateLayout) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y, width, height } = component.layout;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / slideZoomLevel;
      const dy = (moveEvent.clientY - startY) / slideZoomLevel;
      let newLayout: Partial<VisualComponentLayout> = {};

      if (direction.includes('right')) newLayout.width = Math.max(20, width + dx);
      if (direction.includes('left')) {
        newLayout.width = Math.max(20, width - dx);
        newLayout.x = x + dx;
      }
      if (direction.includes('bottom')) newLayout.height = Math.max(20, height + dy);
      if (direction.includes('top')) {
        newLayout.height = Math.max(20, height - dy);
        newLayout.y = y + dy;
      }
      onUpdateLayout(component.id, newLayout);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderComponentContent = (): JSX.Element => {
    const { data, type } = component;
    const componentStyle: React.CSSProperties = {
        fontFamily: themeSettings?.fontFamily || component.style?.fontFamily,
    };

    if (!previewMode && editingText !== null) {
      return (
        <RichTextEditor
          content={editingText}
          onChange={(newContent) => setEditingText(newContent)}
          onBlur={() => {
            if (onUpdateComponentData) {
              onUpdateComponentData(component.id, { ...data, text: editingText });
            }
            setEditingText(null);
          }}
          themeSettings={themeSettings}
        />
      );
    }

    switch (type) {
      case 'text':
        return <SafeTextRenderer html={component.data.text || ''} style={{ ...componentStyle, width: '100%', height: '100%' }} />;
      case 'image':
        return <img src={data.src} alt={data.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
      case 'quote':
        return (
          <div style={{ ...componentStyle, padding: '1rem', fontStyle: 'italic' }}>
            <p>"{data.text}"</p>
            {data.author && <footer style={{ textAlign: 'right' }}>- {data.author}</footer>}
          </div>
        );
      case 'chart':
        return <ChartBlockComponent block={component.data as ChartBlockType} />;
      case 'citation':
        return <CitationBlock {...(component.data as any)} style={component.style} isSelected={actualIsSelected} />;
      case 'list':
        const ListWrapper = component.data.ordered ? 'ol' : 'ul';
        return (
          <ListWrapper style={{ ...(component.data.listStyle || {}), ...componentStyle, paddingLeft: '20px' }}>
            {(component.data.items || []).map((item: any) => (
              <li key={item.id} style={{ ...(component.data.itemStyle || {}), ...item.style }}>
                <SafeTextRenderer html={item.text} style={componentStyle} />
              </li>
            ))}
          </ListWrapper>
        );
      case 'featureCard':
        const FeatureListWrapper = 'ul';
        return (
          <div style={componentStyle}>
            <SafeTextRenderer html={component.data.title || ''} style={componentStyle} />
            <SafeTextRenderer html={component.data.description || ''} style={componentStyle} />
            <FeatureListWrapper style={{ ...(component.data.listStyle || {}), paddingLeft: '20px' }}>
              {(component.data.features || []).map((item: any) => (
                <li key={item.id} style={{ ...(component.data.itemStyle || {}), ...item.style }}>
                  <SafeTextRenderer html={item.content || ''} style={componentStyle} />
                </li>
              ))}
            </FeatureListWrapper>
          </div>
        );
      case 'calloutBox':
        return <SafeTextRenderer html={data.text} style={componentStyle} />;
      default:
        return (
          <div className="p-2 text-xs text-gray-500">
            <p>Unsupported component type: {type}</p>
            <pre className="text-wrap">{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  const getDraggableStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      width: component.layout.width,
      height: component.layout.height,
      zIndex: component.layout.zIndex,
      cursor: previewMode ? 'default' : 'grab',
      boxSizing: 'border-box',
      ...component.style,
      fontFamily: themeSettings?.fontFamily || component.style?.fontFamily,
    };
    if (actualIsSelected && !previewMode) {
      style.border = '2px solid #3b82f6';
      style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
    } else {
      style.border = '1px solid transparent';
    }
    return style;
  };

  if (!component?.layout) return null;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      position={{ x: component.layout.x, y: component.layout.y }}
      onStop={handleDragStop}
      bounds="parent"
      disabled={previewMode}
    >
      <div
        ref={nodeRef}
        className="drag-handle group absolute"
        onClick={handleSelect}
        style={getDraggableStyle()}
        onDoubleClick={(e) => {
          if (previewMode) return;
          e.stopPropagation();
          if (component.type === 'text' && onUpdateComponentData) {
            setEditingText(component.data.text);
          } else if (onOpenEditor) {
            onOpenEditor(component.id);
          }
        }}
      >
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
          {renderComponentContent()}
        </div>
        {actualIsSelected && !previewMode && (
          <>
            <div className="absolute -top-2.5 -right-2.5 flex space-x-1 bg-white p-0.5 rounded-full shadow-md z-30">
              {onOpenEditor && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenEditor(component.id); }}
                  className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
                  title="Edit"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                </button>
              )}
              {onDeleteComponent && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteComponent(component.id); }}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                  title="Delete"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
            {(['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right'] as HandlePosition[]).map((position) => (
              <ResizeHandle
                key={position}
                position={position}
                onResizeStart={(e) => handleResizeStart(e, position)}
                visible={actualIsSelected && !previewMode}
              />
            ))}
          </>
        )}
      </div>
    </Draggable>
  );
}
