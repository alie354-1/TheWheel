import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DeckService } from '../services/deckService';
import { Deck } from '../types';
import { Search, Plus, MoreVertical, Eye, Copy, Trash2, Clock, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DeckLibraryProps {
  onCreateNew: () => void;
  onOpenDeck: (deckId: string) => void;
}

export function DeckLibrary({ onCreateNew, onOpenDeck }: DeckLibraryProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadDecks();
    }
  }, [userId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        setUserId(user.id);
      } else {
        setError('Please sign in to view your decks');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error getting user:', err);
      setError('Authentication error');
      setLoading(false);
    }
  };

  const loadDecks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const userDecks = await DeckService.listDecks(userId);
      setDecks(userDecks);
    } catch (err) {
      setError('Failed to load decks');
      console.error('Error loading decks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }

    try {
      await DeckService.deleteDeck(deckId);
      setDecks(decks.filter(deck => deck.id !== deckId));
    } catch (err) {
      console.error('Error deleting deck:', err);
      alert('Failed to delete deck');
    }
  };

  const handleDuplicateDeck = async (deck: Deck) => {
    if (!userId) return;

    try {
      // Create a new deck with copied sections
      const duplicatedDeck = DeckService.createEmptyDeck(`${deck.title} (Copy)`);
      duplicatedDeck.sections = deck.sections.map(section => ({
        ...section,
        id: `${section.id}-copy-${Date.now()}`
      }));
      
      const savedDeck = await DeckService.saveDeck(duplicatedDeck, userId);
      setDecks([savedDeck, ...decks]);
    } catch (err) {
      console.error('Error duplicating deck:', err);
      alert('Failed to duplicate deck');
    }
  };

  const filteredDecks = decks
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        {userId && (
          <button
            onClick={loadDecks}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pitch Decks</h1>
          <p className="text-gray-600 mt-1">Create and manage your presentations</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          New Deck
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search decks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="updated_at">Last Modified</option>
          <option value="created_at">Date Created</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Empty State */}
      {filteredDecks.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No decks yet</h3>
          <p className="text-gray-500 mb-4">Create your first pitch deck to get started</p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Deck
          </button>
        </div>
      )}

      {/* No Search Results */}
      {filteredDecks.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500">No decks found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Deck Grid */}
      {filteredDecks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onOpen={() => onOpenDeck(deck.id)}
              onDelete={() => handleDeleteDeck(deck.id)}
              onDuplicate={() => handleDuplicateDeck(deck)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DeckCardProps {
  deck: Deck;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  formatDate: (date: string) => string;
}

function DeckCard({ deck, onOpen, onDelete, onDuplicate, formatDate }: DeckCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group">
      {/* Thumbnail */}
      <div 
        className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg cursor-pointer flex items-center justify-center"
        onClick={onOpen}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{deck.sections.length}</div>
          <div className="text-sm text-blue-500">sections</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 line-clamp-2"
            onClick={onOpen}
          >
            {deck.title}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onOpen();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(deck.updated_at)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {deck.sections.length} sections
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
