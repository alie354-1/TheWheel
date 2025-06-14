import React from 'react';
import DOMPurify from 'dompurify';

interface SafeTextRendererProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SafeTextRenderer: React.FC<SafeTextRendererProps> = ({ html, className, style }) => {
  // Configure DOMPurify to allow list-related tags and attributes
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a', 'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'title', 'style', 'class'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div
      className={`safe-text-renderer prose max-w-none ${className || ''}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
