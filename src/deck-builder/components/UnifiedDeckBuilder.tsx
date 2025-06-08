import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SectionType, DeckSection, Deck, VisualComponent, VisualComponentLayout, DeckTheme } from '../types/index.ts';
import { useDeck } from '../hooks/useDeck.ts';
import { TemplateSelector } from './TemplateSelector.tsx';
import { ComponentLibraryPanel } from './ComponentLibraryPanel.tsx';
import { BLOCK_REGISTRY, BlockType } from '../types/blocks.ts';
import { ThemeCustomizationPanel, ThemeSettings } from './ThemeCustomizationPanel.tsx';
import { VisualComponentEditorModal } from './VisualComponentEditorModal.tsx';
import { ColorTheme as EditorColorTheme } from './EnhancedVisualDeckBuilderHelpers.tsx';
import { supabase } from '../../lib/supabase.ts';
import { SafeTextRenderer } from './SafeTextRenderer.tsx';
import { FeedbackPanel } from './feedback/FeedbackPanel.tsx';
import { AIProposalsPanel } from './ai/AIProposalsPanel.tsx';
import { DeckComment } from '../types/index.ts';
import { ComponentEditingBar } from './ComponentEditingBar.tsx';
import { DeckService } from '../services/deckService.ts';
import PreviewSlide from '../preview/components/PreviewSlide.tsx';
import { FontSelection } from './FontSelection.tsx';
import { 
  Eye, 
  Edit, 
  Palette, 
  Library, 
  Save,
  Trash2,
  Plus,
  Layout as LayoutIcon, 
  Monitor,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText, 
  Maximize,
  GripVertical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { convertHtmlToDeckSections } from '../services/HtmlToDeckConverter.ts';
import { useNavigate } from 'react-router-dom';
import { MultiSelectToolbar } from './MultiSelectToolbar.tsx';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

type ViewMode = 'vertical' | 'split';
type PanelMode = 'components' | 'themes' | 'settings' | 'feedback' | null;

interface UnifiedDeckBuilderProps {
  initialDeck?: Deck | null;
  onDeckUpdate?: (deck: Deck | null) => void;
}

const useCollapsibleNavigator = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('deckBuilder_navigatorCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleCollapsed = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('deckBuilder_navigatorCollapsed', JSON.stringify(newState));
  }, [isCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        setIsCollapsed(true);
        localStorage.setItem('deckBuilder_navigatorCollapsed', 'true');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed]);

  return { isCollapsed, toggleCollapsed };
};

const Tooltip: React.FC<{ children: React.ReactNode; content: string; show: boolean }> = ({ children, content, show }) => (
  <div className="relative">
    {children}
    {show && (
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none">
        {content}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
      </div>
    )}
  </div>
);

