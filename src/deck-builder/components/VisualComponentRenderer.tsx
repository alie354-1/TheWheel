import React from 'react';
import Draggable, { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import {
  Type,
  Image as ImageIcon,
  BarChart3,
  Quote as QuoteIconLucide,
  List as ListIconLucide,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Calendar,
  Edit3,
  Trash2,
  Code2,
  File as FileIconLucide,
  Grid as GridIconLucide,
  Briefcase,
  MessageCircle,
  PieChart as PieChartIconLucide, 
  Flag,
  DollarSign,
  MapPin as MapPinIconLucide,
  RefreshCcw,
  Table as TableIconLucide,
  Timer as TimerIconLucide,
  Music,
  Globe,
  Presentation,
  GalleryHorizontal,
  Star as StarIcon,
  Award,
  BookText,
  Zap,
  Lightbulb,
  MousePointerSquare,
  Square,
  CheckSquare,
  Minus,
  FileText,
  BarChartHorizontalBig,
  FileCode,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon,
  CalendarDays,
  TableProperties,
  GalleryThumbnails,
  DollarSign as DollarSignIcon,
  ImagePlus,
  Gauge,
  BadgeCheck,
  Rocket,
  GitCompareArrows,
  CheckCircle2,
  Target,
  UserCheck,
  UserPlus,
  ListChecks,
  Newspaper,
  Handshake,
  Mail,
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon,
  AlertOctagon as AlertOctagonIcon
} from 'lucide-react';
import { BlockType, BLOCK_REGISTRY, CalloutBoxBlock, CitationBlock as CitationBlockDataType, ChartBlock as ChartBlockType, VisualComponentLayout } from '../types/blocks.ts';
import { CitationBlock } from './canvas/blocks/CitationBlock.tsx';
import ChartBlockComponent from '../../enhanced-idea-hub/deck-builder/components/canvas/blocks/ChartBlock.tsx';
import { VisualComponent } from '../types/index.ts';
import { ThemeSettings } from './ThemeCustomizationPanel.tsx';
import { generateUUID } from '../utils/uuid.ts';
import { ResizeHandle } from './ResizeHandle.tsx'; // Corrected import

// Define HandlePosition to match ResizeHandle.tsx and internal logic
type HandlePosition = 
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

interface VisualComponentRendererProps {
  component: VisualComponent;
  isSelected?: boolean; 
  onEdit?: (component: VisualComponent) => void; 
  onDelete?: (componentId: string) => void; 
  onSelect?: (componentId: string | null) => void;
  onUpdate?: (componentId: string, data: Partial<VisualComponent> | { layout: Partial<VisualComponentLayout> }) => void; 
  onUpdateLayout?: (componentId: string, newLayout: Partial<VisualComponentLayout>) => void;
  onUpdateComponentData?: (componentId: string, newData: any) => void;
  onOpenEditor?: (componentId: string) => void;
  onDeleteComponent?: (componentId: string) => void;
  selectedComponentId?: string | null;
  previewMode?: boolean;
  themeSettings?: Partial<ThemeSettings>;
  slideZoomLevel?: number;
}

export function VisualComponentRenderer({
  component,
  onEdit, 
  onDelete,
  onSelect,
  onUpdate,
  onUpdateLayout,
  onUpdateComponentData,
  onOpenEditor,
  onDeleteComponent,
  selectedComponentId,
  previewMode = false,
  themeSettings = {},
  slideZoomLevel = 1,
}: VisualComponentRendererProps): JSX.Element | null {
  const actualIsSelected = !previewMode && selectedComponentId === component.id;
  console.log('[VisualComponentRenderer] Props received:', { component, selectedComponentId, isSelected: actualIsSelected, themeSettings });
  console.log('[VisualComponentRenderer] Component style:', component.style);

  const [editingText, setEditingText] = React.useState<string | null>(null);

  const nodeRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = (e: React.MouseEvent) => {
    if (previewMode) return;
    
    e.stopPropagation();
    
    console.log('Component select event:', {
      componentId: component.id,
      target: e.target,
      currentTarget: e.currentTarget,
      nativeEvent: e.nativeEvent
    });
    
    if (onSelect) {
      onSelect(component.id);
    }
  };

  const handleDragStop = (e: DraggableEvent, draggableData: DraggableData) => {
    if (previewMode) return;
    
    console.log('Drag stop event', {
      componentId: component.id,
      originalX: component.layout.x,
      originalY: component.layout.y,
      newX: draggableData.x,
      newY: draggableData.y,
      slideZoomLevel
    });
    
    if (onUpdateLayout && (component.layout.x !== draggableData.x || component.layout.y !== draggableData.y)) {
      onUpdateLayout(component.id, { x: draggableData.x, y: draggableData.y });
    }
  };
  
  const renderComponentContent = (): JSX.Element => {
    const currentComponentType = component.type as BlockType;
    if (!currentComponentType || !BLOCK_REGISTRY[currentComponentType]) {
      return <div className="p-2 border border-red-300 bg-red-50 text-red-700 text-xs flex items-center justify-center w-full h-full">Unknown type: {component.type}</div>;
    }
    
    const blockMeta = BLOCK_REGISTRY[currentComponentType];
    const componentData = component.data || {};
    const sampleData = blockMeta?.sampleData || {};
    const data = { ...sampleData, ...componentData };
    let contentStyle: React.CSSProperties = { ...(component.style || {}) };
    console.log('[VisualComponentRenderer] Initial contentStyle:', contentStyle);


    if (themeSettings.textColor && ['text', 'quote', 'list', 'table', 'button', 'testimonialCard', 'problemSolution', 'investmentAsk', 'ctaCard', 'citation', 'visualQuote', 'iconFeature'].includes(currentComponentType)) {
      contentStyle.color = themeSettings.textColor;
    }
    if (themeSettings.fontFamily) { 
      contentStyle.fontFamily = themeSettings.fontFamily;
    }
    if (currentComponentType === 'text' && data.variant === 'heading' && themeSettings.primaryColor) {
      contentStyle.color = themeSettings.primaryColor;
    }

    // Override with component-specific styles if they exist
    if (component.style) {
      contentStyle = { ...contentStyle, ...component.style };
    }
    console.log('[VisualComponentRenderer] Final contentStyle before switch:', contentStyle);


    switch (currentComponentType) {
      case 'text':
        const Tag = data.variant === 'heading' ? `h${data.level || 1}` as keyof JSX.IntrinsicElements 
                  : data.variant === 'subheading' ? `h${(data.level || 2) + 1}` as keyof JSX.IntrinsicElements
                  : 'p';
        
        let textSpecificStyle: React.CSSProperties = {
            ...contentStyle, // Start with potentially overridden style
            whiteSpace: 'normal',
        };

        // Theme-based overrides (less specific)
        if (data.variant === 'heading' && themeSettings.primaryColor && !component.style?.color) {
          textSpecificStyle.color = themeSettings.primaryColor;
        } else if (themeSettings.textColor && !component.style?.color) {
          textSpecificStyle.color = themeSettings.textColor;
        }
        if (themeSettings.fontFamily && !component.style?.fontFamily) {
          textSpecificStyle.fontFamily = themeSettings.fontFamily;
        }
        
        // Ensure component.style takes precedence
        if (component.style?.color) textSpecificStyle.color = component.style.color;
        if (component.style?.fontFamily) textSpecificStyle.fontFamily = component.style.fontFamily;
        if (component.style?.fontSize) textSpecificStyle.fontSize = component.style.fontSize;
        if (component.style?.textAlign) textSpecificStyle.textAlign = component.style.textAlign;


        console.log('[VisualComponentRenderer] TextBlock textSpecificStyle after all overrides:', textSpecificStyle);
        
        const headingLevel = data.level || 1;

        if (!previewMode && actualIsSelected && component.type === 'text') { 
          if (editingText === null) {
            setEditingText(data.text || '');
          }
          const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setEditingText(e.target.value);
          };
          const handleTextBlur = () => {
            if (editingText !== null && editingText !== (data.text || '') && onUpdateComponentData) {
              onUpdateComponentData(component.id, { ...data, text: editingText });
            }
          };
          const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleTextBlur(); 
              (e.target as HTMLTextAreaElement).blur();
            } else if (e.key === 'Escape') {
              setEditingText(data.text || ''); 
              (e.target as HTMLTextAreaElement).blur();
            }
          };

          return (
            <textarea
              value={editingText || ''}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full p-1 box-border resize-none border-none focus:outline-none focus:ring-1 focus:ring-blue-400 bg-transparent"
              style={{ ...textSpecificStyle }} // Use the fully resolved style
              autoFocus
            />
          );
        }
        
        let finalTagClasses = ""; 
        if (data.variant === 'heading') {
          if (headingLevel === 1) finalTagClasses += ` text-4xl font-bold`;
          else if (headingLevel === 2) finalTagClasses += ` text-3xl font-bold`;
          else if (headingLevel === 3) finalTagClasses += ` text-2xl font-bold`;
          else if (headingLevel === 4) finalTagClasses += ` text-xl font-bold`;
          else if (headingLevel === 5) finalTagClasses += ` text-lg font-bold`;
          else finalTagClasses += ` text-md font-bold`;
        } else if (data.variant === 'subheading') {
          if (headingLevel === 1) finalTagClasses += ` text-2xl font-semibold`;
          else if (headingLevel === 2) finalTagClasses += ` text-xl font-semibold`;
          else if (headingLevel === 3) finalTagClasses += ` text-lg font-semibold`;
          else finalTagClasses += ` text-md font-semibold`;
        } else {
          finalTagClasses += ` text-base`; 
        }
        
        let tagSpecificStyle: React.CSSProperties = { ...textSpecificStyle, display: 'inline-block', maxWidth: '100%' };
        let parentDivStyle: React.CSSProperties = { width: '100%', height: '100%', padding: '0.5rem', boxSizing: 'border-box' };

        if (tagSpecificStyle.textAlign === 'center') {
            parentDivStyle.display = 'flex';
            parentDivStyle.justifyContent = 'center';
            parentDivStyle.alignItems = 'center';
        } else if (tagSpecificStyle.textAlign === 'right') {
            parentDivStyle.display = 'flex';
            parentDivStyle.justifyContent = 'flex-end';
            parentDivStyle.alignItems = 'center';
        } else {
            parentDivStyle.display = 'block'; 
        }
        
        const rawHtml = data.text || (data.variant === 'heading' || data.variant === 'subheading' ? 'Heading' : 'Paragraph');
        let cleanedHtml = rawHtml.replace(/\n(?=<span)/g, ' ');
        cleanedHtml = cleanedHtml.replace(/([^\s>])(<span)/gi, '$1 $2');
        
        const scale = (component.layout.width / (component.layout.baseWidth || component.layout.width));
        return (
          <div style={parentDivStyle}>
            <Tag
              style={{
                ...tagSpecificStyle, // Use the fully resolved style
                fontSize: `1em`, // Base font size, scaling handles the rest
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: "100%", // Ensure it fills the scaled container part
                height: "100%",
                margin: 0,
                padding: 0,
                maxWidth: "none",
                maxHeight: "none",
              }}
              className={finalTagClasses.trim()}
              dangerouslySetInnerHTML={{ __html: cleanedHtml }}
            />
          </div>
        );
      
      case 'image':
      case 'customImage':
      case 'imageWithCaption':
        const imageContainerClasses = "w-full h-full flex flex-col items-center justify-center relative overflow-hidden";
        const imageStyles: React.CSSProperties = {...contentStyle, maxWidth: '100%', maxHeight: '100%', objectFit: (data as any).objectFit || 'contain' };
        const captionStyles: React.CSSProperties = {
            color: themeSettings.textColor || '#ffffff', 
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem', 
            textAlign: (data as any).textAlign || 'center',
            position: 'absolute',
            bottom: 0,
            left:0,
            width: '100%',
            boxSizing: 'border-box',
        };
        if ((data as any).captionPosition === 'top') {
            captionStyles.bottom = 'auto';
            captionStyles.top = 0;
        }
        const imgScale = (component.layout.width / (component.layout.baseWidth || component.layout.width));
        return (
          <div style={{width: '100%', height: '100%'}} className={imageContainerClasses}>
            <img
              src={data.src || 'https://via.placeholder.com/150'}
              alt={data.alt || 'Sample Image'}
              style={{
                ...imageStyles,
                width: "100%",
                height: "100%",
                maxWidth: "none",
                maxHeight: "none",
                transform: `scale(${imgScale})`,
                transformOrigin: "top left",
              }}
            />
            {data.caption && <div style={captionStyles} dangerouslySetInnerHTML={{ __html: data.caption }} />}
          </div>
        );

      case 'quote':
        const quoteBlockStyle: React.CSSProperties = {
            ...contentStyle, 
            borderColor: themeSettings.accentColor || contentStyle.borderColor || '#e5e7eb',
            padding: '1rem',
            borderLeftWidth: '4px',
            fontStyle: 'italic',
        };
        return (
          <blockquote style={quoteBlockStyle} className="h-full flex flex-col justify-center">
            <div className="mb-2 text-lg" dangerouslySetInnerHTML={{ __html: `"${data.text || 'Sample Quote'}"` }} />
            {data.author && <footer className="text-sm font-semibold self-end mt-2" style={{color: (themeSettings as any).secondaryTextColor || contentStyle.color}}>- {data.author}</footer>}
          </blockquote>
        );
      
      case 'code':
        return <pre style={contentStyle} className="p-2 bg-gray-800 text-white rounded overflow-auto text-xs w-full h-full box-border"><code>{data.code || '// Sample code'}</code></pre>;

      case 'video':
        return <video src={data.src} controls style={{...contentStyle, width: '100%', height: '100%'}} poster={data.poster || undefined} />;
      
      case 'list':
        const ListTag = data.ordered ? 'ol' : 'ul';
        const itemsToRender: Array<{ id: string; text: string }> = 
          (data.items && Array.isArray(data.items) && data.items.every((i: any) => i && typeof i.id === 'string' && typeof i.text === 'string'))
            ? data.items
            : [{id: `fallback-${generateUUID()}`, text: 'Sample Item 1 (fallback)'}, {id: `fallback-${generateUUID()}`, text: 'Sample Item 2 (fallback)'}];
        
        return (
          <ListTag style={contentStyle} className={`p-4 text-sm ${data.ordered ? 'list-decimal' : 'list-disc'} list-inside space-y-1`}>
            {itemsToRender.map((item: { id: string; text: string } ) => (
              <li key={item.id} dangerouslySetInnerHTML={{ __html: String(item.text || '') }} />
            ))}
          </ListTag>
        );

      case 'table':
        return (
          <table style={contentStyle} className="w-full border-collapse border border-gray-300 text-xs">
            <tbody>
              {(data.rows || [['Sample Cell']]).map((row: string[], rIdx: number) => (
                <tr key={rIdx}>
                  {row.map((cell: string, cIdx: number) => (
                    <td key={cIdx} className="border border-gray-300 p-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'chart':
        const componentSpecificData = component.data as any;
        const chartBlockProps: ChartBlockType = {
          id: component.id,
          type: 'chart',
          x: component.layout.x,
          y: component.layout.y,
          width: component.layout.width,
          height: component.layout.height,
          style: component.style || {},
          zIndex: componentSpecificData.zIndex ?? (component as any).zIndex,
          selected: (component as any).selected,
          animation: componentSpecificData.animation ?? (component as any).animation,
          chartType: componentSpecificData.chartType,
          data: componentSpecificData.data,
          options: componentSpecificData.options,
        };
        return <ChartBlockComponent block={chartBlockProps} />;
      
      case 'button':
        const buttonVariant = data.variant || 'primary'; 
        let btnStyles: React.CSSProperties = { 
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem', 
          fontWeight: 500,
          fontSize: '0.875rem', 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
          fontFamily: themeSettings.fontFamily || 'Inter, system-ui, sans-serif',
          border: '1px solid transparent',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...contentStyle 
        };
        if (buttonVariant === 'primary') {
          btnStyles.backgroundColor = themeSettings.accentColor || '#2563eb'; 
          btnStyles.color = themeSettings.textColorOnPrimary || '#ffffff'; 
        } else if (buttonVariant === 'secondary') {
          btnStyles.backgroundColor = themeSettings.secondaryColor || '#e5e7eb'; 
          btnStyles.color = themeSettings.textColorOnSecondary || '#1f2937'; 
        } else if (buttonVariant === 'outline') {
          btnStyles.borderColor = themeSettings.accentColor || '#2563eb';
          btnStyles.color = themeSettings.accentColor || '#2563eb';
          btnStyles.backgroundColor = 'transparent';
        }
        return <button style={btnStyles} className="hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2">{data.label || 'Button'}</button>;
      
      case 'shape':
        return <div style={{...contentStyle, width: '100%', height: '100%', backgroundColor: data.backgroundColor || data.color || themeSettings.secondaryColor || '#cbd5e1', borderRadius: data.shape === 'circle' ? '50%' : (data.borderRadius || '4px') }}></div>;
      
      case 'embed':
        return (
          <div style={{...contentStyle, width: '100%', height: '100%'}} className="border border-slate-300 rounded bg-slate-50 overflow-hidden flex items-center justify-center">
            {data.url || data.src ? (
              <iframe 
                src={data.url || data.src} 
                title={data.title || 'Embedded Content'} 
                style={{ width: '100%', height: '100%', border: 'none' }} 
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <div className="text-center text-slate-500 p-2">
                <Globe className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                <p className="text-xs">Embed URL not set</p>
              </div>
            )}
          </div>
        );

      case 'checklist':
        return (
          <ul style={contentStyle} className="p-2 text-sm space-y-1">
            {(data.items || [{text: 'Sample Task', checked: false}]).map((item: {text: string, checked: boolean}, i: number) => (
              <li key={i} className={`flex items-center ${item.checked ? 'text-gray-400 line-through' : ''}`}>
                <input type="checkbox" checked={item.checked} readOnly className="mr-2 h-3 w-3 align-middle accent-blue-500"/>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'divider':
        return <hr style={{...contentStyle, borderTopWidth: data.thickness || 2, borderColor: data.color || '#e2e8f0'}} className="my-2"/>;

      case 'icon':
        const IconComp = (StarIcon as any); 
        return (
          <div style={contentStyle} className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-2 rounded border border-slate-300">
            <IconComp className="h-1/2 w-1/2 text-slate-400 mb-1" />
            <p className="text-xs font-semibold text-slate-600 truncate">{data.iconName || 'Icon'}</p>
          </div>
        );

      case 'file':
        return (
          <a 
            href={data.fileUrl || data.src || '#'}
            target="_blank" 
            rel="noopener noreferrer" 
            style={contentStyle} 
            className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-3 rounded border border-slate-300 hover:border-slate-400 transition-colors"
          >
            <FileIconLucide className="h-1/2 w-1/2 text-slate-500 mb-1" />
            <span className="text-xs font-semibold text-slate-700 truncate">{data.fileName || 'View File'}</span>
          </a>
        );
      
      case 'audio':
        return (
          <div style={contentStyle} className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-2 rounded border border-slate-700">
            <Music className="h-1/3 w-1/3 text-slate-400 mb-2" />
            <audio src={data.src} controls className="w-full max-w-xs h-8" />
            {data.title && <p className="text-xxs text-slate-300 mt-1 truncate">{data.title}</p>}
          </div>
        );

      case 'timer':
        return (
          <div style={contentStyle} className="w-full h-full flex flex-col items-center justify-center bg-sky-100 p-2 rounded border border-sky-300">
            <TimerIconLucide className="h-1/3 w-1/3 text-sky-500 mb-1" />
            <p className="text-sm font-semibold text-sky-700">{data.label || 'Timer'}</p>
            <p className="text-xs text-sky-600">({data.duration ? `${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}` : '0:00'})</p>
          </div>
        );
      
      case 'poll':
        return (
          <div style={contentStyle} className="w-full h-full flex flex-col items-start justify-center bg-purple-50 p-2 rounded border border-purple-200 text-xs">
            <div className="flex items-center mb-1 text-purple-700 w-full">
              <BarChart3 className="mr-1 h-3 w-3 flex-shrink-0" />
              <strong className="text-xs truncate">Poll: {data.question || 'Sample Question?'}</strong>
            </div>
            <div className="w-full space-y-1 mt-1">
              {(data.options || ['Option A', 'Option B']).slice(0,3).map((opt: string, i: number) => (
                <div key={i} className="text-xxs bg-purple-100 p-1 rounded text-purple-700 truncate">{opt}</div>
              ))}
              {(data.options || []).length > 3 && <div className="text-xxs text-purple-500">...and more</div>}
            </div>
          </div>
        );

      case 'customHtml':
        return <div dangerouslySetInnerHTML={{ __html: data.html || '<p>Sample HTML</p>' }} style={contentStyle} />;
      
      case 'teamCard':
        return (
          <div style={contentStyle} className="p-2 border rounded bg-gray-50 text-xs">
            <div className="flex items-center mb-1"><UsersIcon className="mr-1 h-3 w-3" /> <strong className="text-xs">Team</strong></div>
            {(data.members || []).map((member: any, idx: number) => (
              <div key={idx} className="mt-1 p-1 border-t">
                <p className="font-semibold">{member.name} - <span className="font-normal italic">{member.title}</span></p>
                {member.bio && <p className="text-xs">{member.bio}</p>}
              </div>
            ))}
          </div>
        );
      case 'tractionWidget':
        return (
          <div style={contentStyle} className="p-2 border rounded bg-gray-50 text-xs">
             <div className="flex items-center mb-1"><TrendingUpIcon className="mr-1 h-3 w-3" /> <strong className="text-xs">Traction</strong></div>
            {(data.metrics || []).map((metric: any, idx: number) => (
              <div key={idx} className="mt-0.5">
                <span className="font-semibold">{metric.label}:</span> {metric.value}
                {metric.trend && <span className={`ml-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{metric.trend === 'up' ? '▲' : '▼'}</span>}
              </div>
            ))}
          </div>
        );
      case 'timeline':
        return (
          <div style={contentStyle} className="p-2 border rounded bg-gray-50 text-xs">
            <div className="flex items-center mb-1"><CalendarDays className="mr-1 h-3 w-3" /> <strong className="text-xs">Timeline</strong></div>
            <ul className="list-disc list-inside ml-1 mt-1">
              {(data.milestones || []).map((milestone: any, idx: number) => (
                <li key={idx}>
                  <span className="font-semibold">{milestone.date}:</span> {milestone.label}
                  {milestone.description && <p className="text-xs pl-3">{milestone.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'marketMap':
        return (
          <div style={contentStyle} className="p-2 border rounded text-xs bg-gray-50">
            <div className="flex items-center mb-1"><PieChartIconLucide className="mr-1 h-3 w-3" /> <strong className="text-xs">Market Size</strong></div>
            <p>TAM: {data.tam?.toLocaleString() || 'N/A'}</p>
            <p>SAM: {data.sam?.toLocaleString() || 'N/A'}</p>
            <p>SOM: {data.som?.toLocaleString() || 'N/A'}</p>
            {data.notes && <p className="text-xs mt-0.5">Notes: {data.notes}</p>}
          </div>
        );
      case 'competitorTable': 
        return (
          <div style={contentStyle} className="w-full h-full p-2 border rounded bg-slate-50 text-xs flex flex-col overflow-hidden">
            <div className="flex items-center mb-1 text-slate-700">
              <TableIconLucide className="mr-1 h-3 w-3 flex-shrink-0" /> 
              <strong className="text-xs truncate">Competitor Analysis</strong>
            </div>
            <div className="flex-grow overflow-auto mt-0.5 text-xxs">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border border-slate-300 p-0.5 bg-slate-100 text-slate-600">Feature</th>
                    <th className="border border-slate-300 p-0.5 bg-slate-100 text-slate-600">Us</th>
                    <th className="border border-slate-300 p-0.5 bg-slate-100 text-slate-600">Comp. A</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-0.5">Feature 1</td>
                    <td className="border border-slate-300 p-0.5 text-center text-green-500">✔</td>
                    <td className="border border-slate-300 p-0.5 text-center text-red-500">✖</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-0.5">Feature 2</td>
                    <td className="border border-slate-300 p-0.5 text-center text-green-500">✔</td>
                    <td className="border border-slate-300 p-0.5 text-center text-green-500">✔</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'problemSolution':
        return (
          <div style={contentStyle} className="p-2 border rounded bg-gray-50 text-xs">
            <div className="flex items-center mb-1"><RefreshCcw className="mr-1 h-3 w-3" /> <strong className="text-xs">Problem & Solution</strong></div>
            <div className="mt-0.5">
              <p><span className="font-semibold">Problem:</span> {data.problem || 'Not defined'}</p>
              <p><span className="font-semibold">Solution:</span> {data.solution || 'Not defined'}</p>
            </div>
          </div>
        );
      case 'logoWall':
        return (
          <div style={contentStyle} className="p-2 border rounded bg-gray-50">
            <div className="flex items-center mb-1"><GridIconLucide className="mr-1 h-3 w-3" /> <strong className="text-xs">Partners/Clients</strong></div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(data.logos || []).map((logo: any, idx: number) => (
                <img key={idx} src={logo.src} alt={logo.alt || `Logo ${idx+1}`} className="h-6 object-contain bg-white p-0.5 border rounded" />
              ))}
              {(data.logos || []).length === 0 && <p className="text-xs text-gray-500">No logos.</p>}
            </div>
          </div>
        );
      case 'businessModel':
        return (
          <div style={contentStyle} className="p-2 border rounded text-xs bg-gray-50">
            <div className="flex items-center mb-1"><Briefcase className="mr-1 h-3 w-3" /> <strong className="text-xs">Business Model</strong></div>
            {(data.streams || []).map((stream: any, idx: number) => (
              <div key={idx} className="mt-0.5">
                <p><span className="font-semibold">{stream.label}:</span> {stream.value}</p>
              </div>
            ))}
            {data.diagramUrl && <img src={data.diagramUrl} alt="Business Model Diagram" className="mt-1 w-full h-auto object-contain border rounded"/>}
          </div>
        );
      case 'testimonialCard':
        return (
          <div style={contentStyle} className="p-2 border rounded shadow-sm bg-white text-xs">
            <div className="flex items-center mb-1"><MessageCircle className="mr-1 text-blue-500 h-3 w-3" /> <strong className="text-xs">Testimonial</strong></div>
            <blockquote className="mt-0.5 italic">
              "{data.quote || 'A glowing review.'}"
            </blockquote>
            <p className="text-right mt-0.5 font-semibold">- {data.author || 'User'}</p>
            {data.logoUrl && <img src={data.logoUrl} alt="Client Logo" className="h-5 mt-0.5 mx-auto object-contain"/>}
          </div>
        );
      case 'useOfFunds':
         return (
          <div style={contentStyle} className="p-2 border rounded text-xs bg-gray-50">
            <div className="flex items-center mb-1"><PieChartIconLucide className="mr-1 h-3 w-3" /> <strong className="text-xs">Use of Funds</strong></div>
            <ul className="list-none mt-0.5">
            {(data.categories || []).map((cat: any, idx: number) => (
              <li key={idx}>{cat.label}: {cat.percent}%</li>
            ))}
            </ul>
          </div>
        );
      case 'ctaCard':
        return (
          <div style={{...contentStyle, textAlign: (data as any).textAlign || 'center' }} className="p-2 border rounded bg-blue-50">
            {data.text && <p className="mb-1 text-sm">{data.text}</p>}
            {data.buttonLabel && 
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                {data.buttonLabel}
              </button>
            }
          </div>
        );
      case 'demoGallery': 
        const galleryItems = data.items || [{type: "image", src: "https://via.placeholder.com/80x60?text=Item1"}, {type: "image", src: "https://via.placeholder.com/80x60?text=Item2"}];
        return (
          <div style={contentStyle} className="w-full h-full p-2 border rounded bg-slate-50 text-xs flex flex-col overflow-hidden">
            <div className="flex items-center mb-1 text-slate-700">
              <GalleryThumbnails className="mr-1 h-3 w-3 flex-shrink-0" /> 
              <strong className="text-xs truncate">Demo Gallery</strong>
            </div>
            <div className="flex-grow grid grid-cols-2 gap-1 mt-1 overflow-auto">
              {galleryItems.slice(0, 4).map((item: any, idx: number) => (
                <div key={idx} className="relative aspect-video bg-slate-200 rounded overflow-hidden">
                  {item.type === 'image' && <img src={item.src} alt={item.caption || `Gallery item ${idx+1}`} className="w-full h-full object-cover" />}
                  {item.type === 'video' && <div className="w-full h-full flex items-center justify-center bg-slate-300"><ImageIcon className="h-1/2 w-1/2 text-slate-500" /></div>}
                  {item.caption && <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xxs p-0.5 truncate">{item.caption}</p>}
                </div>
              ))}
              {galleryItems.length === 0 && <p className="col-span-2 text-center text-slate-400 text-xxs">No items in gallery.</p>}
            </div>
          </div>
        );
      case 'milestoneTracker':
        return (
          <div style={contentStyle} className="p-2 border rounded bg-gray-50 text-xs">
            <div className="flex items-center mb-1"><Flag className="mr-1 h-3 w-3" /> <strong className="text-xs">Milestones</strong></div>
            <ul className="list-none ml-1 mt-0.5">
              {(data.milestones || []).map((milestone: any, idx: number) => (
                <li key={idx} className={`mt-0.5 ${milestone.completed ? 'text-green-600' : 'text-gray-700'}`}>
                  <CheckCircle className={`inline-block mr-1 h-2.5 w-2.5 align-middle ${milestone.completed ? 'text-green-500' : 'text-gray-400'}`} />
                  {milestone.label}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'investmentAsk':
        return (
          <div style={{...contentStyle, textAlign: (data as any).textAlign || 'center' }} className="p-2 border rounded bg-green-50">
            <DollarSignIcon className="inline-block mr-1 h-4 w-4 text-green-700" />
            <h3 className="text-sm font-semibold mb-0.5 text-green-800">Investment Ask</h3>
            <p className="text-xs">Amount: {data.amount || '$0'}</p>
            <p className="text-xs">Equity: {data.equity || 'N/A'}</p>
            {data.terms && <p className="text-xs mt-0.5">Terms: {data.terms}</p>}
          </div>
        );
      case 'mapBlock':
        return (
          <div style={contentStyle} className="w-full h-full flex flex-col items-center justify-center bg-green-50 p-2 rounded border border-green-300">
            <MapPinIconLucide className="h-1/2 w-1/2 text-green-500 mb-1" />
            <p className="text-xs font-semibold text-green-700 truncate">Map Location</p>
            <p className="text-xxs text-green-600 text-center truncate">{data.location || 'No location set'}</p>
          </div>
        );

      case 'heroImage':
        return (
          <div className="w-full h-full bg-cover bg-center relative" style={{ backgroundImage: `url(${data.src || 'https://via.placeholder.com/1200x600?text=Hero+Image'})`, ...contentStyle }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4" style={{ backgroundColor: data.overlayColor || 'rgba(0,0,0,0.3)'}}>
              {data.headline && <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.headline }} />}
              {data.subheadline && <p className="text-xl text-gray-200 mb-4" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.subheadline }} />}
              {data.ctaText && data.ctaUrl && (
                <a href={data.ctaUrl} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" style={{fontFamily: themeSettings.fontFamily}}>
                  {data.ctaText}
                </a>
              )}
            </div>
          </div>
        );

      case 'imageGallery':
        const galleryData = data as any;
        const { images = [], layout = 'grid', columns = 3, spacing = 4, showCaptions = 'hover' } = galleryData;
        const gap = spacing / 4; 
        const [currentIndex, setCurrentIndex] = React.useState(0);

        const handlePrev = (e: React.MouseEvent) => {
          e.stopPropagation(); 
          setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
        };
      
        const handleNext = (e: React.MouseEvent) => {
          e.stopPropagation(); 
          setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        };

        if (layout === 'carousel' && images.length > 0) {
          const currentImage = images[currentIndex];
          return (
            <div className="w-full h-full relative flex flex-col items-center justify-center bg-gray-100" style={contentStyle}>
              <img 
                src={currentImage.src || 'https://via.placeholder.com/600x400'} 
                alt={currentImage.alt || `Gallery image ${currentIndex + 1}`} 
                className="max-w-full max-h-[calc(100%-40px)] object-contain rounded-md shadow-lg"
              />
              {currentImage.caption && (showCaptions === 'always' || showCaptions === 'hover') && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2 bg-black bg-opacity-70 text-white text-xs rounded-md" style={{fontFamily: themeSettings.fontFamily}}>
                  {currentImage.caption}
                </div>
              )}
              {images.length > 1 && !previewMode && (
                <>
                  <button 
                    onClick={handlePrev} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity z-10"
                    aria-label="Previous image"
                  >
                    &#x2190; {/* Left arrow */}
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity z-10"
                    aria-label="Next image"
                  >
                    &#x2192; {/* Right arrow */}
                  </button>
                </>
              )}
               {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                  {images.map((_:any, idx:number) => (
                    <button 
                      key={idx} 
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                      className={`w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-blue-500' : 'bg-gray-400 hover:bg-gray-500'}`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div className={`w-full h-full p-2 overflow-auto grid gap-${gap} ${layout === 'grid' ? `grid-cols-${columns}` : 'grid-cols-1'}`} style={contentStyle}>
            {(images || []).map((img: any, idx: number) => (
              <div key={idx} className="relative group aspect-video bg-gray-200 rounded overflow-hidden">
                <img src={img.src || 'https://via.placeholder.com/400x300'} alt={img.alt || `Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
                {img.caption && (showCaptions === 'always' || (showCaptions === 'hover' && 'group-hover:opacity-100')) && (
                  <div className={`absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-60 text-white text-xs ${showCaptions === 'hover' ? 'opacity-0 transition-opacity' : ''}`} style={{fontFamily: themeSettings.fontFamily}}>
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
             {images.length === 0 && <p className="text-xs text-gray-400 text-center col-span-full">No images in gallery.</p>}
          </div>
        );
      
      case 'featureCard':
        const featureCardData = data as any;
        return (
          <div 
            className="p-4 border rounded-lg shadow-md h-full flex flex-col" 
            style={{
              backgroundColor: featureCardData.backgroundColor || themeSettings.secondaryColor || '#ffffff', 
              color: featureCardData.textColor || themeSettings.textColor ||'#111827',
              ...contentStyle
            }}
          >
            {featureCardData.icon && <Zap className="w-10 h-10 mb-3" style={{color: themeSettings.accentColor || featureCardData.iconColor || themeSettings.primaryColor || '#3b82f6'}}/>}
            {featureCardData.imageUrl && <img src={featureCardData.imageUrl} alt={featureCardData.title || 'Feature image'} className="w-full h-40 object-cover mb-3 rounded-md"/>}
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: themeSettings.fontFamily, color: themeSettings.primaryColor || contentStyle.color}} dangerouslySetInnerHTML={{ __html: featureCardData.title || 'Feature Title' }} />
            <div className="text-sm flex-grow mb-3" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: featureCardData.description || 'Feature description goes here, providing more details about this amazing capability.' }} />
            {featureCardData.features && featureCardData.features.length > 0 && (
              <ul className="list-disc list-inside text-xs mb-3 space-y-1 pl-4" style={{fontFamily: themeSettings.fontFamily}}>
                {featureCardData.features.map((feature: string, idx: number) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: feature }} />
                ))}
              </ul>
            )}
            {featureCardData.linkText && featureCardData.linkUrl && 
              <a 
                href={featureCardData.linkUrl} 
                className="text-sm mt-auto font-medium hover:underline" 
                style={{color: themeSettings.accentColor || '#2563eb', fontFamily: themeSettings.fontFamily}}
              >
                {featureCardData.linkText} &rarr;
              </a>}
          </div>
        );

      case 'mediaHero':
         return (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{backgroundColor: data.backgroundColor || '#f0f0f0', ...contentStyle}}>
                {data.mediaType === 'image' && <img src={data.src || 'https://via.placeholder.com/800x450'} alt={data.alt || 'Hero media'} className="absolute inset-0 w-full h-full object-cover" />}
                {data.mediaType === 'video' && <video src={data.src} poster={data.poster} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />}
                <div className="relative z-10 p-8 max-w-2xl text-center bg-black bg-opacity-50 rounded-lg">
                    <h2 className="text-3xl font-bold text-white mb-2" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.headline || 'Media Headline' }} />
                    {data.subheadline && <p className="text-lg text-gray-200 mb-4" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.subheadline }} />}
                    {data.description && <p className="text-md text-gray-300 mb-4" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.description }} />}
                    {data.buttonText && data.buttonUrl && 
                        <a href={data.buttonUrl} className="px-5 py-2 text-white rounded hover:opacity-90 transition-colors" style={{backgroundColor: themeSettings.accentColor || '#2563eb', fontFamily: themeSettings.fontFamily}}>{data.buttonText}</a>}
                </div>
            </div>
        );
      
      case 'citation':
        const citationData = data as CitationBlockDataType; 
        return <CitationBlock {...componentData} {...citationData} style={contentStyle} isSelected={actualIsSelected} />; 
        
      case 'statsDisplay':
        const statsDisplayData = data as any;
        const stats = statsDisplayData.stats || [{value: '12M+', label: 'Users Reached', icon: 'Users', description: 'Growing month over month.'}];
        const layoutIsVertical = statsDisplayData.layout === 'vertical';
        const cardStyle = statsDisplayData.cardStyle || 'card';

        let statCardClasses = "p-4 rounded-lg text-center flex-1";
        if (cardStyle === 'card') {
          statCardClasses += " bg-white shadow-lg";
        } else if (cardStyle === 'pill') {
          statCardClasses += " bg-gray-100 rounded-full py-3 px-6";
        } else { 
          statCardClasses += " bg-transparent";
        }
        
        return (
          <div 
            className={`w-full h-full flex p-3 gap-3 ${layoutIsVertical ? 'flex-col items-center' : 'flex-row flex-wrap justify-around items-stretch'}`} 
            style={{...contentStyle, backgroundColor: statsDisplayData.containerBackgroundColor || 'transparent'}}
          >
            {stats.map((stat: any, idx: number) => {
              const StatIcon = stat.icon === 'Users' ? UsersIcon : stat.icon === 'TrendingUp' ? TrendingUpIcon : Award; 
              return (
              <div key={idx} className={statCardClasses} style={{minWidth: layoutIsVertical ? '60%' : '120px'}}>
                {stat.icon && <StatIcon className={`w-10 h-10 mx-auto mb-2 ${cardStyle === 'pill' ? 'inline-block mr-2' : ''}`} style={{color: stat.iconColor || themeSettings.accentColor || '#4f46e5'}}/>}
                <div className={`font-bold ${cardStyle === 'pill' ? 'text-2xl inline-block' : 'text-4xl'}`} style={{color: stat.valueColor || themeSettings.primaryColor || '#1e293b', fontFamily: themeSettings.fontFamily}}>{stat.value}</div>
                <div className={`text-sm mt-1 ${cardStyle === 'pill' ? 'inline-block ml-2' : ''}`} style={{color: stat.labelColor || themeSettings.textColor ||'#475569', fontFamily: themeSettings.fontFamily}}>{stat.label}</div>
                {stat.description && cardStyle !== 'pill' && <p className="text-xs text-gray-500 mt-2" style={{fontFamily: themeSettings.fontFamily}}>{stat.description}</p>}
              </div>
            )})}
          </div>
        );
      
      case 'visualQuote':
        const vQuoteData = data as any;
         return (
            <div 
              className="p-6 md:p-8 rounded-lg shadow-xl h-full flex flex-col justify-center items-center text-center" 
              style={{
                backgroundColor: vQuoteData.backgroundColor || themeSettings.secondaryColor || '#f9fafb', 
                color: vQuoteData.textColor || themeSettings.textColor || '#111827', 
                ...contentStyle
              }}
            >
                {vQuoteData.authorImage && <img src={vQuoteData.authorImage} alt={vQuoteData.author || 'Author'} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 shadow-lg" style={{borderColor: themeSettings.accentColor || 'white'}}/>}
                <div className="text-2xl italic mb-6 leading-tight" style={{fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: `"${vQuoteData.text || 'This is a compelling visual quote that captures attention and inspires action.'}"` }} />
                <p className="text-lg font-semibold" style={{color: themeSettings.primaryColor || contentStyle.color, fontFamily: themeSettings.fontFamily}}>{vQuoteData.author || 'Anonymous'}</p>
                {vQuoteData.authorTitle && <p className="text-base mt-1" style={{color: themeSettings.textColor || '#6b7280', fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: vQuoteData.authorTitle }} />}
                {vQuoteData.companyLogo && <img src={vQuoteData.companyLogo} alt="Company Logo" className="h-12 mx-auto mt-4 opacity-90"/>}
            </div>
        );

      case 'iconFeature':
        const IconFeatComp = Award; 
        return (
          <div className={`flex items-start p-4 rounded-lg ${data.layout === 'horizontal-left' ? 'flex-row space-x-4' : 'flex-col items-center text-center space-y-2'}`} style={{backgroundColor: data.backgroundColor || 'transparent', ...contentStyle}}>
            <IconFeatComp className={`flex-shrink-0 ${data.iconSize === 'large' ? 'w-12 h-12' : data.iconSize === 'xlarge' ? 'w-16 h-16' : 'w-10 h-10'} ${data.layout === 'horizontal-left' ? '' : 'mb-2'}`} style={{color: data.iconColor || themeSettings.accentColor || '#3b82f6'}} />
            <div className="flex-grow">
              <h4 className={`font-semibold ${data.titleSize || 'text-lg'}`} style={{color: themeSettings.primaryColor, fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.title || 'Feature Title' }} />
              <div className={`text-gray-600 ${data.descriptionSize || 'text-sm'}`} style={{color: themeSettings.textColor, fontFamily: themeSettings.fontFamily}} dangerouslySetInnerHTML={{ __html: data.description || 'Detailed description of the feature and its benefits.' }} />
            </div>
          </div>
        );
      
      default:
        return <div className="p-2 border text-xs bg-gray-100 flex items-center justify-center w-full h-full" style={contentStyle}>{(BLOCK_REGISTRY[currentComponentType] ? BLOCK_REGISTRY[currentComponentType].label : component.type)}: Preview N/A</div>;
    }
  };

  const defaultPosition = { x: component.layout?.x || 0, y: component.layout?.y || 0 };
  const dragHandleClass = 'drag-handle';

  const getDraggableStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      width: component.layout.width, 
      height: component.layout.height, 
      zIndex: component.layout.zIndex,
      cursor: previewMode ? 'default' : 'grab', 
      border: actualIsSelected && !previewMode ? '2px solid #3b82f6' : '1px solid transparent',
      boxSizing: 'border-box',
      ...component.style,
    };
    return style;
  };

  if (!component?.layout) {
    console.error("[VisualComponentRenderer] Component layout is undefined, returning null", component);
    return null; 
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle={`.${dragHandleClass}`}
      position={{ x: component.layout.x, y: component.layout.y }}
      onStop={handleDragStop}
      bounds="parent"
      disabled={previewMode} 
    >
      <div
        ref={nodeRef}
        className={`${dragHandleClass} group absolute ${actualIsSelected && !previewMode ? 'ring-2 ring-blue-500 shadow-lg' : ''} z-10 ${previewMode ? '' : 'hover:shadow-md'}`} 
        onClick={handleSelect}
        style={getDraggableStyle()}
        onDoubleClick={(e) => {
          if (previewMode) return;
          e.stopPropagation();
          if (onOpenEditor) onOpenEditor(component.id);
          else if (onEdit) onEdit(component); 
        }}
      >
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${component.layout.width}px`,
              height: `${component.layout.height}px`,
              pointerEvents: 'auto',
            }}
          >
            <div style={{ width: '100%', height: '100%' }}>
              {renderComponentContent()}
            </div>
          </div>
        </div>
        
            {actualIsSelected && !previewMode && (
            <div className="absolute -top-2.5 -right-2.5 flex space-x-1 bg-white p-0.5 rounded-full shadow-md z-30">
              {(onOpenEditor || onEdit) && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (onOpenEditor) onOpenEditor(component.id); else if (onEdit) onEdit(component); }}
                  className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
                  title="Edit"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                </button>
              )}
              {(onDelete || onDeleteComponent) && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (onDeleteComponent) onDeleteComponent(component.id); else if (onDelete) onDelete(component.id); }}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                  title="Delete"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
        )}
        {/* Resize Handles */}
        {!previewMode && actualIsSelected && onUpdateLayout && (
          <>
            {(['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right'] as HandlePosition[]).map((position) => {
              const handleResizeStart = (e: React.MouseEvent) => {
                // Prevent dragging the component when starting a resize
                e.stopPropagation(); 
                console.log(`[VisualComponentRenderer] Resize start for ${component.id} from handle ${position}`);
                // TODO: Implement actual resize logic here.
                // This will involve:
                // 1. Storing initial mouse position, component dimensions.
                // 2. Adding mousemove and mouseup listeners to the document.
                // 3. On mousemove, calculate new dimensions based on delta, position, and zoom.
                // 4. Call onUpdateLayout with the new dimensions.
                // 5. On mouseup, remove document listeners.
              };

              return (
                <ResizeHandle
                  key={position}
                  position={position}
                  onResizeStart={handleResizeStart}
                  visible={actualIsSelected && !previewMode}
                />
              );
            })}
          </>
        )}
      </div>
    </Draggable>
  );
}
