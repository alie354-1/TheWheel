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
import SafeTextRenderer from './SafeTextRenderer.tsx';
import { FeedbackPanel } from './feedback/FeedbackPanel.tsx';
import { AIProposalsPanel } from './ai/AIProposalsPanel.tsx';
import { DeckComment } from '../types/index.ts';
import { ComponentEditingBar } from './ComponentEditingBar.tsx';
import { DeckService } from '../services/deckService.ts';
import PreviewSlide from '../preview/components/PreviewSlide.tsx';
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
  Maximize
} from 'lucide-react';
import { convertHtmlToDeckSections } from '../services/HtmlToDeckConverter.ts';
import { useNavigate } from 'react-router-dom';

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
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}> = ({ sections, selectedSectionId, onSectionSelect, onAddSection, isCollapsed, onToggleCollapsed }) => {
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
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, index) => {
          const isSelected = selectedSectionId === section.id;
          const slideTitle = section.title || 'Untitled Slide';
          if (isCollapsed) {
            return (
              <Tooltip key={section.id} content={`${index + 1}. ${slideTitle}`} show={hoveredSlide === section.id}>
                <div
                  onClick={() => onSectionSelect(section.id)}
                  onMouseEnter={() => setHoveredSlide(section.id)}
                  onMouseLeave={() => setHoveredSlide(null)}
                  className={`p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center ${
                    isSelected ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                  }`}
                >
                  <div className="w-6 h-4 bg-gray-200 rounded text-xs flex items-center justify-center font-medium text-gray-600">
                    {index + 1}
                  </div>
                </div>
              </Tooltip>
            );
          }
          return (
            <div
              key={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center font-medium text-gray-600">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate"> 
                    <SafeTextRenderer content={slideTitle} />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {section.type.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
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
    saveDeck,
    // updateDeck, // This was incorrect, useDeck exports setDeck
    setDeck, // Correct function from useDeck
  } = useDeck(initialDeck || undefined, onDeckUpdate);

  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(undefined);
  const [editingComponent, setEditingComponent] = useState<VisualComponent | null>(null);
  
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
    if (!selectedComponentId || !currentSection) return null;
    return (currentSection.components || []).find(c => c.id === selectedComponentId) || null;
  }, [selectedComponentId, currentSection]);

  // Handler to update style
  const handleUpdateComponentStyle = useCallback((style: Partial<React.CSSProperties>) => {
    console.log('[UnifiedDeckBuilder] handleUpdateComponentStyle called with:', style);
    if (!selectedComponent || !currentSection || !updateSection) {
      console.warn('[UnifiedDeckBuilder] handleUpdateComponentStyle: missing selectedComponent, currentSection, or updateSection');
      return;
    }
    console.log('[UnifiedDeckBuilder] Current selectedComponent:', selectedComponent);
    console.log('[UnifiedDeckBuilder] Current currentSection before update:', currentSection);
    const updatedComponents = (currentSection.components || []).map(c =>
      c.id === selectedComponent.id
        ? { ...c, style: { ...c.style, ...style } }
        : c
    );
    console.log('[UnifiedDeckBuilder] updatedComponents for style change:', updatedComponents);
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  }, [selectedComponent, currentSection, updateSection]);
  
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

  const calculateZoom = useCallback(() => {
    const viewport = viewMode === 'vertical' 
      ? slideViewportRef.current 
      : (document.getElementById('slide-preview-area-split') || slideViewportRef.current);

    if (viewport && currentSection) {
      const viewportWidth = viewport.offsetWidth;
      const viewportHeight = viewport.offsetHeight;
      const logicalWidth = currentSection.width || 960;
      const logicalHeight = currentSection.height || 540;

      if (viewportWidth > 0 && viewportHeight > 0 && logicalWidth > 0 && logicalHeight > 0) {
        const scaleX = viewportWidth / logicalWidth;
        const scaleY = viewportHeight / logicalHeight;
        const newZoom = Math.max(0.1, Math.min(scaleX, scaleY) * 0.90);
        
        console.log('Zoom calculation:', {
          viewportWidth,
          viewportHeight,
          logicalWidth,
          logicalHeight,
          scaleX,
          scaleY,
          newZoom,
          currentZoom: zoomLevel
        });
        
        setZoomLevel(newZoom);
      } else {
        console.warn('Invalid viewport or section dimensions, defaulting zoom to 0.5');
        setZoomLevel(0.5);
      }
    } else {
      console.warn('No viewport or section, defaulting zoom to 0.5');
      setZoomLevel(0.5);
    }
  }, [currentSection, viewMode, isNavigatorCollapsed, activePanel, zoomLevel]);

  useEffect(() => {
    calculateZoom();
    let resizeTimeout: number | undefined;
    const debouncedCalculateZoom = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(calculateZoom, 150);
    };
    window.addEventListener('resize', debouncedCalculateZoom);
    return () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedCalculateZoom);
    };
  }, [calculateZoom]);


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
    setSelectedComponentId(undefined);
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
    setSelectedComponentId(newComponent.id);
  };
  
  const handleComponentUpdate = (componentId: string, newData: any) => {
    if (!currentSection) return;
    const updatedComponents = (currentSection.components || []).map(c => 
      c.id === componentId ? { ...c, data: newData } : c
    );
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
  };

  const handleSelectComponent = (componentId: string | null): void => { 
    console.log('Selecting component:', componentId);
    setSelectedComponentId(componentId || undefined); 
  };

  const handleComponentDelete = (componentId: string) => {
    if (!currentSection) return;
    const updatedComponents = (currentSection.components || []).filter(c => c.id !== componentId);
    updateSection(currentSection.id, { ...currentSection, components: updatedComponents });
    if (selectedComponentId === componentId) {
      setSelectedComponentId(undefined);
    }
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

  const currentDeckThemeForPreview: DeckTheme = deck?.theme ? deck.theme : {
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
      body: themeSettings.fontFamily || 'Inter, system-ui, sans-serif',
      heading: themeSettings.fontFamily || 'Inter, system-ui, sans-serif',
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            <SafeTextRenderer content={deck.title || 'Untitled Deck'} />
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
            className="flex-1 overflow-auto p-4 space-y-4"
            id={viewMode === 'vertical' ? "slide-preview-area-vertical" : undefined}
          >
            {viewMode === 'vertical' ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <h2 className="text-md sm:text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <Edit size={20} className="mr-2 text-blue-600" />
                    Edit Slide
                  </h2>
                  {editorPaneContent}
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-md sm:text-lg font-semibold text-gray-800 flex items-center">
                      <Eye size={20} className="mr-2 text-blue-600" />
                      Preview
                    </h2>
                    <div className="flex items-center space-x-2">
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
                    className="overflow-visible p-4 bg-gray-100 flex justify-center items-center" 
                    style={{ width: '100%', minHeight: '500px' }} 
                  >
                    {currentSection ? (
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
                          previewMode={previewMode}
                          onSelect={!previewMode ? handleSelectComponent : undefined}
                          onUpdateLayout={!previewMode ? handleUpdateComponentLayout : undefined}
                          onOpenEditor={!previewMode ? (id: string) => {
                            const component = currentSection.components?.find(c => c.id === id);
                            if (component) handleOpenComponentEditor(component);
                          } : undefined}
                          onDeleteComponent={!previewMode ? (id: string) => handleComponentDelete(id) : undefined}
                          selectedComponentId={!previewMode ? selectedComponentId : undefined}
                        />
                        {!previewMode && (
                          <div 
                            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 opacity-70 hover:opacity-100 cursor-se-resize z-20"
                            style={{ borderTopLeftRadius: '4px' }}
                            onMouseDown={handleResizeCanvasStart}
                            title="Resize Slide Canvas"
                          />
                        )}
                      </div>
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
                        selectedComponentId={!previewMode ? selectedComponentId : undefined}
                      />
                      {!previewMode && (
                        <div 
                          className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 opacity-70 hover:opacity-100 cursor-se-resize z-20"
                          style={{ borderTopLeftRadius: '4px' }}
                          onMouseDown={handleResizeCanvasStart}
                          title="Resize Slide Canvas"
                        />
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
    </div>
  );
}
