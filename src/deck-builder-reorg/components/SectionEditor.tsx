import React from 'react';
import { DeckSection, SectionType } from '../types';

interface SectionEditorProps {
  section: DeckSection;
  onUpdate: (updates: Partial<DeckSection>) => void;
  onRemove: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function SectionEditor({ 
  section, 
  onUpdate, 
  onRemove, 
  isSelected = false, 
  onSelect 
}: SectionEditorProps) {
  const handleContentUpdate = (field: string, value: any) => {
    onUpdate({
      content: {
        ...section.content,
        [field]: value
      }
    });
  };

  const handleTitleUpdate = (title: string) => {
    onUpdate({ title });
  };

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

  const renderContentEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline
              </label>
              <input
                type="text"
                value={section.content.headline || ''}
                onChange={(e) => handleContentUpdate('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your company name or tagline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={section.content.tagline || ''}
                onChange={(e) => handleContentUpdate('tagline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="One-line description of what you do"
              />
            </div>
          </div>
        );

      case 'problem':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => handleContentUpdate('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the problem your target customers face"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pain Points
              </label>
              <PainPointsList
                painPoints={section.content.painPoints || []}
                onChange={(painPoints) => handleContentUpdate('painPoints', painPoints)}
              />
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solution Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => handleContentUpdate('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="How you solve the problem better than anyone else"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Features
              </label>
              <FeaturesList
                features={section.content.keyFeatures || []}
                onChange={(features) => handleContentUpdate('keyFeatures', features)}
              />
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Addressable Market (TAM)
              </label>
              <input
                type="text"
                value={section.content.tam || ''}
                onChange={(e) => handleContentUpdate('tam', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="$X billion Total Addressable Market"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviceable Addressable Market (SAM)
              </label>
              <input
                type="text"
                value={section.content.sam || ''}
                onChange={(e) => handleContentUpdate('sam', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="$X billion Serviceable Addressable Market"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviceable Obtainable Market (SOM)
              </label>
              <input
                type="text"
                value={section.content.som || ''}
                onChange={(e) => handleContentUpdate('som', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="$X billion Serviceable Obtainable Market"
              />
            </div>
          </div>
        );

      case 'funding':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funding Amount
              </label>
              <input
                type="text"
                value={section.content.amount || ''}
                onChange={(e) => handleContentUpdate('amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="$X million"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Use of Funds
              </label>
              <UseOfFundsList
                useOfFunds={section.content.useOfFunds || []}
                onChange={(useOfFunds) => handleContentUpdate('useOfFunds', useOfFunds)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={section.content.description || ''}
              onChange={(e) => handleContentUpdate('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter content for ${section.title}`}
            />
          </div>
        );
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getSectionIcon(section.type)}</span>
          <div>
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleTitleUpdate(e.target.value)}
              className="font-medium text-lg bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-gray-300 focus:rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-sm text-gray-500 capitalize">
              {section.type.replace('-', ' ')} section
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-red-500 hover:text-red-700 p-1"
          title="Remove section"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Section Content Editor */}
      <div onClick={(e) => e.stopPropagation()}>
        {renderContentEditor()}
      </div>
    </div>
  );
}

// Helper components for list editing
function PainPointsList({ painPoints, onChange }: { painPoints: string[], onChange: (points: string[]) => void }) {
  const addPainPoint = () => {
    onChange([...painPoints, '']);
  };

  const updatePainPoint = (index: number, value: string) => {
    const updated = [...painPoints];
    updated[index] = value;
    onChange(updated);
  };

  const removePainPoint = (index: number) => {
    onChange(painPoints.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {painPoints.map((point, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={point}
            onChange={(e) => updatePainPoint(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Pain point ${index + 1}`}
          />
          <button
            onClick={() => removePainPoint(index)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addPainPoint}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Add pain point
      </button>
    </div>
  );
}

function FeaturesList({ features, onChange }: { features: string[], onChange: (features: string[]) => void }) {
  const addFeature = () => {
    onChange([...features, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    onChange(updated);
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={feature}
            onChange={(e) => updateFeature(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Feature ${index + 1}`}
          />
          <button
            onClick={() => removeFeature(index)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addFeature}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Add feature
      </button>
    </div>
  );
}

function UseOfFundsList({ useOfFunds, onChange }: { useOfFunds: string[], onChange: (funds: string[]) => void }) {
  const addUseOfFunds = () => {
    onChange([...useOfFunds, '']);
  };

  const updateUseOfFunds = (index: number, value: string) => {
    const updated = [...useOfFunds];
    updated[index] = value;
    onChange(updated);
  };

  const removeUseOfFunds = (index: number) => {
    onChange(useOfFunds.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {useOfFunds.map((use, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={use}
            onChange={(e) => updateUseOfFunds(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Use ${index + 1} (X%)`}
          />
          <button
            onClick={() => removeUseOfFunds(index)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addUseOfFunds}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Add use of funds
      </button>
    </div>
  );
}
