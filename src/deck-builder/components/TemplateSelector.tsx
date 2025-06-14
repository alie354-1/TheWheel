import React from 'react';
import { DeckDataTemplate, SectionType, DeckSection } from '../types/index.ts';
import { DeckService } from '../services/deckService.ts';
import { Sparkles, ArrowRight, CheckCircle, FileText } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string, title: string) => void;
  onCreateEmpty?: (title: string) => void;
  onCancel: () => void;
  onImportHtml: () => void;
}

export function TemplateSelector({ onSelectTemplate, onCreateEmpty, onCancel, onImportHtml }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [deckTitle, setDeckTitle] = React.useState<string>('');
  
  const templates: DeckDataTemplate[] = DeckService.getTemplates(); // Explicitly type as DeckDataTemplate[]

  // handleSubmit is not directly used for form submission anymore, but logic is in the button onClick
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (selectedTemplate && deckTitle.trim()) {
  //     onSelectTemplate(selectedTemplate, deckTitle.trim());
  //   }
  // };

  const getCategoryIcon = (category: DeckDataTemplate['category']) => { // Use DeckDataTemplate['category']
    switch (category?.toLowerCase()) { // Add optional chaining and toLowerCase for robustness
      case 'business':
        return '💼'; // Business icon
      case 'portfolio':
        return '🎨'; // Portfolio icon
      case 'vc-pitch':
        return '💰';
      case 'product-demo':
        return '🚀';
      case 'market-opportunity':
        return '📈';
      case 'technical':
        return '⚡';
      default:
        return '📊'; // Default icon
    }
  };

  const getCategoryGradient = (category: DeckDataTemplate['category']) => { // Use DeckDataTemplate['category']
    switch (category?.toLowerCase()) { // Add optional chaining and toLowerCase
      case 'business':
        return 'from-sky-100 via-cyan-100 to-blue-100 border-sky-200';
      case 'portfolio':
        return 'from-purple-100 via-pink-100 to-rose-100 border-purple-200';
      case 'vc-pitch':
        return 'from-green-100 via-emerald-100 to-teal-100 border-green-200';
      case 'product-demo':
        return 'from-blue-100 via-indigo-100 to-purple-100 border-blue-200';
      case 'market-opportunity':
        return 'from-fuchsia-100 via-pink-100 to-rose-100 border-fuchsia-200'; // Adjusted gradient
      case 'technical':
        return 'from-orange-100 via-amber-100 to-yellow-100 border-orange-200';
      default:
        return 'from-slate-100 via-gray-100 to-slate-100 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      {/* Removed form onSubmit as it's handled by button click now */}
      <div className="space-y-8">
        {/* Deck Title Input */}
        <div className="space-y-3">
          <label htmlFor="deckTitle" className="block text-lg font-semibold text-slate-900">
            What's your deck called?
          </label>
          <input
            type="text"
            id="deckTitle"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="Enter your pitch deck title..."
            className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            required
          />
          <p className="text-sm text-slate-600">Give your deck a memorable name that captures your vision</p>
        </div>

        {/* Template Selection */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Choose Your Starting Point</h3>
            <p className="text-slate-600">Each template is designed for different presentation goals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start from Scratch Option */}
            <div
              key="start-from-scratch"
              className={`group relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                selectedTemplate === 'start-from-scratch'
                  ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]'
                  : 'bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 border-gray-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedTemplate('start-from-scratch')}
            >
              {selectedTemplate === 'start-from-scratch' && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/90 rounded-2xl shadow-lg flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                    📄
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Start from Scratch
                  </h3>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Begin with a blank canvas and build your deck your way.
                  </p>
                  {selectedTemplate === 'start-from-scratch' && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <span className="text-sm font-medium">Selected</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Import from HTML Option */}
            <div
              key="import-from-html"
              className="group relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-100 border-amber-200 hover:border-amber-300"
              onClick={onImportHtml}
            >
              {selectedTemplate === 'import-from-html' && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/90 rounded-2xl shadow-lg flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                    <FileText className="h-9 w-9 text-amber-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                    Import from HTML
                  </h3>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Convert existing HTML content into a presentation.
                  </p>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <span className="text-sm font-medium">Selected</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {templates.map((template) => (
              <div
                key={template.id}
                className={`group relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]'
                    : `bg-gradient-to-br ${getCategoryGradient(template.category)} hover:border-slate-300`
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                {/* Template Content */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white/90 rounded-2xl shadow-lg flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                      {getCategoryIcon(template.category)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <FileText className="w-4 h-4" />
                        {/* Access sections from template.deck */}
                        <span className="font-medium">{template.deck.sections.length} sections</span>
                      </div>
                      
                      {selectedTemplate === template.id && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <span className="text-sm font-medium">Selected</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Preview */}
        {selectedTemplate && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Your deck will include:</h4>
                <div className="text-slate-700">
                  {(() => {
                    const template = templates.find(t => t.id === selectedTemplate);
                    return template && template.deck && Array.isArray(template.deck.sections) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {template.deck.sections.map((section: DeckSection, index: number) => ( // Explicitly type section and index
                          <div key={section.id || index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="capitalize font-medium">
                              {section.title || (section.type as SectionType).replace('-', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (selectedTemplate === 'start-from-scratch' ? <p>A single blank slide will be created.</p> : null) ;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 border-2 border-slate-300 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200"
          >
            Back to Library
          </button>
          <button
            type="button"
            onClick={() => {
              if (deckTitle.trim()) {
                if (selectedTemplate === 'start-from-scratch') {
                  if (onCreateEmpty) {
                    onCreateEmpty(deckTitle.trim());
                  } else {
                    console.error('onCreateEmpty function is not provided');
                  }
                } else if (selectedTemplate === 'import-from-html') {
                  if (onImportHtml) {
                    onImportHtml();
                  } else {
                    console.error('onImportHtml function is not provided');
                  }
                } else if (selectedTemplate) {
                  onSelectTemplate(selectedTemplate, deckTitle.trim());
                }
              }
            }}
            disabled={!deckTitle.trim() || !selectedTemplate}
            className="group inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Create Deck</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}
