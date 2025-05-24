import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeckService } from '../services/deckService';
import { supabase } from '../../lib/supabase';
import { Deck, DeckSection, SectionType } from '../types';
import { useDeck } from '../hooks/useDeck';
import { SectionEditor } from '../components/SectionEditor';
import { TemplateSelector } from '../components/TemplateSelector';

export default function DeckEditPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialDeck, setInitialDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const loadDeck = async () => {
      if (!deckId) {
        setError('No deck ID provided');
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Please log in to edit decks');
          setLoading(false);
          return;
        }

        // Load the deck
        const loadedDeck = await DeckService.loadDeck(deckId);
        if (!loadedDeck) {
          setError('Deck not found');
          setLoading(false);
          return;
        }

        setInitialDeck(loadedDeck);
      } catch (err) {
        console.error('Error loading deck:', err);
        setError('Failed to load deck');
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Deck</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/deck-builder/library')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Library
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialDeck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">📄</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Deck Not Found</h1>
          <p className="text-gray-600 mb-6">The deck you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/deck-builder/library')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/deck-builder/library')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Editing: {initialDeck.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Use the DeckBuilder logic with the loaded deck */}
      <DeckBuilderEditor initialDeck={initialDeck} />
    </div>
  );
}

// DeckBuilder component that works with an existing deck
function DeckBuilderEditor({ initialDeck }: { initialDeck: Deck }) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const {
    deck,
    error,
    validation,
    sectionCount,
    hasUnsavedChanges,
    createFromTemplate,
    updateTitle,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    saveDeck,
    clearDeck,
    clearError
  } = useDeck(initialDeck); // Pass the initial deck here

  // Get current authenticated user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateDeck = (templateId: string, title: string) => {
    createFromTemplate(templateId, title);
    setShowTemplateSelector(false);
  };

  const handleAddSection = (sectionType: SectionType) => {
    addSection(sectionType);
    setShowAddSectionMenu(false);
  };

  const handleSaveDeck = async () => {
    if (!currentUserId) {
      alert('Please log in to save your deck');
      return;
    }

    const success = await saveDeck(currentUserId);
    if (success) {
      alert('Deck saved successfully!');
    }
  };

  const getSectionTypeIcon = (type: SectionType) => {
    switch (type) {
      case 'hero': return '🏠';
      case 'problem': return '❗';
      case 'solution': return '💡';
      case 'market': return '📊';
      case 'business-model': return '💰';
      case 'competition': return '⚔️';
      case 'team': return '👥';
      case 'financials': return '📈';
      case 'funding': return '💵';
      case 'next-steps': return '🚀';
      default: return '📄';
    }
  };

  const availableSectionTypes: SectionType[] = [
    'hero', 'problem', 'solution', 'market', 'business-model', 
    'competition', 'team', 'financials', 'funding', 'next-steps'
  ];

  // Show login message if user is not authenticated
  if (!currentUserId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to edit this deck</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Deck Loading Error</h2>
          <p className="text-gray-600 mb-6">There was an issue loading your deck</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={deck.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-gray-300 focus:rounded px-2 py-1 w-full"
            />
            <p className="text-gray-600 text-sm mt-1">
              {sectionCount} sections • {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Section
            </button>
            <button
              onClick={handleSaveDeck}
              disabled={!validation.isValid}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Deck
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to start over? All changes will be lost.')) {
                  clearDeck();
                }
              }}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              New Deck
            </button>
          </div>
        </div>

        {/* Add Section Menu */}
        {showAddSectionMenu && (
          <div className="relative inline-block">
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-3">
                <h3 className="font-medium text-gray-900 mb-3">Add Section</h3>
                <div className="space-y-1">
                  {availableSectionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAddSection(type)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-3"
                    >
                      <span className="text-xl">{getSectionTypeIcon(type)}</span>
                      <div>
                        <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {!validation.isValid && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-yellow-800 font-medium text-sm">Please fix the following issues:</h4>
                <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section List */}
      <div className="space-y-4">
        {deck.sections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600 mb-4">Add your first section to get started</p>
            <button
              onClick={() => setShowAddSectionMenu(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Section
            </button>
          </div>
        ) : (
          deck.sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              onUpdate={(updates) => updateSection(section.id, updates)}
              onRemove={() => removeSection(section.id)}
              isSelected={selectedSectionId === section.id}
              onSelect={() => setSelectedSectionId(section.id)}
            />
          ))
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={(templateId, title) => {
            if (confirm('Creating a new deck will replace your current work. Continue?')) {
              handleCreateDeck(templateId, title);
            }
          }}
          onCancel={() => setShowTemplateSelector(false)}
        />
      )}

      {/* Click outside to close add section menu */}
      {showAddSectionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAddSectionMenu(false)}
        />
      )}
    </div>
  );
}
