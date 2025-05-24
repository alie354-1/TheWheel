import React from 'react';
import { Template } from '../types';
import { DeckService } from '../services/deckService';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string, title: string) => void;
  onCancel: () => void;
}

export function TemplateSelector({ onSelectTemplate, onCancel }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [deckTitle, setDeckTitle] = React.useState<string>('');
  
  const templates = DeckService.getTemplates();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate && deckTitle.trim()) {
      onSelectTemplate(selectedTemplate, deckTitle.trim());
    }
  };

  const getCategoryIcon = (category: Template['category']) => {
    switch (category) {
      case 'vc-pitch':
        return '💰';
      case 'product-demo':
        return '🚀';
      case 'market-opportunity':
        return '📈';
      case 'technical':
        return '⚡';
      default:
        return '📊';
    }
  };

  const getCategoryColor = (category: Template['category']) => {
    switch (category) {
      case 'vc-pitch':
        return 'border-green-200 bg-green-50';
      case 'product-demo':
        return 'border-blue-200 bg-blue-50';
      case 'market-opportunity':
        return 'border-purple-200 bg-purple-50';
      case 'technical':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Pitch Deck</h2>
          <p className="text-gray-600 mt-1">Choose a template to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Deck Title Input */}
          <div className="mb-6">
            <label htmlFor="deckTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Deck Title
            </label>
            <input
              type="text"
              id="deckTitle"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="Enter your pitch deck title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : `${getCategoryColor(template.category)} hover:border-gray-300`
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {template.sections.length} sections
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Template Preview</h4>
              <div className="text-sm text-gray-600">
                {(() => {
                  const template = templates.find(t => t.id === selectedTemplate);
                  return template ? (
                    <div className="space-y-1">
                      <p><strong>Sections included:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        {template.sections.map((sectionType, index) => (
                          <li key={index} className="capitalize">
                            {sectionType.replace('-', ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTemplate || !deckTitle.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