const CollapsibleSlideNavigator: React.FC<{
  sections: DeckSection[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onAddSection: (sectionType: SectionType) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}> = ({ sections, selectedSectionId, onSectionSelect, onAddSection, onMoveSection, isCollapsed, onToggleCollapsed }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [hoveredSlide, setHoveredSlide] = useState<string | null>(null);

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out ${
      isCollapsed ? 'w-12' : 'w-64'
    }`}>
      <div className={`border-b border-gray-200 flex items-center justify-between ${
        isCollapsed ? 'p-2' : 'p-4'
      }`}>
        {!isCollapsed && (
          <h3 className="text-sm font-medium text-gray-700">Slides</h3>
        )}
        <div className="flex items-center space-x-1">
          {!isCollapsed && (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Add slide"
              >
                <Plus className="h-4 w-4" />
              </button>
              {showAddMenu && (
                <div className="absolute right-0 z-20 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="py-1">
                    {(['hero', 'problem', 'solution', 'market', 'business-model', 'competition', 'team', 'financials', 'funding', 'next-steps', 'problemSolution', 'demoGallery', 'ctaCard', 'blank', 'executiveSummary', 'productRoadmap', 'keyMetricsDashboard', 'faqSlide', 'contactUs'] as SectionType[]).map(type => (
                       <button
                        key={type}
                        onClick={() => { onAddSection(type); setShowAddMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                       >
                        {type.replace('-', ' ')} Slide
                       </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title={isCollapsed ? 'Expand slide navigator (Ctrl+Shift+S)' : 'Collapse slide navigator (Ctrl+Shift+S)'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Droppable droppableId="slides">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto">
            {sections.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => onSectionSelect(section.id)}
                    className={`flex items-center p-2 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedSectionId === section.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                    } ${snapshot.isDragging ? 'bg-blue-100 shadow-lg' : ''}`}
                  >
                    <div {...provided.dragHandleProps} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                      <GripVertical size={18} />
                    </div>
                    <div className="flex-shrink-0 w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center font-medium text-gray-600 mx-2">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        <SafeTextRenderer html={section.title || 'Untitled Slide'} />
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {section.type.replace('-', ' ')}
                      </p>
                    </div>
                    <div className="flex flex-col ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSection(index, index - 1);
                        }}
                        disabled={index === 0}
                        className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSection(index, index + 1);
                        }}
                        disabled={index === sections.length - 1}
                        className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {isCollapsed && (
        <Tooltip content="Add slide" show={hoveredSlide === 'add'}>
            <div
              onMouseEnter={() => setHoveredSlide('add')}
              onMouseLeave={() => setHoveredSlide(null)}
              className="p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center"
              onClick={() => onAddSection('problem')}
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
          </Tooltip>
        )}
    </div>
  );
};

export function UnifiedDeckBuilder({ initialDeck, onDeckUpdate }: UnifiedDeckBuilderProps = {}) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(!initialDeck);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserDisplayNameState, setCurrentUserDisplayNameState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('vertical');
  const [activePanel, setActivePanel] = useState<PanelMode>('components');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [comments, setComments] = useState<DeckComment[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [proposalPanelRefreshKey, setProposalPanelRefreshKey] = useState(0);
  const [activeFeedbackView, setActiveFeedbackView] = useState<'comments' | 'proposals'>('comments');
  const [showHtmlImportModal, setShowHtmlImportModal] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');
  const [resizingCanvas, setResizingCanvas] = useState(false); 
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const slideViewportRef = useRef<HTMLDivElement>(null);
  const previewContentViewportRef = useRef<HTMLDivElement>(null);
  const slideCanvasContainerRef = useRef<HTMLDivElement>(null);
  const slideCanvasContainerSplitRef = useRef<HTMLDivElement>(null);

  const { isCollapsed: isNavigatorCollapsed, toggleCollapsed: toggleNavigatorCollapsed } = useCollapsibleNavigator();
  
  const {
    deck,
    hasUnsavedChanges,
    createFromTemplate,
    createEmpty, 
    addSection, 
    updateSection, 
    removeSection,
    replaceSections,
    moveSection,
    saveDeck,
    // updateDeck, // This was incorrect, useDeck exports setDeck
    setDeck, // Correct function from useDeck
  } = useDeck(initialDeck || undefined, onDeckUpdate);

  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(new Set());
  const [editingComponent, setEditingComponent] = useState<VisualComponent | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  const currentSection = useMemo(() => {
    if (!deck || !selectedSectionId) return undefined;
    return deck.sections.find((s: DeckSection) => s.id === selectedSectionId);
  }, [deck, selectedSectionId]);
  
  const [currentSectionComponents, setCurrentSectionComponents] = useState<VisualComponent[]>(currentSection?.components || []);

  useEffect(() => {
    setCurrentSectionComponents(currentSection?.components || []);
  }, [currentSection]);

  // Find the selected component object
  const selectedComponent = useMemo(() => {
    if (selectedComponentIds.size !== 1 || !currentSection) return null;
    const firstId = selectedComponentIds.values().next().value;
    return (currentSection.components || []).find(c => c.id === firstId) || null;
  }, [selectedComponentIds, currentSection]);

  // Handler to update style
  const handleUpdateComponentStyle = useCallback((style: Partial<React.CSSProperties>) => {
    if (selectedComponentIds.size === 0 || !currentSection || !updateSection) return;

    const updatedComponents = (currentSection.components || []).map(c => {
      if (selectedComponentIds.has(c.id)) {
        return { ...c, style: { ...c.style, ...style } };
      }
      return c;
    });
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  }, [selectedComponentIds, currentSection, updateSection]);
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    fontFamily: 'Inter, system-ui, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#1f2937',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#1f2937',
    fontSize: 'medium',
    slideSize: 'standard'
  });
  
  const navigate = useNavigate();

  // Debounce utility
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const calculateZoom = useCallback(() => {
    // In preview mode, calculate zoom for the slide canvas container
    if (previewMode) {
      const container = slideCanvasContainerRef.current;
      if (container && currentSection) {
        const containerRect = container.getBoundingClientRect();
        const logicalWidth = currentSection.width || 960;
        const logicalHeight = currentSection.height || 540;
        
        if (containerRect.width > 0 && containerRect.height > 0 && logicalWidth > 0 && logicalHeight > 0) {
          const scaleX = containerRect.width / logicalWidth;
          const scaleY = containerRect.height / logicalHeight;
          // Use full scale in preview mode to fill the container
          const newZoom = Math.min(scaleX, scaleY);
          setZoomLevel(newZoom);
        } else {
          setZoomLevel(1);
        }
      } else {
        setZoomLevel(1);
      }
      return;
    }

    // Normal edit mode zoom calculation
    const viewport = viewMode === 'vertical'
      ? previewContentViewportRef.current
      : (document.getElementById('slide-preview-area-split'));

    if (viewport && currentSection) {
      const rect = viewport.getBoundingClientRect();
      const padding = 32;
      const availableWidth = rect.width - padding;
      const availableHeight = rect.height - padding;
      const logicalWidth = currentSection.width || 960;
      const logicalHeight = currentSection.height || 540;

      if (availableWidth > 0 && availableHeight > 0 && logicalWidth > 0 && logicalHeight > 0) {
        const scaleX = availableWidth / logicalWidth;
        const scaleY = availableHeight / logicalHeight;
        const newZoom = Math.max(0.1, Math.min(scaleX, scaleY) * 0.95);
        setZoomLevel(newZoom);
      } else {
        setZoomLevel(0.5);
      }
    } else {
      setZoomLevel(0.5);
    }
  }, [currentSection, viewMode, previewMode]);

  useEffect(() => {
    // Log slide dimensions whenever the current section changes
    if (currentSection) {
      console.log('UnifiedDeckBuilder - Current section dimensions:', {
        sectionId: currentSection.id,
        width: currentSection.width,
        height: currentSection.height,
        defaultWidth: 960,
        defaultHeight: 540,
        effectiveWidth: currentSection.width || 960,
        effectiveHeight: currentSection.height || 540,
      });
    }
    
    calculateZoom();
    const handleResize = debounce(() => calculateZoom(), 150);

    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (slideViewportRef.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(slideViewportRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer && slideViewportRef.current) {
        observer.disconnect();
      }
    };
  }, [calculateZoom, viewMode, previewMode, currentSection]);


  const handleHtmlImport = () => {
    if (!htmlInput.trim()) {
      alert('Please paste some HTML to import.');
      return;
    }
    try {
      const newSections = convertHtmlToDeckSections(htmlInput);
      if (newSections.length > 0) {
        if (replaceSections) {
           replaceSections(newSections);
           setSelectedSectionId(newSections[0]?.id || null);
           alert(`${newSections.length} slides imported successfully!`);
        } else {
          console.warn('replaceSections function not available on useDeck. HTML import may not fully work yet.');
          alert('HTML parsing complete, but deck update logic needs finalization with useDeck hook.');
        }
      } else {
        alert('No slides could be generated from the HTML.');
      }
    } catch (error) {
      console.error("Error importing HTML:", error);
      alert(`An error occurred during HTML import: ${error instanceof Error ? error.message : String(error)}`);
    }
    setShowHtmlImportModal(false);
    setHtmlInput('');
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          setCurrentUserDisplayNameState(user.user_metadata?.full_name || user.email || 'User');
        } else {
          setCurrentUserDisplayNameState('Anonymous');
        }
      } catch (err) { 
        console.error('Error getting user:', err); 
        setCurrentUserDisplayNameState('Anonymous');
      }
    };
    getCurrentUser();
  }, []);

  const fetchComments = async (currentDeckId: string) => {
    try {
      const fetchedComments = await DeckService.getComments(currentDeckId);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  useEffect(() => {
    if (deck?.sections.length && !selectedSectionId) {
      setSelectedSectionId(deck.sections[0].id);
    }
    if (deck?.id) {
      fetchComments(deck.id);
    }
  }, [deck?.id, deck?.sections, selectedSectionId]);

  const handleResizeCanvasMove = useCallback((e: MouseEvent) => {
    if (!resizingCanvas || !currentSection) return;
    
    const containerToStyle = viewMode === 'vertical' ? slideCanvasContainerRef.current : slideCanvasContainerSplitRef.current;
    const viewport = containerToStyle?.parentElement;

    if (!containerToStyle || !viewport) return;
    
    const rect = viewport.getBoundingClientRect();
    const scrollTop = viewport.scrollTop;
    const scrollLeft = viewport.scrollLeft;

    // Calculate new dimensions, accounting for zoom level
    const newWidthUnzoomed = Math.max(320, (e.clientX - rect.left + scrollLeft) / zoomLevel);
    const newHeightUnzoomed = Math.max(180, (e.clientY - rect.top + scrollTop) / zoomLevel);
    
    console.log('Canvas resize:', {
      clientX: e.clientX,
      clientY: e.clientY,
      rectLeft: rect.left,
      rectTop: rect.top,
      scrollLeft,
      scrollTop,
      zoomLevel,
      newWidthUnzoomed,
      newHeightUnzoomed
    });
    
    containerToStyle.style.width = `${newWidthUnzoomed}px`;
    containerToStyle.style.height = `${newHeightUnzoomed}px`;

  }, [resizingCanvas, currentSection, zoomLevel, viewMode]);

  const handleResizeCanvasEnd = useCallback(() => {
    if (!resizingCanvas || !currentSection) return;
    
    setResizingCanvas(false);
    
    const containerToRead = viewMode === 'vertical' ? slideCanvasContainerRef.current : slideCanvasContainerSplitRef.current;
    if (!containerToRead) return;
    
    const width = parseInt(containerToRead.style.width);
    const height = parseInt(containerToRead.style.height);
    
    console.log('Canvas resize end:', {
      width,
      height,
      currentSectionId: currentSection.id
    });
    
    if (updateSection && currentSection && !isNaN(width) && !isNaN(height)) {
      updateSection(currentSection.id, {
        ...currentSection,
        width,
        height
      });
    }
    
    // Recalculate zoom after a short delay to ensure the DOM has updated
    setTimeout(() => {
      calculateZoom();
    }, 50);
  }, [resizingCanvas, currentSection, updateSection, viewMode, calculateZoom]);

  const handleResizeCanvasStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCanvas(true);
  };

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => handleResizeCanvasMove(e);
    const mouseUpHandler = () => handleResizeCanvasEnd();

    if (resizingCanvas) {
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }
    
    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [resizingCanvas, handleResizeCanvasMove, handleResizeCanvasEnd]);

  const handleAddComment = async (text: string, parentCommentId?: string, voiceNoteUrl?: string, markupData?: any) => {
    if (!deck || !deck.id || !currentUserId) return;
    setIsSubmittingComment(true);
    try {
      const newCommentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'reviewerSessionId' | 'feedbackWeight' | 'aiSentimentScore' | 'aiExpertiseScore' | 'aiImprovementCategory'> = {
        deckId: deck.id,
        slideId: selectedSectionId!, 
        textContent: text,
        authorUserId: currentUserId,
        authorDisplayName: currentUserDisplayNameState || 'User',
        parentCommentId: parentCommentId,
        voiceNoteUrl: voiceNoteUrl,
        markupData: markupData,
        commentType: 'General',
        urgency: 'None',
        status: 'Open',
      };
      await DeckService.addComment(deck.id, newCommentData);
      if (deck?.id) fetchComments(deck.id);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string, updates: Partial<Pick<DeckComment, 'textContent' | 'status'>>) => {
    if (!deck || !deck.id) return;
    try {
      await DeckService.updateComment(commentId, updates);
      if (deck?.id) fetchComments(deck.id); 
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleCommentStatusUpdate = async (commentId: string, status: DeckComment['status']) => {
    if (!deck || !deck.id) return;
    try {
      await DeckService.updateComment(commentId, { status });
      if (deck?.id) fetchComments(deck.id);
    } catch (error) {
      console.error(`Error updating comment ${commentId} status to ${status}:`, error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!deck || !deck.id) return;
    try {
      await DeckService.deleteComment(commentId, deck.id, currentUserId ? currentUserId : undefined);
      if (deck?.id) fetchComments(deck.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCreateDeck = (templateId: string, title: string) => {
    createFromTemplate(templateId, title);
    setShowTemplateSelector(false);
  };

  const handleAddSection = (sectionType: SectionType) => {
    const newSectionId = addSection(sectionType); 
    if (newSectionId) setSelectedSectionId(newSectionId);
  };

  const handleSaveDeck = async () => {
    console.log('[UnifiedDeckBuilder] handleSaveDeck triggered.');
    console.log('[UnifiedDeckBuilder] currentUserId:', currentUserId);
    console.log('[UnifiedDeckBuilder] deck present?:', !!deck);
    console.log('[UnifiedDeckBuilder] hasUnsavedChanges:', hasUnsavedChanges);

    if (!currentUserId) { 
      alert('Please log in to save your deck'); 
      console.log('[UnifiedDeckBuilder] Save aborted: no currentUserId.');
      return; 
    }
    if (!deck) { 
      alert('No deck to save.'); 
      console.log('[UnifiedDeckBuilder] Save aborted: no deck.');
      return; 
    }
    console.log('[UnifiedDeckBuilder] About to call saveDeck with userId:', currentUserId);
    try {
      console.log('[UnifiedDeckBuilder] saveDeck function exists?', typeof saveDeck === 'function');
      console.log('[UnifiedDeckBuilder] Starting saveDeck call...');
      // Force save even if hasUnsavedChanges is false - this ensures the save button always works
      const success = await saveDeck(currentUserId);
      console.log('[UnifiedDeckBuilder] saveDeck returned:', success);
      if (success) alert('Deck saved successfully!');
    } catch (err) { 
      // Properly type the error for TypeScript
      const error = err as Error;
      console.error('[UnifiedDeckBuilder] Save error details:', error);
      console.error('[UnifiedDeckBuilder] Error name:', error.name);
      console.error('[UnifiedDeckBuilder] Error message:', error.message); 
      console.error('[UnifiedDeckBuilder] Error stack:', error.stack);
      alert('Failed to save deck. Please try again.'); 
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedComponentIds(new Set());
  };

  const handleAddComponent = (componentType: BlockType) => {
    if (!currentSection) return;
    const blockMeta = BLOCK_REGISTRY[componentType];
    if (!blockMeta) { console.error(`No metadata for type: ${componentType}`); return; }

    const initialWidth = 200;
    const initialHeight = 100;
    const newComponent: VisualComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType,
      data: { ...(blockMeta.sampleData || {}) },
      layout: { x: 50, y: 50, width: initialWidth, height: initialHeight, baseWidth: initialWidth, baseHeight: initialHeight, zIndex: (currentSection.components?.length || 0) + 1 }, 
      order: (currentSection.components?.length || 0) + 1,
    };
    
    const updatedComponents = [...(currentSection.components || []), newComponent];
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
    setSelectedComponentIds(new Set([newComponent.id]));
  };
  
  const handleComponentUpdate = (componentId: string, newData: any) => {
    if (!currentSection) return;
    const updatedComponents = (currentSection.components || []).map(c => 
      c.id === componentId ? { ...c, data: newData } : c
    );
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  };

  const handleSelectComponent = (componentId: string | null, multiSelect = false): void => {
    if (componentId === null) {
      setSelectedComponentIds(new Set());
      return;
    }
  
    setSelectedComponentIds(prevIds => {
      if (multiSelect) {
        const newIds = new Set(prevIds);
        if (newIds.has(componentId)) {
          newIds.delete(componentId);
        } else {
          newIds.add(componentId);
        }
        return newIds;
      } else {
        // If not multi-selecting, and the component is already the only one selected, do nothing.
        if (prevIds.size === 1 && prevIds.has(componentId)) {
          return prevIds;
        }
        return new Set([componentId]);
      }
    });
  };

  const handleComponentDelete = (componentId: string) => {
    if (!currentSection) return;
    const updatedComponents = (currentSection.components || []).filter(c => c.id !== componentId);
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
    setSelectedComponentIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.delete(componentId);
      return newIds;
    });
  };

  const handleThemeChange = (newThemeSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...themeSettings, ...newThemeSettings };
    setThemeSettings(updatedSettings);

    if (deck && setDeck) { // Corrected from updateDeck to setDeck
      const newDeckTheme: DeckTheme = {
        id: deck.theme?.id || 'custom-theme-' + Date.now(), // Ensure a unique ID if new
        name: deck.theme?.name || 'Custom Theme',
        colors: {
          primary: updatedSettings.primaryColor || deck.theme?.colors?.primary || '#3b82f6',
          secondary: updatedSettings.secondaryColor || deck.theme?.colors?.secondary || '#1f2937',
          accent: updatedSettings.accentColor || deck.theme?.colors?.accent || '#10b981',
          background: updatedSettings.backgroundColor || deck.theme?.colors?.background || '#ffffff', // App background
          text: updatedSettings.textColor || deck.theme?.colors?.text || '#1f2937',
          slideBackground: updatedSettings.background || updatedSettings.backgroundColor || deck.theme?.colors?.slideBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Slide background
        },
        fonts: {
          heading: updatedSettings.fontFamily || deck.theme?.fonts?.heading || 'Inter, system-ui, sans-serif',
          body: updatedSettings.fontFamily || deck.theme?.fonts?.body || 'Inter, system-ui, sans-serif',
          caption: updatedSettings.fontFamily || deck.theme?.fonts?.caption || 'Inter, system-ui, sans-serif',
        },
      };
      // Use setDeck to update the entire deck object with the new theme
      setDeck({ ...deck, theme: newDeckTheme }); 
      console.log('[UnifiedDeckBuilder] Deck theme updated in useDeck state via setDeck:', newDeckTheme);
    } else {
      console.warn('[UnifiedDeckBuilder] Cannot update deck theme: deck or setDeck is not available.');
    }
  };

  const handleOpenComponentEditor = (component: VisualComponent) => setEditingComponent(component);
  const handleCloseComponentEditor = () => setEditingComponent(null);

  const mapThemeSettingsToEditorColorTheme = (settings: ThemeSettings): EditorColorTheme => {
    return {
      id: deck?.theme?.id || 'custom-theme-for-editor',
      name: deck?.theme?.name || 'Custom Theme for Editor',
      primary: settings.primaryColor,
      secondary: settings.secondaryColor,
      accent: settings.accentColor,
      background: settings.backgroundColor,
      text: settings.textColor,
      textMuted: settings.textColorOnSecondary || '#6b7280',
      border: '#e5e7eb',
    };
  };

  const handleUpdateComponentLayout = (componentId: string, newLayout: Partial<VisualComponentLayout>): void => { 
    if (!currentSection) return;

    // Find the component to update
    const componentToUpdate = currentSection.components?.find(c => c.id === componentId);
    if (!componentToUpdate) {
      console.error(`Component with ID ${componentId} not found in section ${currentSection.id}`);
      return;
    }

    // Create a sanitized layout object with valid values only
    const sanitizedLayout: Partial<VisualComponentLayout> = {};
    
    // Sanitize x coordinate
    if (newLayout.x !== undefined) {
      if (Number.isFinite(newLayout.x)) {
        sanitizedLayout.x = newLayout.x;
      } else {
        console.warn(`Invalid x value for component ${componentId}:`, newLayout.x);
        sanitizedLayout.x = componentToUpdate.layout.x; // Keep existing value
      }
    }
    
    // Sanitize y coordinate
    if (newLayout.y !== undefined) {
      if (Number.isFinite(newLayout.y)) {
        sanitizedLayout.y = newLayout.y;
      } else {
        console.warn(`Invalid y value for component ${componentId}:`, newLayout.y);
        sanitizedLayout.y = componentToUpdate.layout.y; // Keep existing value
      }
    }
    
    // Sanitize width
    if (newLayout.width !== undefined) {
      if (Number.isFinite(newLayout.width) && newLayout.width > 0) {
        sanitizedLayout.width = Math.max(20, newLayout.width); // Min width 20px
      } else {
        console.warn(`Invalid width value for component ${componentId}:`, newLayout.width);
        sanitizedLayout.width = componentToUpdate.layout.width; // Keep existing value
      }
    }
    
    // Sanitize height
    if (newLayout.height !== undefined) {
      if (Number.isFinite(newLayout.height) && newLayout.height > 0) {
        sanitizedLayout.height = Math.max(20, newLayout.height); // Min height 20px
      } else {
        console.warn(`Invalid height value for component ${componentId}:`, newLayout.height);
        sanitizedLayout.height = componentToUpdate.layout.height; // Keep existing value
      }
    }
    
    // Sanitize zIndex
    if (newLayout.zIndex !== undefined) {
      if (Number.isFinite(newLayout.zIndex)) {
        sanitizedLayout.zIndex = newLayout.zIndex;
      } else {
        console.warn(`Invalid zIndex value for component ${componentId}:`, newLayout.zIndex);
        sanitizedLayout.zIndex = componentToUpdate.layout.zIndex; // Keep existing value
      }
    }

    // Create a new component with the updated layout
    const updatedComponent = {
      ...componentToUpdate,
      layout: {
        ...componentToUpdate.layout,
        ...sanitizedLayout
      }
    };

    // Create a new components array with the updated component
    const updatedComponents = (currentSection.components || []).map(c =>
      c.id === componentId ? updatedComponent : c
    );

    // Log the update for debugging
    console.log('Updating component layout:', {
      componentId,
      originalLayout: componentToUpdate.layout,
      newLayoutRequest: newLayout,
      sanitizedLayout,
      finalLayout: updatedComponent.layout
    });

    // First update local state for immediate UI feedback
    setCurrentSectionComponents(updatedComponents);
    
    // Then update the section with the new components array
    // This ensures we get immediate visual feedback during drag/resize operations
    updateSection(currentSection.id, { 
      ...currentSection, 
      components: updatedComponents 
    });
  };

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!currentSection || selectedComponentIds.size < 2) return;

    const componentsToUpdate = (currentSection.components || []).filter(c => selectedComponentIds.has(c.id));
    if (componentsToUpdate.length < 2) return;

    const layouts = componentsToUpdate.map(c => c.layout);

    let targetX: number | undefined;
    let targetY: number | undefined;

    switch (alignment) {
      case 'left':
        targetX = Math.min(...layouts.map(l => l.x));
        break;
      case 'center':
        const minX = Math.min(...layouts.map(l => l.x));
        const maxX = Math.max(...layouts.map(l => l.x + l.width));
        const centerX = (minX + maxX) / 2;
        targetX = centerX;
        break;
      case 'right':
        targetX = Math.max(...layouts.map(l => l.x + l.width));
        break;
      case 'top':
        targetY = Math.min(...layouts.map(l => l.y));
        break;
      case 'middle':
        const minY = Math.min(...layouts.map(l => l.y));
        const maxY = Math.max(...layouts.map(l => l.y + l.height));
        const centerY = (minY + maxY) / 2;
        targetY = centerY;
        break;
      case 'bottom':
        targetY = Math.max(...layouts.map(l => l.y + l.height));
        break;
    }

    const updatedComponents = (currentSection.components || []).map(c => {
      if (selectedComponentIds.has(c.id)) {
        const newLayout = { ...c.layout };
        if (targetX !== undefined) {
          if (alignment === 'center') {
            newLayout.x = targetX - c.layout.width / 2;
          } else if (alignment === 'right') {
            newLayout.x = targetX - c.layout.width;
          } else {
            newLayout.x = targetX;
          }
        }
        if (targetY !== undefined) {
          if (alignment === 'middle') {
            newLayout.y = targetY - c.layout.height / 2;
          } else if (alignment === 'bottom') {
            newLayout.y = targetY - c.layout.height;
          } else {
            newLayout.y = targetY;
          }
        }
        return { ...c, layout: newLayout };
      }
      return c;
    });

    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  };

  const handleDistribute = (distribution: 'horizontal' | 'vertical') => {
    if (!currentSection || selectedComponentIds.size < 3) return;

    const componentsToUpdate = (currentSection.components || [])
      .filter(c => selectedComponentIds.has(c.id))
      .sort((a, b) => distribution === 'horizontal' ? a.layout.x - b.layout.x : a.layout.y - b.layout.y);

    if (componentsToUpdate.length < 3) return;

    if (distribution === 'horizontal') {
      const minX = componentsToUpdate[0].layout.x;
      const maxX = componentsToUpdate[componentsToUpdate.length - 1].layout.x;
      const totalWidth = componentsToUpdate.reduce((sum, c) => sum + c.layout.width, 0);
      const spacing = (maxX - minX - totalWidth) / (componentsToUpdate.length - 1);
      
      let currentX = minX + componentsToUpdate[0].layout.width + spacing;
      for (let i = 1; i < componentsToUpdate.length - 1; i++) {
        componentsToUpdate[i].layout.x = currentX;
        currentX += componentsToUpdate[i].layout.width + spacing;
      }
    } else {
      const minY = componentsToUpdate[0].layout.y;
      const maxY = componentsToUpdate[componentsToUpdate.length - 1].layout.y;
      const totalHeight = componentsToUpdate.reduce((sum, c) => sum + c.layout.height, 0);
      const spacing = (maxY - minY - totalHeight) / (componentsToUpdate.length - 1);

      let currentY = minY + componentsToUpdate[0].layout.height + spacing;
      for (let i = 1; i < componentsToUpdate.length - 1; i++) {
        componentsToUpdate[i].layout.y = currentY;
        currentY += componentsToUpdate[i].layout.height + spacing;
      }
    }

    const updatedComponents = (currentSection.components || []).map(c => {
      const updated = componentsToUpdate.find(uc => uc.id === c.id);
      return updated || c;
    });

    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  };

  const handleMatchSize = (dimension: 'width' | 'height' | 'both') => {
    if (!currentSection || selectedComponentIds.size < 2) return;

    const componentsToUpdate = (currentSection.components || []).filter(c => selectedComponentIds.has(c.id));
    if (componentsToUpdate.length < 2) return;

    const firstComponentLayout = componentsToUpdate[0].layout;

    const updatedComponents = (currentSection.components || []).map(c => {
      if (selectedComponentIds.has(c.id)) {
        const newLayout = { ...c.layout };
        if (dimension === 'width' || dimension === 'both') {
          newLayout.width = firstComponentLayout.width;
        }
        if (dimension === 'height' || dimension === 'both') {
          newLayout.height = firstComponentLayout.height;
        }
        return { ...c, layout: newLayout };
      }
      return c;
    });

    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  };

  const handleGroup = () => {
    // Grouping logic here
  };

  const handleUngroup = () => {
    // Ungrouping logic here
  };

  const handleBringToFront = () => {
    // Bring to front logic here
  };

  const handleSendToBack = () => {
    // Send to back logic here
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (source.droppableId === 'slides') {
      moveSection(source.index, destination.index);
    }
  };

  const handleDeleteSelected = () => {
    if (!currentSection) return;
    const updatedComponents = (currentSection.components || []).filter(c => !selectedComponentIds.has(c.id));
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
    setSelectedComponentIds(new Set());
  };

  if (showTemplateSelector || !deck) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gray-50 z-50 flex items-center justify-center">
        <TemplateSelector
          onSelectTemplate={handleCreateDeck}
          onCreateEmpty={(title: string) => { 
            createEmpty(title);
            setShowTemplateSelector(false);
          }}
          onCancel={() => { if (deck) setShowTemplateSelector(false); }}
        />
      </div>
    );
  }
  
  if (!deck) return <div className="p-8 text-center">Loading deck or create a new one...</div>;

  const editorPaneContent = currentSection ? (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Slide Title</label>
        <input
          type="text"
          value={currentSection.title || ''}
          onChange={(e) => updateSection(currentSection.id, { ...currentSection, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter slide title"
        />
      </div>

      {/* Slide Specific Background Controls */}
      {/* Canvas Size Controls */}
      <div className="mt-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Canvas Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={currentSection?.width || 960}
              onChange={(e) => {
                const width = parseInt(e.target.value) || 960;
                if (currentSection && updateSection && width > 0) {
                  updateSection(currentSection.id, { ...currentSection, width });
                }
              }}
              min="320"
              max="1920"
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={currentSection?.height || 540}
              onChange={(e) => {
                const height = parseInt(e.target.value) || 540;
                if (currentSection && updateSection && height > 0) {
                  updateSection(currentSection.id, { ...currentSection, height });
                }
              }}
              min="180"
              max="1080"
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            onClick={() => {
              if (currentSection && updateSection) {
                updateSection(currentSection.id, { ...currentSection, width: 1920, height: 1080 });
              }
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            1920×1080
          </button>
          <button
            onClick={() => {
              if (currentSection && updateSection) {
                updateSection(currentSection.id, { ...currentSection, width: 1280, height: 720 });
              }
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            1280×720
          </button>
          <button
            onClick={() => {
              if (currentSection && updateSection) {
                updateSection(currentSection.id, { ...currentSection, width: 960, height: 540 });
              }
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            960×540
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Slide Background (Gradient/Image URL)</label>
        <input
          type="text"
          value={currentSection?.slideStyle?.background || ''}
          onChange={(e) => {
            if (currentSection && updateSection) {
              const newSlideStyle = { ...currentSection.slideStyle };
              if (e.target.value) {
                newSlideStyle.background = e.target.value;
                delete newSlideStyle.backgroundColor; // Clear solid color if setting gradient/image
              } else {
                delete newSlideStyle.background; // Clear gradient/image if input is empty
              }
              updateSection(currentSection.id, { ...currentSection, slideStyle: newSlideStyle });
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          placeholder="e.g., linear-gradient(...) or url(...)"
        />
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Slide Background Color (Solid)</label>
        <div className="flex items-center">
          <input
            type="color"
            value={currentSection?.slideStyle?.backgroundColor || '#ffffff'}
            onChange={(e) => {
              if (currentSection && updateSection) {
                // When setting a solid color, clear the general 'background' property
                const newSlideStyle = { ...currentSection.slideStyle, backgroundColor: e.target.value };
                delete newSlideStyle.background; 
                updateSection(currentSection.id, { ...currentSection, slideStyle: newSlideStyle });
              }
            }}
            className="w-8 h-8 p-0 border-none rounded cursor-pointer"
          />
          <span className="ml-2 text-xs text-gray-600">{currentSection?.slideStyle?.backgroundColor || 'No solid color set'}</span>
           <button
            onClick={() => {
              if (currentSection && updateSection) {
                const newSlideStyle = { ...currentSection.slideStyle };
                delete newSlideStyle.backgroundColor;
                // Also delete 'background' to fully revert to theme default for this aspect
                delete newSlideStyle.background; 
                // If slideStyle becomes empty, it will correctly fall back to theme
                if (Object.keys(newSlideStyle).length === 0) {
                  updateSection(currentSection.id, { ...currentSection, slideStyle: undefined });
                } else {
                  updateSection(currentSection.id, { ...currentSection, slideStyle: newSlideStyle });
                }
              }
            }}
            className="ml-3 text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            title="Clear solid background color"
          >
            Clear Color
          </button>
        </div>
      </div>
      <div className="mt-4">
        <FontSelection
          selectedFont={currentSection?.slideStyle?.fontFamily || deck.theme?.fonts?.body || 'Inter, system-ui, sans-serif'}
          onFontChange={(font) => {
            if (currentSection && updateSection) {
              const newSlideStyle = { ...currentSection.slideStyle, fontFamily: font };
              updateSection(currentSection.id, { ...currentSection, slideStyle: newSlideStyle });
            }
          }}
        />
      </div>
      {/* End Slide Specific Background Controls */}

      <button
        onClick={() => {
          const currentIdx = deck.sections.findIndex(s => s.id === currentSection.id);
          removeSection(currentSection.id);
          if (deck.sections.length > 1) {
            setSelectedSectionId(deck.sections[Math.max(0, currentIdx -1)]?.id || deck.sections[0]?.id || null);
          } else {
            setSelectedSectionId(null);
          }
        }}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center"
      >
        <Trash2 className="h-4 w-4 mr-2" /> Remove Slide
      </button>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Components on this Slide</h3>
        {(currentSection.components || []).length === 0 && (
          <p className="text-sm text-gray-500">No components added yet.</p>
        )}
        <div className="space-y-2">
          {(currentSection.components || []).map((vc: VisualComponent) => (
            <div key={vc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-sm text-gray-700">{BLOCK_REGISTRY[vc.type as BlockType]?.label || vc.type}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleOpenComponentEditor(vc)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleComponentDelete(vc.id)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setActivePanel('components')}
          className="mt-4 px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
        >
          <Plus size={14} className="mr-1" /> Add Component
        </button>
      </div>
    </div>
  ) : <p className="text-gray-500 p-4">Select a slide to edit.</p>;

  const currentDeckThemeForPreview: DeckTheme = deck?.theme ? {
    ...deck.theme,
    fonts: {
      ...deck.theme.fonts,
      body: currentSection?.slideStyle?.fontFamily || deck.theme.fonts.body,
    }
  } : {
    id: 'default-inline-theme',
    name: 'Default Inline Theme',
    colors: {
      primary: themeSettings.primaryColor || '#3b82f6',
      secondary: themeSettings.secondaryColor || '#1f2937',
      accent: themeSettings.accentColor || '#10b981',
      background: themeSettings.backgroundColor || '#ffffff',
      text: themeSettings.textColor || '#1f2937',
      slideBackground: themeSettings.background || themeSettings.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    fonts: {
      body: currentSection?.slideStyle?.fontFamily || themeSettings.fontFamily || 'Inter, system-ui, sans-serif',
      heading: currentSection?.slideStyle?.fontFamily || themeSettings.fontFamily || 'Inter, system-ui, sans-serif',
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full h-full bg-gray-100 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            <SafeTextRenderer html={deck.title || 'Untitled Deck'} />
          </h1>
          <span className="text-xs sm:text-sm text-gray-500 hidden md:inline">
            {deck.sections.length} slides
          </span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="flex rounded-md border border-gray-300 p-0.5">
            <button
              onClick={() => setViewMode('vertical')}
              title="Vertical View"
              className={`px-2 py-1 text-xs font-medium rounded-l-md flex items-center space-x-1 ${
                viewMode === 'vertical' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutIcon size={16} />
              <span className="hidden sm:inline">Vertical</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split View"
              className={`px-2 py-1 text-xs font-medium rounded-r-md flex items-center space-x-1 ${
                viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Monitor size={16} />
              <span className="hidden sm:inline">Split</span>
            </button>
          </div>
          <button
            onClick={() => setActivePanel(activePanel === 'components' ? null : 'components')}
            title="Components"
            className={`p-2 text-sm font-medium rounded-md flex items-center space-x-1 ${
              activePanel === 'components' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Library size={18} />
            <span className="hidden lg:inline">Components</span>
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'themes' ? null : 'themes')}
            title="Themes"
            className={`p-2 text-sm font-medium rounded-md flex items-center space-x-1 ${
              activePanel === 'themes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Palette size={18} />
            <span className="hidden lg:inline">Themes</span>
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'feedback' ? null : 'feedback')}
            title="Feedback"
            className={`p-2 text-sm font-medium rounded-md flex items-center space-x-1 ${
              activePanel === 'feedback' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={18} />
            <span className="hidden lg:inline">Feedback</span>
          </button>
          <button
            onClick={handleSaveDeck}
            // Always enable the save button for better UX
            disabled={false}
            title="Save Deck"
            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <Save size={16} />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? "Exit Preview Mode" : "Enter Preview Mode"}
            className={`p-2 text-sm font-medium rounded-md flex items-center space-x-1 ${
              previewMode ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye size={18} />
            <span className="hidden lg:inline">{previewMode ? "Preview On" : "Preview Off"}</span>
          </button>
          <button
            onClick={() => setShowHtmlImportModal(true)}
            title="Import from HTML"
            className="p-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 flex items-center space-x-1"
          >
            <FileText size={18} />
            <span className="hidden lg:inline">Import HTML</span>
          </button>
        </div>
      </div>

      {showHtmlImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Import HTML to Slides</h2>
            <p className="text-sm text-gray-600 mb-1">Paste your HTML content below.</p>
            <p className="text-xs text-gray-500 mb-3">
              {"Use `<hr />` tags to separate slides. Headings (`<h1>`-`<h6>`), paragraphs (`<p>`), images (`<img>`), lists (`<ul>`, `<ol>`), code blocks (`<pre>`), blockquotes (`<blockquote>`), and tables (`<table>`) will be converted."}
            </p>
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded-md mb-4 font-mono text-sm"
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="<h1>Slide 1 Title</h1><p>Content...</p><hr /><h1>Slide 2 Title</h1>..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowHtmlImportModal(false);
                  setHtmlInput('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleHtmlImport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Convert and Import
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex w-full min-h-0 overflow-x-auto border-t border-gray-300">
        <CollapsibleSlideNavigator
          sections={deck.sections}
          selectedSectionId={selectedSectionId}
          onSectionSelect={handleSectionSelect}
          onAddSection={handleAddSection}
          onMoveSection={(from, to) => moveSection(from, to)}
          isCollapsed={isNavigatorCollapsed}
          onToggleCollapsed={toggleNavigatorCollapsed}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-gray-200 overflow-hidden"> 
        {/* Editing Bar */}
        {selectedComponent && (
          <ComponentEditingBar
            component={selectedComponent}
            onUpdateLayout={layout => handleUpdateComponentLayout(selectedComponent.id, layout)}
            onUpdateStyle={handleUpdateComponentStyle}
            onUpdateData={data => handleComponentUpdate(selectedComponent.id, data)}
          />
        )}
          <div 
            ref={slideViewportRef} 
            className="flex-1 flex flex-col overflow-auto p-4 space-y-4"
            id={viewMode === 'vertical' ? "slide-preview-area-vertical" : undefined}
          >
            {viewMode === 'vertical' ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex-shrink-0">
                  <h2 className="text-md sm:text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <Edit size={20} className="mr-2 text-blue-600" />
                    Edit Slide
                  </h2>
                  {editorPaneContent}
                </div>
                
                <div className="bg-white rounded-lg shadow flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-md sm:text-lg font-semibold text-gray-800 flex items-center">
                      <Eye size={20} className="mr-2 text-blue-600" />
                      Preview
                    </h2>
                    <div className="flex items-center space-x-2">
                      {previewMode && (
                        <div className="flex items-center space-x-2">
                          <label htmlFor="preview-zoom" className="text-xs text-gray-600">Zoom:</label>
                          <input
                            id="preview-zoom"
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.05"
                            value={previewZoom}
                            onChange={(e) => setPreviewZoom(parseFloat(e.target.value))}
                            className="w-24"
                          />
                          <span className="text-xs text-gray-600">{Math.round(previewZoom * 100)}%</span>
                        </div>
                      )}
                      {deck && deck.id && (
                        <button
                          onClick={handleSaveDeck}
                          disabled={false}
                          title="Save Deck"
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <Save size={18} />
                        </button>
                      )}
                      {deck && deck.id && (
                        <button
                          onClick={() => navigate(`/deck-builder/preview/${deck.id}`)}
                          title="Full Screen Preview"
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <Maximize size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div 
                    ref={previewContentViewportRef}
                    className={`overflow-hidden flex-1 flex justify-center items-center ${
                      previewMode ? '' : 'p-4 bg-gray-100'
                    }`}
                    style={{ 
                      width: '100%',
                      height: '100%'
                    }} 
                  >
{currentSection ? (
  previewMode ? (
    <div
      ref={slideCanvasContainerRef}
      id="slide-canvas-container"
      className="relative w-full h-full overflow-hidden"
      style={{
        // Let the slide background show through - no black background
      }}
    >
                    <PreviewSlide
                      key={currentSection.id}
                      section={currentSection}
                      theme={currentDeckThemeForPreview}
                      zoomLevel={previewZoom}
                      logicalWidth={currentSection.width || 960}
                      logicalHeight={currentSection.height || 540}
                      previewMode={true}
                      onSelect={undefined}
                      onUpdateLayout={undefined}
                      onOpenEditor={undefined}
                      onDeleteComponent={undefined}
                      selectedComponentIds={undefined}
                      onAddComponentRequested={undefined}
                    />
                  </div>
  ) : (
    <div 
      ref={slideCanvasContainerRef} 
      id="slide-canvas-container" 
      className="relative bg-white" 
      style={{ 
        width: `${currentSection?.width || 960}px`, 
        height: `${currentSection?.height || 540}px`,
        minWidth: '960px', 
        minHeight: '540px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
      }}
    >
      <PreviewSlide
        key={currentSection.id}
        section={currentSection}
        theme={currentDeckThemeForPreview}
        zoomLevel={zoomLevel} 
        logicalWidth={currentSection?.width || 960} 
        logicalHeight={currentSection?.height || 540} 
        previewMode={false}
        onSelect={handleSelectComponent}
        onUpdateLayout={handleUpdateComponentLayout}
        onOpenEditor={(id: string) => {
          const component = currentSection.components?.find(c => c.id === id);
          if (component) handleOpenComponentEditor(component);
        }}
        onDeleteComponent={(id: string) => handleComponentDelete(id)}
        selectedComponentIds={selectedComponentIds}
      />
      <div
        ref={slideCanvasContainerRef}
        className="resize-handle-wrapper"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '24px',
          height: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="resize-handle"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 3px rgba(0,0,0,0.5)',
            cursor: 'nwse-resize',
            zIndex: 1000,
          }}
          onMouseDown={handleResizeCanvasStart}
          title="Resize Slide Canvas"
        />
      </div>
    </div>
  )
) : <p className="p-8 text-center text-gray-500">Select a slide to preview.</p>}
                  </div>
                </div>
              </>
            ) : ( 
              <div className="flex-1 flex min-h-0 h-full"> 
                <div className="w-1/2 min-w-[350px] p-0 border-r border-gray-300 overflow-auto h-full"> 
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-full">
                    <h2 className="text-md sm:text-lg font-semibold mb-3 text-gray-800 flex items-center">
                      <Edit size={20} className="mr-2 text-blue-600" />
                      Edit Slide
                    </h2>
                    {editorPaneContent}
                  </div>
                </div>
                <div 
                  id="slide-preview-area-split" 
                  ref={viewMode === 'split' ? slideViewportRef : null} 
                  className="w-1/2 min-w-[350px] p-0 overflow-auto max-w-full h-full flex justify-center items-center bg-gray-100"
                > 
                  {currentSection ? (
                    <div 
                      ref={slideCanvasContainerSplitRef} 
                      id="slide-canvas-container-split" 
                      className="relative bg-white" 
                      style={{ 
                        width: `${currentSection?.width || 960}px`, 
                        height: `${currentSection?.height || 540}px`,
                        minWidth: '960px', 
                        minHeight: '540px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      <PreviewSlide
                        section={currentSection}
                        theme={currentDeckThemeForPreview}
                        zoomLevel={zoomLevel} 
                        logicalWidth={currentSection?.width || 960}
                        logicalHeight={currentSection?.height || 540}
                        previewMode={previewMode}
                        onSelect={!previewMode ? handleSelectComponent : undefined}
                        onUpdateLayout={!previewMode ? handleUpdateComponentLayout : undefined}
                        onOpenEditor={!previewMode ? (id: string) => {
                          const component = currentSection.components?.find(c => c.id === id);
                          if (component) handleOpenComponentEditor(component);
                        } : undefined}
        onDeleteComponent={!previewMode ? (id: string) => handleComponentDelete(id) : undefined}
        selectedComponentIds={!previewMode ? selectedComponentIds : undefined}
      />
      {!previewMode && (
        <div
                          className="resize-handle-wrapper"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '24px',
                            height: '24px',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div
                            className="resize-handle"
                            style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: 'rgba(59, 130, 246, 0.9)',
                              borderRadius: '50%',
                              border: '2px solid white',
                              boxShadow: '0 0 3px rgba(0,0,0,0.5)',
                              cursor: 'nwse-resize',
                              zIndex: 1000,
                            }}
                            onMouseDown={handleResizeCanvasStart}
                            title="Resize Slide Canvas"
                          />
                        </div>
                      )}
                    </div>
                  ) : <p className="p-8 text-center text-gray-500">Select a slide to preview.</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {activePanel && (
          <div
            className={`
              bg-white border-l border-gray-300 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
              ${activePanel ? 'w-72 sm:w-80' : 'w-0'}
              fixed right-0 top-0 h-full z-50 shadow-lg
              lg:static lg:z-auto lg:shadow-none
            `}
            style={{ width: 'clamp(288px, 22vw, 400px)', maxWidth: '100vw' }}
          >
            <div className="flex-1 overflow-y-auto p-1">
              {activePanel === 'components' && (
                <ComponentLibraryPanel onAddComponent={handleAddComponent} />
              )}
              {activePanel === 'themes' && (
                <ThemeCustomizationPanel
                  deck={deck}
                  initialSettings={themeSettings}
                  onThemeChange={handleThemeChange}
                  onClose={() => setActivePanel(null)}
                />
              )}
              {activePanel === 'feedback' && deck && deck.id && (
                <div className="flex flex-col h-full">
                  <div className="p-2 border-b border-gray-200">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveFeedbackView('comments')}
                        className={`px-3 py-1.5 text-xs rounded-md ${activeFeedbackView === 'comments' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Comments
                      </button>
                      <button
                        onClick={() => setActiveFeedbackView('proposals')}
                        className={`px-3 py-1.5 text-xs rounded-md ${activeFeedbackView === 'proposals' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        AI Suggestions
                      </button>
                    </div>
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    {activeFeedbackView === 'comments' && (
                      <FeedbackPanel
                        deckId={deck.id}
                        currentDeck={deck}
                        comments={comments}
                        onCommentSubmit={handleAddComment}
                        onCommentUpdate={handleUpdateComment} 
                        onCommentDelete={handleDeleteComment}
                        onCommentStatusUpdate={handleCommentStatusUpdate} 
                        onCommentsNeedRefresh={() => deck?.id && fetchComments(deck.id)}
                        isAdminOrDeckOwnerView={true} 
                        currentUserId={currentUserId}
                        currentUserDisplayName={currentUserDisplayNameState}
                        selectedSlideId={selectedSectionId}
                        isSubmittingComment={isSubmittingComment}
                        highlightedCommentId={highlightedCommentId}
                        onProposalsGenerated={() => {
                          console.log('Proposals generated, refreshing panel and switching view.');
                          setProposalPanelRefreshKey(prevKey => prevKey + 1);
                          setActiveFeedbackView('proposals');
                        }}
                      />
                    )}
                    {activeFeedbackView === 'proposals' && currentSection && ( 
                      <AIProposalsPanel 
                        deckId={deck.id}
                        selectedSlideId={currentSection.id} 
                        refreshKey={proposalPanelRefreshKey}
                      />
                    )}
                    {activeFeedbackView === 'proposals' && !currentSection && (
                       <p className="p-4 text-sm text-gray-500">Select a slide to see AI suggestions.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <VisualComponentEditorModal
        component={editingComponent}
        isOpen={!!editingComponent}
        onClose={handleCloseComponentEditor}
        onUpdate={(componentId, newData) => {
          if (currentSection) { 
            handleComponentUpdate(componentId, newData); 
          }
        }}
        onDelete={(componentId) => {
          if (currentSection) { 
            handleComponentDelete(componentId); 
          }
        }}
        currentTheme={mapThemeSettingsToEditorColorTheme(themeSettings)} 
      />
      {selectedComponentIds.size > 1 && (
        <MultiSelectToolbar
          onAlign={handleAlign}
          onDistribute={handleDistribute}
          onMatchSize={handleMatchSize}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onDelete={handleDeleteSelected}
        />
      )}
    </div>
    </DragDropContext>
  );
}
