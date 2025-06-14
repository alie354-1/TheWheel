import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthorNoteModalProps {
  authorNote: string;
  deckTitle: string;
  onContinue: () => void;
  onShowTutorial: () => void;
  hasSeenSystemBefore: boolean;
}

export const AuthorNoteModal: React.FC<AuthorNoteModalProps> = ({
  authorNote,
  deckTitle,
  onContinue,
  onShowTutorial,
  hasSeenSystemBefore
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleContinue = () => {
    setIsAnimatingOut(true);
    setTimeout(onContinue, 300);
  };

  const handleShowTutorial = () => {
    setIsAnimatingOut(true);
    setTimeout(onShowTutorial, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${
      isAnimatingOut ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleContinue}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative max-w-2xl w-full bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${
            isAnimatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glass morphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-xl" />
          
          <div className="relative p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {deckTitle}
              </h2>
              <p className="text-sm text-gray-600">
                The author has left you a personal message
              </p>
            </div>
            
            {/* Author Note */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <div className="prose prose-blue max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: authorNote }}
                  className="text-gray-800"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              {!hasSeenSystemBefore && (
                <button
                  onClick={handleShowTutorial}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-2"
                >
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  First time? Learn how to provide feedback
                </button>
              )}
              
              <button
                onClick={handleContinue}
                className="ml-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Continue to Deck
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleContinue}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
