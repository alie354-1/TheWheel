import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DeckService } from '../services/deckService.ts';
import { Deck } from '../types/index.ts';
import { supabase } from '../../lib/supabase.ts';
import { 
  Plus,
  Search,
  Calendar,
  Eye,
  Copy,
  Trash2,
  Share,
  Edit,
  MoreVertical,
  Play,
  FileText,
  Sparkles,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';

interface DeckLibraryProps {
  onCreateNew?: () => void;
  onOpenDeck?: (deckId: string) => void;
  onImportHtml?: () => void;
}

export function DeckLibrary({ onCreateNew, onOpenDeck, onImportHtml }: DeckLibraryProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [previewDeck, setPreviewDeck] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  const loadDecks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const deckList = await DeckService.listDecks(user.id);
      setDecks(deckList);
    } catch (err) {
      setError('Failed to load your decks. Please try again.');
      console.error('Error loading decks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }

    try {
      await DeckService.deleteDeck(deckId);
      setDecks(decks.filter(deck => deck.id !== deckId));
      setSelectedDecks(prev => {
        const next = new Set(prev);
        next.delete(deckId);
        return next;
      });
    } catch (err) {
      setError('Failed to delete deck. Please try again.');
      console.error('Error deleting deck:', err);
    }
  };

  const handleDuplicateDeck = async (deckId: string) => {
    if (!user) return;

    try {
      const duplicatedDeck = await DeckService.duplicateDeck(deckId, user.id);
      const savedDeck = await DeckService.saveDeck(duplicatedDeck, user.id);
      setDecks([savedDeck, ...decks]);
    } catch (err) {
      setError('Failed to duplicate deck. Please try again.');
      console.error('Error duplicating deck:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDecks.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedDecks.size} deck(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(Array.from(selectedDecks).map(id => DeckService.deleteDeck(id)));
      setDecks(decks.filter(deck => !selectedDecks.has(deck.id)));
      setSelectedDecks(new Set());
    } catch (err) {
      setError('Failed to delete selected decks. Please try again.');
      console.error('Error bulk deleting decks:', err);
    }
  };

  const toggleDeckSelection = (deckId: string) => {
    setSelectedDecks(prev => {
      const next = new Set(prev);
      if (next.has(deckId)) {
        next.delete(deckId);
      } else {
        next.add(deckId);
      }
      return next;
    });
  };

  const handlePreview = (deckId: string) => {
    navigate(`/deck-builder/preview/${deckId}`);
  };

  const filteredAndSortedDecks = decks
    .filter(deck => 
      deck.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_at':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-600 font-medium">Loading your decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                My Decks
              </h1>
              <p className="text-lg text-slate-600">Create and manage your presentations with modern tools</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onCreateNew}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Create New Deck
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your decks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="updated_at">Last Modified</option>
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                </select>

                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {selectedDecks.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedDecks.size})
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedDecks.length === 0 && (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {searchTerm ? (
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No decks found</h3>
                <p className="text-slate-500 mb-8">No decks found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">Create your first pitch deck</h3>
                  <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">Start building professional presentations that tell your story and captivate your audience</p>
                </div>
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create New Deck
                </button>
              </div>
            )}
          </div>
        )}

        {/* Deck Grid/List */}
        {filteredAndSortedDecks.length > 0 && (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredAndSortedDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                isSelected={selectedDecks.has(deck.id)}
                onSelect={() => toggleDeckSelection(deck.id)}
                onDelete={() => handleDeleteDeck(deck.id)}
                onDuplicate={() => handleDuplicateDeck(deck.id)}
                onPreview={() => handlePreview(deck.id)}
                onOpenDeck={onOpenDeck}
                formatDate={formatDate}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DeckCardProps {
  deck: Deck;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  onOpenDeck?: (deckId: string) => void;
  formatDate: (date: string) => string;
  viewMode: 'grid' | 'list';
}

function DeckCard({ deck, isSelected, onSelect, onDelete, onDuplicate, onPreview, onOpenDeck, formatDate, viewMode }: DeckCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 hover:bg-white hover:shadow-lg border border-white/20 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            
            <div className="w-16 h-12 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg mb-1" title={deck.title}>
                {deck.title}
              </h3>
              <div className="flex items-center text-sm text-slate-500 space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Modified {formatDate(deck.updated_at)}
                </span>
                <span>{deck.sections?.length ?? 0} slides</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onPreview}
              className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            <Link
              to={`/deck-builder/edit/${deck.id}`}
              className="p-2 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onDuplicate();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement sharing
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Share className="h-4 w-4 mr-3" />
                      Share
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click overlay to close menu */}
        {showMenu && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 border border-white/20 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white/90 shadow-sm"
        />
      </div>

      {/* Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onPreview}
          className="p-2 bg-white/90 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm"
          title="Preview"
        >
          <Eye className="h-4 w-4" />
        </button>
        <Link
          to={`/deck-builder/edit/${deck.id}`}
          className="p-2 bg-white/90 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 shadow-sm"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Link>
      </div>

      {/* Thumbnail/Preview Area */}
      <Link to={`/deck-builder/edit/${deck.id}`} className="block">
        <div className="h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-purple-200/20"></div>
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-white/90 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {deck.sections?.length || 0} slide{(deck.sections?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-slate-900 truncate flex-1 text-lg mb-2" title={deck.title}>
            {deck.title}
          </h3>
          
          {/* Context Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
                <div className="py-1">
                  <Link
                    to={`/deck-builder/edit/${deck.id}`}
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      onPreview();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-3" />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement sharing
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Share className="h-4 w-4 mr-3" />
                    Share
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center text-sm text-slate-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Modified {formatDate(deck.updated_at)}</span>
        </div>
      </div>

      {/* Click overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
