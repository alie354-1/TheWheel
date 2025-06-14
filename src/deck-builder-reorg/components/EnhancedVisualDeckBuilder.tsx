import React, { useState, useEffect } from 'react';
import { DeckSection, SectionType, VisualComponent, VisualComponentLayout as Layout } from '../types'; // Added Layout
import { BLOCK_REGISTRY, BlockType } from '../types/blocks';
import { useDeck } from '../hooks/useDeck';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import { VisualComponentEditorModal } from './VisualComponentEditorModal'; // Import the modal
import { ColorThemePanel } from './ColorThemePanel';
import { SlidePreviewPanel } from './SlidePreviewPanel';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Settings, Eye, ChevronLeft, ChevronRight, Palette, Image, Download, Share, Loader2, Inbox, PlusCircle } from 'lucide-react'; // Added Loader2, Inbox, PlusCircle
import {
  ColorTheme,
  SlideBackground,
  convertCssToSlideBackground,
  convertSlideBackgroundToCss,
  getSlideBackground,
  EnhancedSlideCanvas,
  EnhancedPropertiesPanel,
  FullScreenPreview,
} from './EnhancedVisualDeckBuilderHelpers';
import { Button } from '@/components/ui/button'; // Assuming Button is used

export function EnhancedVisualDeckBuilder() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [editingComponentInModal, setEditingComponentInModal] = useState<VisualComponent | null>(null); // State for modal
  const [activeSidebar, setActiveSidebar] = useState<'components' | 'colors' | 'preview' | null>('components');
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [deckTitle, setDeckTitle] = useState('My Presentation');
  const [deckLogo, setDeckLogo] = useState<string | null>(null);
  const [slides, setSlides] = useState<DeckSection[]>([
    {
      id: 'slide_initial_1',
      title: 'Title Slide',
      type: 'hero' as SectionType,
      components: [],
      order: 0,
      slideStyle: { backgroundColor: '#ffffff' }
    }
  ]);
  const [isLoading, setIsLoading] = useState(false); // Added for loading state
  const canvasContainerRef = React.useRef<HTMLDivElement>(null); // Added ref
  const [slideDimensions, setSlideDimensions] = useState({ width: 1280, height: 720 }); // Example dimensions
  const [zoomLevel, setZoomLevel] = useState(1); // Example zoom

  useEffect(() => {
    if (slides.length > 0 && !selectedSlideId) {
      setSelectedSlideId(slides[0].id);
    }
  }, [slides, selectedSlideId]);

  const [colorThemes] = useState<ColorTheme[]>([
    { id: 'default', name: 'Professional Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA', background: '#F8FAFC', text: '#1F2937', border: '#E5E7EB' },
    { id: 'modern', name: 'Modern Green', primary: '#10B981', secondary: '#059669', accent: '#34D399', background: '#F0FDF4', text: '#1F2937', border: '#D1FAE5' },
  ]);

  useDeck(); 

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  const currentSlide = slides.find(s => s.id === selectedSlideId);
  const selectedComponent = currentSlide?.components.find(c => c.id === selectedComponentId);
  const currentTheme = colorThemes.find(t => t.id === (currentSlide as any)?.themeId /* Ensure themeId is how it's stored or adjust */) || colorThemes[0] || 
                     { id: 'fallback', name: 'Fallback', primary: '#000000', secondary: '#000000', accent: '#000000', background: '#ffffff', text: '#000000', border: '#cccccc' };


  const handleAddComponent = (componentType: BlockType) => {
    const blockMeta = BLOCK_REGISTRY[componentType];
    if (!blockMeta || !currentSlide) return;

    const newComponent: VisualComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType,
      data: { ...(blockMeta.sampleData || {}) },
      layout: { x: 50, y: 50, width: blockMeta.defaultSize?.width || 300, height: blockMeta.defaultSize?.height || 200, zIndex: (currentSlide.components?.length || 0) + 1 },
      order: (currentSlide.components?.length || 0) + 1,
      style: { backgroundColor: 'transparent', color: currentTheme.text, borderColor: currentTheme.border, borderWidth: 0, borderRadius: 8, opacity: 1 }
    };
    setSlides(prevSlides => prevSlides.map(slide => slide.id === selectedSlideId ? { ...slide, components: [...(slide.components || []), newComponent] } : slide));
    setSelectedComponentId(newComponent.id);
    setActiveSidebar(null);
  };
  
  const handleComponentSelect = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handleOpenComponentEditorModal = (component: VisualComponent) => {
    setEditingComponentInModal(component);
  };
  
  const handleCloseComponentEditorModal = () => {
    setEditingComponentInModal(null);
  };

  const handleComponentUpdate = (componentId: string, updates: Partial<VisualComponent> | any, newLayout?: Layout) => { // data can be any, layout is specific
    setSlides(prevSlides => prevSlides.map(slide => {
      if (slide.id === selectedSlideId) {
        return {
          ...slide,
          components: (slide.components || []).map(comp => {
            if (comp.id === componentId) {
              const updatedComp = { ...comp };
              if (newLayout) { // If newLayout is from modal
                updatedComp.layout = { ...comp.layout, ...newLayout };
                updatedComp.data = { ...comp.data, ...updates }; // updates is data in this case
              } else { // Standard update from properties panel or direct canvas manipulation
                updatedComp.data = { ...comp.data, ...(updates.data || updates) }; // Handle if updates is full VisualComponent partial or just data
                updatedComp.layout = { ...comp.layout, ...(updates.layout || {}) };
                updatedComp.style = { ...comp.style, ...(updates.style || {}) };
              }
              return updatedComp;
            }
            return comp;
          })
        };
      }
      return slide;
    }));
  };
  
  const handleComponentDeleteAndCloseModal = (componentId: string) => {
    handleComponentDelete(componentId);
    handleCloseComponentEditorModal();
  }

  const handleComponentDelete = (componentId: string) => {
    setSlides(prevSlides => prevSlides.map(slide => {
      if (slide.id === selectedSlideId) {
        return { ...slide, components: (slide.components || []).filter(comp => comp.id !== componentId) };
      }
      return slide;
    }));
    if (selectedComponentId === componentId) setSelectedComponentId(null);
  };

  const addNewSlide = () => { // Renamed from handleAddSlide for clarity with button
    const newSlideOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 0;
    const newSlide: DeckSection = { 
      id: `slide_${Date.now()}`, 
      title: `Slide ${slides.length + 1}`, 
      type: 'blank' as SectionType, 
      components: [], 
      order: newSlideOrder, 
      slideStyle: { backgroundColor: currentTheme.background }
    };
    setSlides(prev => [...prev, newSlide]);
    setSelectedSlideId(newSlide.id);
    setSelectedComponentId(null);
  };

  const handleDeleteSlide = (slideIdToDelete: string) => {
    if (slides.length <= 1) {
      alert("Cannot delete the last slide.");
      return;
    }
    const slideIndexToDelete = slides.findIndex(s => s.id === slideIdToDelete);
    if (slideIndexToDelete === -1) return;
    
    const newSlides = slides.filter(s => s.id !== slideIdToDelete).map((s, i) => ({ ...s, order: i }));
    setSlides(newSlides);

    if (selectedSlideId === slideIdToDelete) {
      if (newSlides.length > 0) {
        setSelectedSlideId(newSlides[Math.max(0, slideIndexToDelete - 1)]?.id || newSlides[0]?.id);
      } else {
        const initialSlide: DeckSection = { id: 'slide_initial_1', title: 'Title Slide', type: 'hero' as SectionType, components: [], order: 0, slideStyle: { backgroundColor: '#ffffff' } };
        setSlides([initialSlide]);
        setSelectedSlideId(initialSlide.id);
      }
    }
    setSelectedComponentId(null);
  };

  const handleDuplicateSlide = (slideIdToDuplicate: string) => {
    const slideToClone = slides.find(s => s.id === slideIdToDuplicate);
    if (!slideToClone) return;
    
    const newSlideId = `slide_${Date.now()}`;
    const duplicatedSlide: DeckSection = { 
      ...slideToClone, 
      id: newSlideId, 
      title: `${slideToClone.title} (Copy)`, 
      components: (slideToClone.components || []).map(comp => ({ 
        ...comp, 
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      })) 
    };
    
    const originalIndex = slides.findIndex(s => s.id === slideIdToDuplicate);
    const newSlidesArray = [
      ...slides.slice(0, originalIndex + 1),
      duplicatedSlide,
      ...slides.slice(originalIndex + 1)
    ].map((s, i) => ({ ...s, order: i }));
    
    setSlides(newSlidesArray);
    setSelectedSlideId(newSlideId);
    setSelectedComponentId(null);
  };

  const handleThemeChange = (themeId: string) => {
    const selectedTheme = colorThemes.find(t => t.id === themeId);
    if (selectedTheme && currentSlide) {
      const newSlideStyle: React.CSSProperties = { 
        ...(currentSlide.slideStyle || {}), 
        backgroundColor: selectedTheme.background, 
      };
      setSlides(prevSlides => prevSlides.map(slide => 
        slide.id === currentSlide.id ? { ...slide, slideStyle: newSlideStyle, themeId: themeId } : slide
      ));
    }
  };

  const handleSlideBackgroundChange = (newBackground: SlideBackground) => {
    const newCssStyle = convertSlideBackgroundToCss(newBackground);
    setSlides(prevSlides => prevSlides.map(slide => 
      slide.id === selectedSlideId ? { ...slide, slideStyle: { ...(slide.slideStyle || {}), ...newCssStyle } } : slide
    ));
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUserId) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `user_${currentUserId}/logo_${Date.now()}.${fileExt}`;
      await supabase.storage.from('deck-assets').upload(fileName, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('deck-assets').getPublicUrl(fileName);
      setDeckLogo(publicUrl);
    } catch (error) { 
      console.error('Error uploading logo:', error); 
    }
  };

  const nextSlide = () => {
    const currentIndex = slides.findIndex(s => s.id === selectedSlideId);
    if (currentIndex !== -1 && currentIndex < slides.length - 1) {
      setSelectedSlideId(slides[currentIndex + 1].id);
      setSelectedComponentId(null);
    }
  };

  const prevSlide = () => {
    const currentIndex = slides.findIndex(s => s.id === selectedSlideId);
    if (currentIndex !== -1 && currentIndex > 0) {
      setSelectedSlideId(slides[currentIndex - 1].id);
      setSelectedComponentId(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Deselect component if clicking directly on the canvas background
    // This assumes the EnhancedSlideCanvas or its immediate children (components)
    // will stop propagation if they handle the click.
    if (e.target === e.currentTarget) {
        setSelectedComponentId(null);
    }
  };

  const handleDropOnCanvas = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("application/componentType") as BlockType;
    if (componentType && BLOCK_REGISTRY[componentType]) {
        // TODO: Calculate position based on drop coordinates relative to canvas
        // For now, add at a default position or center
        handleAddComponent(componentType);
    }
  };

  const handleDragOverCanvas = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); // Necessary to allow dropping
  };


  if (!currentUserId) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 mb-4">Enhanced Deck Builder</h1><p className="text-gray-600 mb-6">Please log in to use the deck builder</p><button onClick={() => window.location.href = '/login'} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Go to Login</button></div></div>;
  }

  if (isFullPreview) {
    return <FullScreenPreview slides={slides} currentSlideId={selectedSlideId} onClose={() => setIsFullPreview(false)} onNavigateById={setSelectedSlideId} deckTitle={deckTitle} deckLogo={deckLogo} colorThemes={colorThemes} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {deckLogo && (<img src={deckLogo} alt="Logo" className="h-8 w-8 object-contain" />)}
              <input 
                type="text" 
                value={deckTitle} 
                onChange={(e) => setDeckTitle(e.target.value)} 
                className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:rounded px-2 py-1" 
                placeholder="Presentation Title"
              />
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">Slide {slides.findIndex(s => s.id === selectedSlideId) + 1} of {slides.length}</span>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">
              <Image className="h-4 w-4" />
              <span>Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden"/>
            </label>
            <button onClick={() => setIsFullPreview(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Eye className="h-4 w-4" /><span>Preview</span>
            </button>
            <button onClick={() => console.log('Export deck')} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4" /><span>Export</span>
            </button>
            <button onClick={() => console.log('Share deck')} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Share className="h-4 w-4" /><span>Share</span>
            </button>
            <button onClick={() => console.log('Save deck')} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Save className="h-4 w-4" /><span>Save</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveSidebar(activeSidebar === 'components' ? null : 'components')} className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeSidebar === 'components' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Components</button>
            <button onClick={() => setActiveSidebar(activeSidebar === 'colors' ? null : 'colors')} className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeSidebar === 'colors' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Palette className="h-4 w-4 inline mr-1" />Themes</button>
            <button onClick={() => setActiveSidebar(activeSidebar === 'preview' ? null : 'preview')} className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeSidebar === 'preview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Slides</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeSidebar === 'components' && (<ComponentLibraryPanel onAddComponent={handleAddComponent} onClose={() => setActiveSidebar(null)}/>)}
            {activeSidebar === 'colors' && (<ColorThemePanel themes={colorThemes} currentTheme={currentTheme} onThemeChange={handleThemeChange} onBackgroundChange={handleSlideBackgroundChange} currentBackground={currentSlide?.slideStyle ? convertCssToSlideBackground(currentSlide.slideStyle, currentTheme) : { type: 'solid', color: currentTheme.background }}/>)}
            {activeSidebar === 'preview' && (<SlidePreviewPanel slides={slides} currentSlideId={selectedSlideId} onSlideSelect={setSelectedSlideId} onAddSlide={addNewSlide} onDeleteSlide={handleDeleteSlide} onDuplicateSlide={handleDuplicateSlide} onMoveSlide={(slideId, direction) => { console.log('Move slide', slideId, direction); }} collapsed={false} setCollapsed={(val) => console.log('setCollapsed for SlidePreviewPanel', val)} colorThemes={colorThemes}/>)}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input 
                  type="text" 
                  value={currentSlide?.title || ''} 
                  onChange={(e) => { 
                    setSlides(prevSlides => prevSlides.map(slide => 
                      slide.id === selectedSlideId ? { ...slide, title: e.target.value } : slide 
                    )); 
                  }} 
                  className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:rounded px-2 py-1" 
                  placeholder="Slide title..."
                />
                <button onClick={addNewSlide} className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  <Plus className="h-4 w-4" /><span>Add Slide</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={prevSlide} disabled={slides.findIndex(s => s.id === selectedSlideId) === 0} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextSlide} disabled={slides.findIndex(s => s.id === selectedSlideId) === slides.length - 1} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Main Canvas Area - MODIFIED: Removed overflow-hidden */}
          <div 
            ref={canvasContainerRef} 
            className="flex-1 bg-gray-100 dark:bg-gray-800 relative" 
            onDrop={handleDropOnCanvas}
            onDragOver={handleDragOverCanvas}
            onClick={handleCanvasClick} 
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                  <p className="mt-2 text-lg font-medium text-gray-700">Loading Deck...</p>
                </div>
              </div>
            )}
            {!isLoading && currentSlide && (
              <div 
                className="absolute top-1/2 left-1/2 bg-white dark:bg-gray-700 shadow-lg"
                style={{
                  width: `${slideDimensions.width}px`,
                  height: `${slideDimensions.height}px`,
                  transform: `translate(-50%, -50%) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              >
                <EnhancedSlideCanvas 
                  slide={currentSlide} 
                  selectedComponentId={selectedComponentId}
                  onComponentSelect={handleComponentSelect}
                  onComponentUpdate={handleComponentUpdate}
                  onComponentDelete={handleComponentDelete}
                  theme={currentTheme}
                  deckLogo={deckLogo} {/* Use the state variable deckLogo */}
                />
              </div>
            )}
            {!isLoading && !currentSlide && slides.length > 0 && (
               <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                 <p>Select a slide to view its content.</p>
               </div>
            )}
             {!isLoading && slides.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md">
                  <Inbox className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Your Deck is Empty</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Start building your presentation by adding a new slide or choosing a template.
                  </p>
                  <div className="space-x-3">
                    <Button onClick={addNewSlide} size="sm"> {/* Removed variant="default" */}
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Slide
                    </Button>
                    {/* Placeholder for template selection button */}
                    {/* <Button variant="outline" size="sm" onClick={() => console.log("Open templates")}>
                      <LayoutTemplate className="mr-2 h-4 w-4" /> Choose Template
                    </Button> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-80 bg-white border-l border-gray-200">
          <EnhancedPropertiesPanel 
            selectedComponent={selectedComponent} 
            onComponentUpdate={(updates: Partial<VisualComponent>) => { 
              if (selectedComponentId) { 
                handleComponentUpdate(selectedComponentId, updates); 
              } 
            }} 
            theme={currentTheme}
            onOpenEditorModal={selectedComponent ? () => handleOpenComponentEditorModal(selectedComponent) : undefined}
          />
        </div>
      </div>
      {editingComponentInModal && (
        <VisualComponentEditorModal
          isOpen={!!editingComponentInModal}
          component={editingComponentInModal}
          onClose={handleCloseComponentEditorModal}
          onUpdate={handleComponentUpdate}
          onDelete={handleComponentDeleteAndCloseModal}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
}
