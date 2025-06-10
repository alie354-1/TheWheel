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
import { TractionWidget } from './canvas/blocks/TractionWidget.tsx';
import { Timeline } from './canvas/blocks/Timeline.tsx';
import { UseOfFundsBlock } from './canvas/blocks/UseOfFunds.tsx';
import { TeamCardBlock } from './canvas/blocks/TeamCardBlock.tsx';
import { MarketMapBlock } from './canvas/blocks/MarketMapBlock.tsx';
import { CompetitorTableBlock } from './canvas/blocks/CompetitorTableBlock.tsx';
import { ProblemSolutionBlock } from './canvas/blocks/ProblemSolutionBlock.tsx';
import { LogoWallBlock } from './canvas/blocks/LogoWallBlock.tsx';
import { BusinessModelBlock } from './canvas/blocks/BusinessModelBlock.tsx';
import { TestimonialCardBlock } from './canvas/blocks/TestimonialCardBlock.tsx';
import { CTACardBlock } from './canvas/blocks/CTACardBlock.tsx';
import { DemoGalleryBlock } from './canvas/blocks/DemoGalleryBlock.tsx';
import { MilestoneTrackerBlock } from './canvas/blocks/MilestoneTrackerBlock.tsx';
import { MetricCounter } from './canvas/blocks/MetricCounterBlock.tsx';
import { InvestmentAsk } from './canvas/blocks/InvestmentAskBlock.tsx';
import { MapBlockComponent } from './canvas/blocks/MapBlock.tsx';
import { CustomImage } from './canvas/blocks/CustomImageBlock.tsx';
import { SocialProofBadgeBlock } from './canvas/blocks/SocialProofBadgeBlock.tsx';
import { OpportunityIndicator } from './canvas/blocks/OpportunityIndicatorBlock.tsx';
import BeforeAfterComparisonBlockComponent from './canvas/blocks/BeforeAfterComparisonBlock.tsx';
import { BenefitCardBlock } from './canvas/blocks/BenefitCardBlock.tsx';
import { CompetitivePositioningBlock } from './canvas/blocks/CompetitivePositioningBlock.tsx';
import { MarketSegmentsBlock } from './canvas/blocks/MarketSegmentsBlock.tsx';
import { AdvisorCardBlock } from './canvas/blocks/AdvisorCardBlock.tsx';
import { HiringPlanBlock } from './canvas/blocks/HiringPlanBlock.tsx';
import SkillMatrixBlock from './canvas/blocks/SkillMatrixBlock.tsx';
import { PressCard } from './canvas/blocks/PressCardBlock.tsx';
import { PartnershipCard } from './canvas/blocks/PartnershipCardBlock.tsx';
import { InvestorContactForm } from './canvas/blocks/InvestorContactFormBlock.tsx';
import * as HeroImageModule from './canvas/blocks/HeroImageBlock.tsx';
const HeroImage = HeroImageModule.default;
import ImageGallery from './canvas/blocks/ImageGalleryBlock.tsx';
import MediaHero from './canvas/blocks/MediaHeroBlock.tsx';
import StatsDisplay from './canvas/blocks/StatsDisplayBlock.tsx';
import VisualQuote from './canvas/blocks/VisualQuoteBlock.tsx';
import IconFeature from './canvas/blocks/IconFeatureBlock.tsx';
import ImageWithCaption from './canvas/blocks/ImageWithCaptionBlock.tsx';
import ButtonComponent from './canvas/blocks/ButtonBlock.tsx';
import Shape from './canvas/blocks/ShapeBlock.tsx';
import ChecklistBlock from './canvas/blocks/ChecklistBlock.tsx';
import TimerBlock from './canvas/blocks/TimerBlock.tsx';
import PollBlock from './canvas/blocks/PollBlock.tsx';

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

    // Render all block types with a user-friendly fallback for those without a custom implementation
    const blockMeta = BLOCK_REGISTRY[type as BlockType];
    const blockLabel = blockMeta?.label || type;
    const blockIcon = blockMeta?.icon || "Star";
    // Lucide icons are imported above, fallback to StarIcon if not found
    const IconComponent = (() => {
      try {
        // @ts-ignore
        return require("lucide-react")[blockIcon] || StarIcon;
      } catch {
        return StarIcon;
      }
    })();

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
      case 'checklist':
        return <ChecklistBlock {...component.data} />;
      case 'timer':
        return <TimerBlock {...component.data} />;
      case 'poll':
        return <PollBlock {...component.data} />;
      case 'calloutBox':
        return <SafeTextRenderer html={data.text} style={componentStyle} />;
      case 'tractionWidget':
        return <TractionWidget {...(data as any)} />;
      case 'timeline':
        return <Timeline {...(data as any)} />;
      case 'useOfFunds':
        return <UseOfFundsBlock block={data as any} />;
      case 'teamCard':
        return <TeamCardBlock {...(data as any)} id={component.id} />;
      case 'marketMap':
        return <MarketMapBlock {...(data as any)} id={component.id} />;
      case 'competitorTable':
        return <CompetitorTableBlock {...(data as any)} id={component.id} />;
      case 'problemSolution':
        return <ProblemSolutionBlock {...(data as any)} id={component.id} />;
      case 'logoWall':
        return <LogoWallBlock {...(data as any)} id={component.id} />;
      case 'businessModel':
        return <BusinessModelBlock {...(data as any)} id={component.id} />;
      case 'testimonialCard':
        return <TestimonialCardBlock {...(data as any)} id={component.id} />;
      case 'ctaCard':
        return <CTACardBlock {...(data as any)} id={component.id} />;
      case 'demoGallery':
        return <DemoGalleryBlock {...(data as any)} id={component.id} />;
      case 'milestoneTracker':
        return <MilestoneTrackerBlock {...(data as any)} id={component.id} />;
      case 'metricCounter':
        return <MetricCounter {...(data as any)} />;
      case 'investmentAsk':
        return <InvestmentAsk {...(data as any)} />;
      case 'mapBlock':
        return <MapBlockComponent {...(data as any)} />;
      case 'customImage':
        return <CustomImage {...(data as any)} />;
      case 'socialProofBadge':
        return <SocialProofBadgeBlock {...(data as any)} />;
      case 'opportunityIndicator':
        return <OpportunityIndicator {...(data as any)} />;
      case 'beforeAfterComparison':
        return <BeforeAfterComparisonBlockComponent {...component.data} />;
      case 'benefitCard':
        return <BenefitCardBlock block={component.data} />;
      case 'competitivePositioning':
        return <CompetitivePositioningBlock {...component.data} />;
      case 'marketSegments':
        return <MarketSegmentsBlock {...component.data} />;
      case 'advisorCard':
        return <AdvisorCardBlock {...component.data} />;
      case 'hiringPlan':
        return <HiringPlanBlock {...component.data} />;
      case 'skillMatrix':
        return <SkillMatrixBlock block={component.data} />;
      case 'pressCard':
        return <PressCard {...(data as any)} />;
      case 'partnershipCard':
        return <PartnershipCard {...(data as any)} />;
      case 'investorContactForm':
        return <InvestorContactForm {...(data as any)} />;
      case 'heroImage':
        return <HeroImage {...(data as any)} />;
      case 'imageGallery':
        return <ImageGallery {...(data as any)} />;
      case 'mediaHero':
        return <MediaHero {...(data as any)} />;
      case 'statsDisplay':
        return <StatsDisplay {...(data as any)} />;
      case 'visualQuote':
        return <VisualQuote {...(data as any)} />;
      case 'iconFeature':
        return <IconFeature {...(data as any)} />;
      case 'imageWithCaption':
        return <ImageWithCaption {...(data as any)} />;
      case 'button':
        return <ButtonComponent {...(data as any)} />;
      case 'shape':
        return <Shape {...(data as any)} />;
      // Add a user-friendly placeholder for all other block types
      default:
        return (
          <div
            className="flex flex-col items-center justify-center h-full w-full rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-center"
            style={{ color: "#666", ...componentStyle }}
          >
            <div className="mb-2 flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-blue-400" />
            </div>
            <div className="font-semibold text-base mb-1">{blockLabel}</div>
            <div className="text-xs mb-2">This block type is not yet fully implemented.<br />You can still add and edit it, but the final design will be improved soon.</div>
            <pre className="text-xs text-gray-400 text-left w-full overflow-x-auto bg-white rounded p-2">{JSON.stringify(data, null, 2)}</pre>
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
