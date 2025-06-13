import React from 'react';

interface CommentScopeToggleProps {
  scope: 'slide' | 'deck';
  onScopeChange: (scope: 'slide' | 'deck') => void;
}

export const CommentScopeToggle: React.FC<CommentScopeToggleProps> = ({ scope, onScopeChange }) => {
  const toggleContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    padding: '4px',
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    fontSize: '13px',
    outline: 'none',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ffffff',
    color: '#007bff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <div style={toggleContainerStyle}>
      <button
        style={scope === 'slide' ? activeButtonStyle : buttonStyle}
        onClick={() => onScopeChange('slide')}
      >
        Current Slide
      </button>
      <button
        style={scope === 'deck' ? activeButtonStyle : buttonStyle}
        onClick={() => onScopeChange('deck')}
      >
        Entire Deck
      </button>
    </div>
  );
};
