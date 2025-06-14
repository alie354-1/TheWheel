import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Deck, DeckSection, VisualComponent, SectionType } from '../types/index.ts';
import { useDeck } from '../hooks/useDeck.ts';
import { v4 as uuidv4 } from 'uuid';
import { ComponentLibraryPanel } from './ComponentLibraryPanel.tsx';
import { SlidePreviewPanel } from './SlidePreviewPanel.tsx';
import { ThemeCustomizationPanel, ThemeSettings } from './ThemeCustomizationPanel.tsx';
import { SectionEditor } from './SectionEditor.tsx';
import { VisualComponentEditorModal } from './VisualComponentEditorModal.tsx';
import { ChevronLeft, ChevronRight, Plus, Settings, Palette, Layout, Save, Eye, EyeOff } from 'lucide-react';
import { VisualComponentLayout } from '../types/blocks.ts';
import { ColorTheme } from './EnhancedVisualDeckBuilderHelpers.tsx';

interface ManualDragDeckBuilderProps {
  deck: Deck;
  onDeckUpdate?: (deck: Deck) => void;
  onSave?: () => void;
  onPreview?: () => void;
}

export const ManualDragDeckBuilder: React.FC<ManualDragDeckBuilderProps> = ({
  deck: initialDeck,
  onDeckUpdate,
  onSave,
  onPreview,
}) => {
  // Wrap onDeckUpdate to handle null deck
  const handleDeckUpdate = useCallback((updatedDeck: Deck | null) => {
    if (updatedDeck && onDeckUpdate) {
      onDeckUpdate(updatedDeck);
    }
  }, [onDeckUpdate]);

  const { deck, updateSection, isLoading, error } = useDeck(initialDeck, handleDeckUpdate);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'theme'>('editor');
  const [editingComponent, setEditingComponent] = useState<VisualComponent | null>(null);
  const [showComponentEditor, setShowComponentEditor] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; componentX: number; componentY: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ 
    x: number; 
    y: number; 
    width: number; 
    height: number;
    componentX: number;
    componentY: number;
    handle: string;
  } | null>(null);

  // Refs
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const zoomLevelRef = useRef<number>(1);

  // Theme settings with defaults
  const [themeSettings, setThemeSettings] = useState<Partial<ThemeSettings>>({
    primaryColor: '#1e40af',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    fontFamily: 'Inter, system-ui, sans-serif',
  });

  const selectedSection = deck?.sections?.find(s => s.id === selectedSectionId);
  const selectedComponent = selectedSection?.components?.find(c => c.id === selectedComponentId);
  
  // Ensure selectedComponent is updated when deck changes
  useEffect(() => {
    if (selectedComponentId && selectedSection) {
      const component = selectedSection.components?.find(c => c.id === selectedComponentId);
      if (!component) {
        // Component no longer exists, clear selection
        setSelectedComponentId(null);
      }
    }
  }, [deck, selectedComponentId, selectedSection]);

  // Calculate zoom level
  useEffect(() => {
    const calculateZoom = () => {
      if (!slideContainerRef.current) return;
      
      const container = slideContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const slideWidth = 1280;
      const slideHeight = 720;
      
      const scaleX = (containerWidth - 40) / slideWidth;
      const scaleY = (containerHeight - 40) / slideHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      zoomLevelRef.current = scale;
    };

    calculateZoom();
    window.addEventListener('resize', calculateZoom);
    return () => window.removeEventListener('resize', calculateZoom);
  }, []);

  // Manual drag handling
  const handleComponentMouseDown = (e: React.MouseEvent, component: VisualComponent) => {
    if (isResizing) return;
    e.stopPropagation();
    
    setSelectedComponentId(component.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      componentX: component.layout.x,
      componentY: component.layout.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedComponent) return;
    
    console.log('Starting resize:', handle, {
      width: selectedComponent.layout.width,
      height: selectedComponent.layout.height,
      x: selectedComponent.layout.x,
      y: selectedComponent.layout.y
    });
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: selectedComponent.layout.width,
      height: selectedComponent.layout.height,
      componentX: selectedComponent.layout.x,
      componentY: selectedComponent.layout.y,
      handle
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const zoom = zoomLevelRef.current;
      
      if (isDragging && dragStart && selectedComponent) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;
        
        const newX = Math.max(0, Math.min(1280 - selectedComponent.layout.width, dragStart.componentX + deltaX));
        const newY = Math.max(0, Math.min(720 - selectedComponent.layout.height, dragStart.componentY + deltaY));
        
        handleUpdateComponentLayout(selectedComponent.id, { x: newX, y: newY });
      } else if (isResizing && resizeStart && selectedComponent) {
        const deltaX = (e.clientX - resizeStart.x) / zoom;
        const deltaY = (e.clientY - resizeStart.y) / zoom;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.componentX;
        let newY = resizeStart.componentY;
        
        switch (resizeStart.handle) {
          case 'bottom-right':
            newWidth = Math.max(50, resizeStart.width + deltaX);
            newHeight = Math.max(50, resizeStart.height + deltaY);
            break;
          case 'bottom-left':
            newWidth = Math.max(50, resizeStart.width - deltaX);
            newHeight = Math.max(50, resizeStart.height + deltaY);
            newX = resizeStart.componentX + deltaX;
            break;
          case 'top-right':
            newWidth = Math.max(50, resizeStart.width + deltaX);
            newHeight = Math.max(50, resizeStart.height - deltaY);
            newY = resizeStart.componentY + deltaY;
            break;
          case 'top-left':
            newWidth = Math.max(50, resizeStart.width - deltaX);
            newHeight = Math.max(50, resizeStart.height - deltaY);
            newX = resizeStart.componentX + deltaX;
            newY = resizeStart.componentY + deltaY;
            break;
        }
        
        // Ensure component stays within bounds
        newX = Math.max(0, Math.min(1280 - newWidth, newX));
        newY = Math.max(0, Math.min(720 - newHeight, newY));
        
        console.log('Resize move:', {
          handle: resizeStart.handle,
          deltaX, deltaY,
          newX, newY, newWidth, newHeight
        });
        
        handleUpdateComponentLayout(selectedComponent.id, { x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setDragStart(null);
      setResizeStart(null);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, selectedComponent]);

  const handleAddComponent = useCallback((componentData: Partial<VisualComponent>) => {
    if (!selectedSection) return;

    const newComponent: VisualComponent = {
      id: uuidv4(),
      order: (selectedSection.components?.length || 0) + 1,
      type: componentData.type || 'text',
      data: componentData.data || {},
      layout: {
        x: 50,
        y: 50,
        width: componentData.layout?.width || 200,
        height: componentData.layout?.height || 100,
        zIndex: (selectedSection.components?.length || 0) + 1,
      },
      style: componentData.style || {},
    };

    const updatedSection = {
      ...selectedSection,
      components: [...(selectedSection.components || []), newComponent],
    };

    updateSection(selectedSection.id, updatedSection);
    setSelectedComponentId(newComponent.id);
  }, [selectedSection, updateSection]);

  const handleUpdateComponent = useCallback((componentId: string, updates: Partial<VisualComponent>) => {
    if (!selectedSection) return;

    const updatedComponents = selectedSection.components?.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    ) || [];

    updateSection(selectedSection.id, { ...selectedSection, components: updatedComponents });
  }, [selectedSection, updateSection]);

  const handleUpdateComponentLayout = useCallback((componentId: string, layoutUpdates: Partial<VisualComponentLayout>) => {
    if (!selectedSection) return;
    
    // Ensure all values are finite numbers
    const sanitizedUpdates: Partial<VisualComponentLayout> = {};
    if (layoutUpdates.x !== undefined && isFinite(layoutUpdates.x)) {
      sanitizedUpdates.x = layoutUpdates.x;
    }
    if (layoutUpdates.y !== undefined && isFinite(layoutUpdates.y)) {
      sanitizedUpdates.y = layoutUpdates.y;
    }
    if (layoutUpdates.width !== undefined && isFinite(layoutUpdates.width)) {
      sanitizedUpdates.width = layoutUpdates.width;
    }
    if (layoutUpdates.height !== undefined && isFinite(layoutUpdates.height)) {
      sanitizedUpdates.height = layoutUpdates.height;
    }
    if (layoutUpdates.zIndex !== undefined && isFinite(layoutUpdates.zIndex)) {
      sanitizedUpdates.zIndex = layoutUpdates.zIndex;
    }

    console.log('Updating component layout:', componentId, sanitizedUpdates);

    const updatedComponents = selectedSection.components?.map(comp =>
      comp.id === componentId 
        ? { ...comp, layout: { ...comp.layout, ...sanitizedUpdates } }
        : comp
    ) || [];

    console.log('Updated components:', updatedComponents);
    updateSection(selectedSection.id, { ...selectedSection, components: updatedComponents });
  }, [selectedSection, updateSection]);

  const handleDeleteComponent = useCallback((componentId: string) => {
    if (!selectedSection) return;

    const updatedComponents = selectedSection.components?.filter(comp => comp.id !== componentId) || [];
    updateSection(selectedSection.id, { ...selectedSection, components: updatedComponents });
    
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  }, [selectedSection, selectedComponentId, updateSection]);

  const handleOpenComponentEditor = useCallback((componentId: string) => {
    const component = selectedSection?.components?.find(c => c.id === componentId);
    if (component) {
      setEditingComponent(component);
      setShowComponentEditor(true);
    }
  }, [selectedSection]);

  const handleSaveComponent = useCallback((componentId: string, data: any, newLayout?: VisualComponentLayout) => {
    if (!editingComponent) return;
    
    const updates: Partial<VisualComponent> = { data };
    if (newLayout) {
      updates.layout = newLayout;
    }
    
    handleUpdateComponent(componentId, updates);
    setShowComponentEditor(false);
    setEditingComponent(null);
  }, [editingComponent, handleUpdateComponent]);

  const handleSlideClick = useCallback(() => {
    setSelectedComponentId(null);
  }, []);

  // Convert theme settings to ColorTheme for EnhancedVisualDeckBuilderHelpers
  const currentColorTheme: ColorTheme = {
    id: 'custom',
    name: 'Custom Theme',
    primary: themeSettings.primaryColor || '#1e40af',
    secondary: themeSettings.secondaryColor || '#64748b',
    accent: themeSettings.accentColor || '#f59e0b',
    background: themeSettings.backgroundColor || '#ffffff',
    text: themeSettings.textColor || '#1e293b',
    border: '#e5e7eb',
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading deck...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-600">Error: {error}</div>;
  }

  if (!deck) {
    return <div className="flex items-center justify-center h-screen">Deck not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Component Library */}
      <div className={`${leftPanelCollapsed ? 'w-12' : 'w-80'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col relative`}>
        <button
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow z-10"
        >
          {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        
        {!leftPanelCollapsed && (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Components</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ComponentLibraryPanel onAddComponent={handleAddComponent} />
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">{deck.title || 'Untitled Deck'}</h2>
            <span className="text-sm text-gray-500">
              {selectedSection ? `Editing: ${selectedSection.title}` : 'Select a section to edit'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onSave && (
              <button
                onClick={onSave}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            )}
            {onPreview && (
              <button
                onClick={onPreview}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-gray-100 px-4 py-2 flex items-center space-x-2 overflow-x-auto">
          {deck.sections?.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                selectedSectionId === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
          <button
            onClick={() => {
              const newSection: DeckSection = {
                id: uuidv4(),
                type: 'blank' as SectionType,
                title: `Section ${(deck.sections?.length || 0) + 1}`,
                order: (deck.sections?.length || 0) + 1,
                components: [],
              };
              // This would need to be implemented in useDeck hook
              console.log('Add new section:', newSection);
            }}
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Main Editing Area */}
        <div className="flex-1 flex">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" ref={slideContainerRef}>
            {selectedSection ? (
              <div 
                onClick={handleSlideClick}
                className="relative bg-white shadow-lg rounded-lg overflow-hidden"
                style={{
                  width: '1280px',
                  height: '720px',
                  transform: `scale(${zoomLevelRef.current})`,
                  transformOrigin: 'center',
                }}
              >
                {/* Render Components */}
                {selectedSection.components?.map((component) => (
                  <div
                    key={component.id}
                    onMouseDown={(e) => handleComponentMouseDown(e, component)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedComponentId(component.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: component.layout.x,
                      top: component.layout.y,
                      width: component.layout.width,
                      height: component.layout.height,
                      backgroundColor: component.style?.backgroundColor || '#f3f4f6',
                      border: selectedComponentId === component.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      cursor: isDragging ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      ...component.style,
                    }}
                  >
                    {/* Component Content */}
                    <div className="p-2">
                      {component.type === 'text' ? (
                        <p>{component.data.text || 'Text Component'}</p>
                      ) : (
                        <p>{component.type}</p>
                      )}
                    </div>
                    
                    {/* Resize Handles */}
                    {selectedComponentId === component.id && !isDragging && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
                          className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize z-10 hover:bg-blue-600"
                          style={{ touchAction: 'none' }}
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
                          className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize z-10 hover:bg-blue-600"
                          style={{ touchAction: 'none' }}
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
                          className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize z-10 hover:bg-blue-600"
                          style={{ touchAction: 'none' }}
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-10 hover:bg-blue-600"
                          style={{ touchAction: 'none' }}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center">
                <p className="text-xl mb-2">No section selected</p>
                <p>Select a section from above to start editing</p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} bg-white border-l border-gray-200 transition-all duration-300 relative`}>
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow z-10"
            >
              {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            {!rightPanelCollapsed && (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                      activeTab === 'editor' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline mr-1" />
                    Editor
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('theme');
                      setShowThemePanel(true);
                    }}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                      activeTab === 'theme' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Palette className="h-4 w-4 inline mr-1" />
                    Theme
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === 'editor' ? (
                    selectedSection ? (
                      <SectionEditor
                        section={selectedSection}
                        onUpdate={(updates) => updateSection(selectedSection.id, updates)}
                        onRemove={() => {
                          // Handle section removal
                          console.log('Remove section:', selectedSection.id);
                        }}
                      />
                    ) : (
                      <p className="text-gray-500">Select a section to edit its properties</p>
                    )
                  ) : (
                    <p className="text-gray-500">Theme settings panel</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Component Editor Modal */}
      {showComponentEditor && editingComponent && (
        <VisualComponentEditorModal
          component={editingComponent}
          isOpen={showComponentEditor}
          onClose={() => {
            setShowComponentEditor(false);
            setEditingComponent(null);
          }}
          onUpdate={handleSaveComponent}
          onDelete={handleDeleteComponent}
          currentTheme={currentColorTheme}
        />
      )}

      {/* Theme Customization Panel */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
            <ThemeCustomizationPanel
              deck={deck}
              initialSettings={themeSettings}
              onThemeChange={(theme) => {
                setThemeSettings(theme);
                // Apply theme to deck
                console.log('Apply theme:', theme);
              }}
              onClose={() => {
                setShowThemePanel(false);
                setActiveTab('editor');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualDragDeckBuilder;
