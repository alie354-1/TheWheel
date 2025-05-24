import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DeckLibrary } from '../components/DeckLibrary';
import { DeckService } from '../services/deckService';
import { supabase } from '../../lib/supabase';

export default function DeckLibraryPage() {
  const navigate = useNavigate();

  const handleCreateNew = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Create a new empty deck
      const newDeck = DeckService.createEmptyDeck('Untitled Deck');
      const savedDeck = await DeckService.saveDeck(newDeck, user.id);
      
      // Navigate to edit the new deck
      navigate(`/deck-builder/edit/${savedDeck.id}`);
    } catch (error) {
      console.error('Error creating new deck:', error);
      alert('Failed to create new deck');
    }
  };

  const handleOpenDeck = (deckId: string) => {
    navigate(`/deck-builder/edit/${deckId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DeckLibrary 
        onCreateNew={handleCreateNew}
        onOpenDeck={handleOpenDeck}
      />
    </div>
  );
}
