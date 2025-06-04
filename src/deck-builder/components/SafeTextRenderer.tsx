import React, { useMemo } from 'react';

const SafeTextRenderer: React.FC<{ content: any; className?: string }> = ({ content, className = '' }) => {
  const cleanContent = useMemo(() => {
    if (typeof content === 'string') {
      return content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
        .replace(/&/g, '&') 
        .replace(/</g, '<')  
        .replace(/>/g, '>')  
        .replace(/[^\x20-\x7E\x0A\x0D]/g, '') // Remove non-printable characters
        .trim();
    }
    if (typeof content === 'object' && content !== null) {
      // For objects, pretty-print JSON, ensuring it's also "safe" by nature of JSON stringification
      return JSON.stringify(content, null, 2);
    }
    // Ensure even numbers or other types are converted to string
    return String(content || ''); 
  }, [content]);

  // Render the cleaned content within a div.
  // Using dangerouslySetInnerHTML is generally risky, but here `cleanContent` has been sanitized.
  // However, for maximum safety with React, it's better to let React handle the string rendering.
  // If cleanContent were to contain accidental JSX-like strings after cleaning (e.g. "{text}"),
  // rendering directly would be safer than dangerouslySetInnerHTML.
  return <div className={className}>{cleanContent}</div>;
};

export default SafeTextRenderer;
