import React, { useState, useEffect, useCallback } from 'react';
import { Deck, DeckSection, SectionType } from '../types';
import { ChevronLeft, ChevronRight, Edit3, Maximize, X, ArrowLeft } from 'lucide-react';

interface DeckPreviewProps {
  deck: Deck;
  onBackToEdit?: () => void;
}

export function DeckPreview({ deck, onBackToEdit }: DeckPreviewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSection = deck.sections[currentSectionIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else if (onBackToEdit) {
            onBackToEdit();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSectionIndex, isFullscreen, onBackToEdit]);

  const goToNext = useCallback(() => {
    if (currentSectionIndex < deck.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, deck.sections.length]);

  const goToPrevious = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  }, [currentSectionIndex]);

  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
  };

  const enterFullscreen = () => {
    setIsFullscreen(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!currentSection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No sections to preview</h2>
          <p className="text-gray-600">Add sections to your deck to see the preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen bg-gray-50'}`}>
      {/* Header (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToEdit && (
                <button
                  onClick={onBackToEdit}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Edit
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{deck.title}</h1>
                <p className="text-sm text-gray-500">
                  Section {currentSectionIndex + 1} of {deck.sections.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={enterFullscreen}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Maximize className="w-4 h-4" />
                Present
              </button>
              {onBackToEdit && (
                <button
                  onClick={onBackToEdit}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Header */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={exitFullscreen}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${isFullscreen ? 'h-full' : 'min-h-[calc(100vh-80px)]'} flex items-center justify-center p-6`}>
        <div className={`w-full max-w-4xl mx-auto ${isFullscreen ? 'h-full flex items-center' : ''}`}>
          {/* Section Content */}
          <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'w-full h-full p-12' : 'p-8'} ${isFullscreen ? 'flex items-center justify-center' : ''}`}>
            <div className={`w-full ${isFullscreen ? 'max-w-6xl' : ''}`}>
              <SectionPreview section={currentSection} isFullscreen={isFullscreen} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={`${isFullscreen ? 'absolute bottom-6 left-1/2 transform -translate-x-1/2' : 'fixed bottom-6 left-1/2 transform -translate-x-1/2'} z-10`}>
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 flex items-center gap-4">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentSectionIndex === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous section"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {deck.sections.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSection(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSectionIndex
                    ? 'bg-blue-600'
                    : index < currentSectionIndex
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentSectionIndex === deck.sections.length - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next section"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Section Counter */}
          <div className="ml-2 text-sm text-gray-600 font-medium">
            {currentSectionIndex + 1} / {deck.sections.length}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help (only in fullscreen) */}
      {isFullscreen && (
        <div className="absolute bottom-6 left-6 z-10">
          <div className="bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded-lg">
            <div>← → Navigate</div>
            <div>Space Next</div>
            <div>Esc Exit</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple read-only section preview component
interface SectionPreviewProps {
  section: DeckSection;
  isFullscreen: boolean;
}

function SectionPreview({ section, isFullscreen }: SectionPreviewProps) {
  const getSectionIcon = (type: SectionType) => {
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

  const renderSectionContent = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-6 text-center">
            <h1 className={`font-bold text-gray-900 ${isFullscreen ? 'text-6xl' : 'text-4xl'}`}>
              {section.content.headline || 'Your Company Name'}
            </h1>
            <p className={`text-gray-600 ${isFullscreen ? 'text-2xl' : 'text-xl'}`}>
              {section.content.tagline || 'Your compelling tagline goes here'}
            </p>
          </div>
        );

      case 'problem':
        return (
          <div className="space-y-6">
            <h2 className={`font-bold text-gray-900 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              The Problem
            </h2>
            <p className={`text-gray-700 ${isFullscreen ? 'text-xl' : 'text-lg'} leading-relaxed`}>
              {section.content.description || 'Describe the problem your target customers face'}
            </p>
            {section.content.painPoints && section.content.painPoints.length > 0 && (
              <div>
                <h3 className={`font-semibold text-gray-800 ${isFullscreen ? 'text-2xl' : 'text-lg'} mb-3`}>
                  Key Pain Points:
                </h3>
                <ul className="space-y-2">
                  {section.content.painPoints.map((point: string, index: number) => (
                    <li key={index} className={`flex items-start ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                      <span className="text-red-500 mr-3">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'solution':
        return (
          <div className="space-y-6">
            <h2 className={`font-bold text-gray-900 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              Our Solution
            </h2>
            <p className={`text-gray-700 ${isFullscreen ? 'text-xl' : 'text-lg'} leading-relaxed`}>
              {section.content.description || 'How you solve the problem better than anyone else'}
            </p>
            {section.content.keyFeatures && section.content.keyFeatures.length > 0 && (
              <div>
                <h3 className={`font-semibold text-gray-800 ${isFullscreen ? 'text-2xl' : 'text-lg'} mb-3`}>
                  Key Features:
                </h3>
                <ul className="space-y-2">
                  {section.content.keyFeatures.map((feature: string, index: number) => (
                    <li key={index} className={`flex items-start ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'market':
        return (
          <div className="space-y-6">
            <h2 className={`font-bold text-gray-900 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              Market Opportunity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className={`font-semibold text-blue-800 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>TAM</h3>
                <p className={`text-blue-600 ${isFullscreen ? 'text-lg' : 'text-base'} mt-2`}>
                  {section.content.tam || '$X billion'}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className={`font-semibold text-green-800 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>SAM</h3>
                <p className={`text-green-600 ${isFullscreen ? 'text-lg' : 'text-base'} mt-2`}>
                  {section.content.sam || '$X billion'}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className={`font-semibold text-purple-800 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>SOM</h3>
                <p className={`text-purple-600 ${isFullscreen ? 'text-lg' : 'text-base'} mt-2`}>
                  {section.content.som || '$X billion'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'funding':
        return (
          <div className="space-y-6">
            <h2 className={`font-bold text-gray-900 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              Funding Request
            </h2>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className={`text-green-600 ${isFullscreen ? 'text-3xl' : 'text-2xl'} font-bold`}>
                {section.content.amount || '$X million'}
              </p>
            </div>
            {section.content.useOfFunds && section.content.useOfFunds.length > 0 && (
              <div>
                <h3 className={`font-semibold text-gray-800 ${isFullscreen ? 'text-2xl' : 'text-lg'} mb-3`}>
                  Use of Funds:
                </h3>
                <ul className="space-y-2">
                  {section.content.useOfFunds.map((use: string, index: number) => (
                    <li key={index} className={`flex items-start ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                      <span className="text-blue-500 mr-3">•</span>
                      <span className="text-gray-700">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className={`font-bold text-gray-900 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              {section.title}
            </h2>
            <p className={`text-gray-700 ${isFullscreen ? 'text-xl' : 'text-lg'} leading-relaxed`}>
              {section.content.description || `Content for ${section.title} section`}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center mb-8">
        <span className={`${isFullscreen ? 'text-4xl' : 'text-3xl'} mr-4`}>
          {getSectionIcon(section.type)}
        </span>
        <div>
          <h1 className={`font-bold text-gray-900 ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
            {section.title}
          </h1>
          <p className={`text-gray-500 ${isFullscreen ? 'text-lg' : 'text-sm'} capitalize`}>
            {section.type.replace('-', ' ')} section
          </p>
        </div>
      </div>

      {/* Section Content */}
      {renderSectionContent()}
    </div>
  );
}
