/**
 * Utility functions for parsing LLM responses
 */
export const responseParser = {
  /**
   * Extract JSON from a string that may contain markdown or other text
   * @param content String that may contain JSON
   * @returns Parsed JSON object or array
   */
  extractJSON(content: string): any {
    try {
      // First try direct JSON parsing
      try {
        return JSON.parse(content);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from markdown code blocks
      }

      // Look for JSON in markdown code blocks with ```json
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
      const jsonBlockMatch = content.match(jsonBlockRegex);
      
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        const jsonContent = jsonBlockMatch[1].trim();
        return JSON.parse(jsonContent);
      }

      // If we still don't have valid JSON, try to find any JSON-like structure
      const possibleJsonRegex = /(\{[\s\S]*\}|\[[\s\S]*\])/;
      const possibleJsonMatch = content.match(possibleJsonRegex);
      
      if (possibleJsonMatch && possibleJsonMatch[1]) {
        const jsonContent = possibleJsonMatch[1].trim();
        return JSON.parse(jsonContent);
      }

      // If all extraction attempts fail, throw an error
      throw new Error('Could not extract valid JSON from response');
    } catch (error) {
      console.error('Error parsing response JSON:', error);
      console.error('Original content:', content);
      
      // Return null to indicate parsing failure
      return null;
    }
  },

  /**
   * Clean and normalize text from LLM response
   * @param text Text to clean
   * @returns Cleaned text
   */
  cleanText(text: string): string {
    if (!text) return '';
    
    // Remove extra whitespace, normalize line endings
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  /**
   * Extract a list from a string that may be comma-separated or have bullet points
   * @param text Text containing a list
   * @returns Array of list items
   */
  extractList(text: string): string[] {
    if (!text) return [];
    
    // Check if the text has bullet points
    if (text.includes('•') || text.includes('-') || text.includes('*')) {
      return text
        .split(/[\n\r]+/)
        .map(line => line.replace(/^[\s•\-\*]+/, '').trim())
        .filter(Boolean);
    }
    
    // Otherwise treat as comma-separated
    return text
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
};
