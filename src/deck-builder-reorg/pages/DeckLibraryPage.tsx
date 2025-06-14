import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeckLibrary } from '../components/DeckLibrary.tsx';
import { TemplateSelector } from '../components/TemplateSelector.tsx';
import { DeckService } from '../services/deckService.ts';
// import { DeckPreview } from '../components/DeckPreview'; // No longer directly used here
import DeckPreviewer from '../preview/components/DeckPreviewer.tsx'; // Import DeckPreviewer
import { supabase } from '../../lib/supabase.ts';
import { Deck, DeckSection } from '../types/index.ts';
import { ArrowLeft, Sparkles, Eye, Edit3, FileText, UploadCloud, X } from 'lucide-react';
import { convertHtmlToDeckSections } from '../services/HtmlToDeckConverter.ts';
import { generateUUID } from '../utils/uuid.ts';

type FlowStep = 'library' | 'templates' | 'preview' | 'creating' | 'htmlImport';

export default function DeckLibraryPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FlowStep>('library');
  const [previewDeck, setPreviewDeck] = useState<Deck | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [deckTitle, setDeckTitle] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [showHtmlImportModal, setShowHtmlImportModal] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');
  const [htmlDeckTitle, setHtmlDeckTitle] = useState('Imported HTML Deck');

  const handleCreateNew = () => {
    setCurrentStep('templates');
  };

  const handleShowHtmlImportModal = () => {
    setHtmlDeckTitle(`Imported Deck ${new Date().toLocaleTimeString()}`); // Default title
    setHtmlInput('');
    setShowHtmlImportModal(true);
  };

  const handleHtmlImport = async () => {
    if (!htmlDeckTitle.trim()) {
      alert('Please enter a title for the new deck.');
      return;
    }
    if (!htmlInput.trim()) {
      alert('Please paste some HTML to import.');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to create a deck.');
        setIsCreating(false);
        return;
      }

      const sections: DeckSection[] = convertHtmlToDeckSections(htmlInput);
      if (sections.length === 0) {
        alert('No slides could be generated from the HTML. Please check the HTML structure.');
        setIsCreating(false);
        return;
      }
      
      const newDeckData: Deck = {
        id: generateUUID(),
        title: htmlDeckTitle,
        sections: sections,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        theme: undefined,
      };
      
      const savedDeck = await DeckService.saveDeck(newDeckData, user.id);

      // Log HTML import deck creation after successful save
      DeckService.logContentInteraction(
        savedDeck.id,
        'DECK_CREATE_FROM_HTML',
        { title: savedDeck.title, sectionCount: savedDeck.sections.length },
        user.id
      ).catch((logError: any) => console.error("Logging failed for DECK_CREATE_FROM_HTML:", logError));
      
      setShowHtmlImportModal(false);
      setHtmlInput('');
      setHtmlDeckTitle('');
      setIsCreating(false);
      navigate(`/deck-builder/edit/${savedDeck.id}`);

    } catch (error) {
      console.error("Error importing HTML and creating deck:", error);
      alert(`An error occurred during HTML import: ${error instanceof Error ? error.message : String(error)}`);
      setIsCreating(false);
    }
  };

  const handleSelectTemplate = async (templateId: string, title: string) => {
    setSelectedTemplate(templateId);
    setDeckTitle(title);
    
    const newDeck = DeckService.createDeckFromTemplate(templateId, title);
    setPreviewDeck(newDeck);
    setCurrentStep('preview');
  };

  const handleCreateEmpty = async (title: string) => {
    setSelectedTemplate('start-from-scratch');
    setDeckTitle(title);
    
    const newDeck = DeckService.createEmptyDeck(title);
    setPreviewDeck(newDeck);
    setCurrentStep('preview');
  };

  const handleStartEditing = async () => {
    if (!previewDeck) return;
    
    setIsCreating(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        alert('Please log in to create a deck');
        setIsCreating(false);
        return;
      }

      const savedDeck = await DeckService.saveDeck(previewDeck, user.id);
      
      // Log deck creation after successful save
      if (selectedTemplate && selectedTemplate !== 'start-from-scratch') {
        DeckService.logContentInteraction(
          savedDeck.id,
          'DECK_CREATE_FROM_TEMPLATE',
          { templateId: selectedTemplate, title: savedDeck.title },
          user.id
        ).catch((logError: any) => console.error("Logging failed for DECK_CREATE_FROM_TEMPLATE:", logError));
      } else if (selectedTemplate === 'start-from-scratch') {
        DeckService.logContentInteraction(
          savedDeck.id,
          'DECK_CREATE_EMPTY',
          { title: savedDeck.title },
          user.id
        ).catch((logError: any) => console.error("Logging failed for DECK_CREATE_EMPTY:", logError));
      }

      navigate(`/deck-builder/edit/${savedDeck.id}`);
    } catch (error) {
      console.error('Error creating new deck:', error);
      alert('Failed to create new deck. Please try again.');
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'templates':
        setCurrentStep('library');
        break;
      case 'preview': // This case will be handled by DeckPreviewer's own close
        setCurrentStep('templates');
        setPreviewDeck(null); // Still clear the previewDeck
        break;
      default:
        setCurrentStep('library');
    }
  };

  const handleClosePreviewInLibrary = () => {
    setCurrentStep('templates');
    setPreviewDeck(null);
  };

  const handleOpenDeck = (deckId: string) => {
    navigate(`/deck-builder/edit/${deckId}`);
  };

  if (currentStep === 'library') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DeckLibrary 
          onCreateNew={handleCreateNew}
          onOpenDeck={handleOpenDeck}
          onImportFromHtml={handleShowHtmlImportModal}
        />
        {showHtmlImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all duration-300 ease-in-out scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <UploadCloud className="h-6 w-6 mr-3 text-indigo-600" />
                  Create Deck from HTML
                </h2>
                <button
                  onClick={() => setShowHtmlImportModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="htmlDeckTitle" className="block text-sm font-medium text-slate-700 mb-1">Deck Title</label>
                  <input
                    type="text"
                    id="htmlDeckTitle"
                    value={htmlDeckTitle}
                    onChange={(e) => setHtmlDeckTitle(e.target.value)}
                    placeholder="Enter title for the new deck"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="htmlInput" className="block text-sm font-medium text-slate-700 mb-1">HTML Content</label>
                  <p className="text-xs text-slate-500 mb-2">
                    Use <code>{'<section class="slide">'}</code> to define each slide. The first heading (h1-h6) inside will be the slide title.
                  </p>
                  <textarea
                    id="htmlInput"
                    className="w-full h-60 p-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="<h1>Slide 1 Title</h1><p>Content...</p>"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowHtmlImportModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleHtmlImport}
                  disabled={isCreating || !htmlInput.trim() || !htmlDeckTitle.trim()}
                  className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Convert and Create Deck
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'templates') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center mb-8">
            <button
              onClick={handleBack}
              className="mr-4 p-3 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Choose Your Template
              </h1>
              <p className="text-slate-600 mt-1">Start with a proven presentation structure</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onCreateEmpty={handleCreateEmpty}
              onCancel={handleBack}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'preview' && previewDeck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-3 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Preview: {previewDeck.title}
                </h1>
                <p className="text-slate-600 mt-1">Review your deck structure before editing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-white hover:border-slate-400 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Template
              </button>
              <button
                onClick={handleStartEditing}
                disabled={isCreating}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Start Editing
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <DeckPreviewer 
              deckId={previewDeck.id} 
              onClosePreview={handleClosePreviewInLibrary} 
              initialDeckFromLibrary={previewDeck}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
