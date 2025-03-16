import React, { useState } from 'react';
import { generalLLMService } from '../../../lib/services/general-llm.service';
import { useAuthStore } from '../../../lib/store';

interface SmartSuggestionButtonProps {
  fieldType: 'title' | 'description' | 'problem' | 'solution' | 'audience' | 'value' | 'model' | 'strategy';
  currentValue: string;
  onSuggestionSelect: (suggestion: string) => void;
}

/**
 * A button that provides AI-powered suggestions for specific fields.
 * When clicked, it generates and displays a popover with enhanced suggestions.
 */
const SmartSuggestionButton: React.FC<SmartSuggestionButtonProps> = ({
  fieldType,
  currentValue,
  onSuggestionSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user, featureFlags } = useAuthStore();
  const useMockAI = featureFlags?.useMockAI?.enabled || false;

  // Generate field-specific suggestions
  const generateSuggestions = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      let prompt = '';
      let minLength = 3; // Minimum length to attempt enhancements

      // If the current value is too short, give generic suggestions
      if (!currentValue || currentValue.length < minLength) {
        switch (fieldType) {
          case 'title':
            prompt = `Generate 3 example business idea titles that are compelling, descriptive, and memorable.`;
            break;
          case 'description':
            prompt = `Generate 3 example business idea descriptions (2-3 sentences each) that are clear, concise, and compelling.`;
            break;
          case 'problem':
            prompt = `Generate 3 example problem statements (2-3 sentences each) for business ideas that are clear, specific, and market-relevant.`;
            break;
          case 'solution':
            prompt = `Generate 3 example solution descriptions (2-3 sentences each) for business ideas that are innovative, feasible, and address real problems.`;
            break;
          case 'audience':
            prompt = `Generate 3 example target audience descriptions for business ideas that are specific, detailed, and identify clear demographics and pain points.`;
            break;
          case 'value':
            prompt = `Generate 3 example value proposition statements for business ideas that are compelling, differentiated, and customer-focused.`;
            break;
          case 'model':
            prompt = `Generate 3 example business model descriptions that are innovative, sustainable, and outline clear revenue streams.`;
            break;
          case 'strategy':
            prompt = `Generate 3 example go-to-market strategy summaries that are focused, actionable, and identify key channels and tactics.`;
            break;
          default:
            prompt = `Generate 3 example high-quality text entries for a business planning document.`;
        }
      } else {
        // Otherwise, enhance the current value
        switch (fieldType) {
          case 'title':
            prompt = `Enhance this business idea title to make it more compelling and descriptive: "${currentValue}". Provide 3 improved versions that maintain the core concept but make it more memorable and clear.`;
            break;
          case 'description':
            prompt = `Enhance this business idea description to make it more compelling, clear, and concise: "${currentValue}". Provide 3 improved versions that maintain the core concept but make it more polished.`;
            break;
          case 'problem':
            prompt = `Enhance this problem statement to make it more specific, compelling, and market-relevant: "${currentValue}". Provide 3 improved versions that maintain the core issue but make it more precise.`;
            break;
          case 'solution':
            prompt = `Enhance this solution description to make it more innovative, feasible, and compelling: "${currentValue}". Provide 3 improved versions that maintain the core solution but make it more effective.`;
            break;
          case 'audience':
            prompt = `Enhance this target audience description to make it more specific and detailed: "${currentValue}". Provide 3 improved versions that maintain the core audience but add more useful details about demographics, behaviors, or pain points.`;
            break;
          case 'value':
            prompt = `Enhance this value proposition to make it more compelling and customer-focused: "${currentValue}". Provide 3 improved versions that maintain the core value but make it more unique and powerful.`;
            break;
          case 'model':
            prompt = `Enhance this business model description to make it more clear and sustainable: "${currentValue}". Provide 3 improved versions that maintain the core approach but make it more viable and detailed.`;
            break;
          case 'strategy':
            prompt = `Enhance this go-to-market strategy to make it more focused and actionable: "${currentValue}". Provide 3 improved versions that maintain the core approach but make it more effective and targeted.`;
            break;
          default:
            prompt = `Enhance this text to make it more professional and compelling: "${currentValue}". Provide 3 improved versions.`;
        }
      }

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: fieldType
      });

      // Extract suggestions from the AI response
      const extractedSuggestions = extractSuggestionsFromText(response.content);
      setSuggestions(extractedSuggestions.length > 0 ? extractedSuggestions : [`No specific suggestions found. Try adding more details to your ${fieldType}.`]);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions(['Failed to generate suggestions. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract suggestions from AI response text
  const extractSuggestionsFromText = (text: string): string[] => {
    // Try to find numbered or bulleted suggestions
    const suggestions: string[] = [];
    
    // Look for numbered patterns like "1. Suggestion" or "1) Suggestion"
    const numberedMatches = text.match(/\d+[\)\.]\s*([^\n\d]+)/g);
    if (numberedMatches && numberedMatches.length > 0) {
      numberedMatches.forEach(match => {
        const suggestion = match.replace(/^\d+[\)\.]\s*/, '').trim();
        if (suggestion) suggestions.push(suggestion);
      });
      return suggestions;
    }
    
    // Look for bullet patterns like "• Suggestion" or "- Suggestion"
    const bulletMatches = text.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
    if (bulletMatches && bulletMatches.length > 0) {
      bulletMatches.forEach(match => {
        const suggestion = match.replace(/^[•\-\*]\s*/, '').trim();
        if (suggestion) suggestions.push(suggestion);
      });
      return suggestions;
    }
    
    // If no patterns found, split by newlines and filter non-empty lines
    const lines = text.split('\n').map(line => line.trim())
      .filter(line => line.length > 0 && line.length < 200); // Reasonable suggestion length
    
    return lines.slice(0, 3); // Limit to 3 suggestions
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={generateSuggestions}
        className="inline-flex items-center px-3 py-1 border border-indigo-300 text-xs bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Enhance
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-96 bg-white shadow-lg rounded-md border overflow-hidden right-0">
          <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">AI Suggestions</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin h-4 w-4 border-2 border-indigo-500 border-r-transparent rounded-full mr-2"></div>
                Generating suggestions...
              </div>
            ) : (
              <div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b text-sm"
                    onClick={() => {
                      onSuggestionSelect(suggestion);
                      setIsOpen(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestionButton;
