import React from 'react';
import { FeedbackCategory } from '../../types/index.ts';

interface SegmentedControlProps {
  options: { label: string; value: FeedbackCategory }[];
  value: FeedbackCategory;
  onChange: (value: FeedbackCategory) => void;
  disabled?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    border: '1px solid #ccc',
    borderRadius: '6px',
    overflow: 'hidden',
  };

  const optionStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '6px 12px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isActive ? '#007bff' : '#f0f0f0',
    color: isActive ? 'white' : '#333',
    borderRight: '1px solid #ccc',
    transition: 'background-color 0.2s, color 0.2s',
    fontSize: '13px',
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <div style={containerStyle}>
      {options.map((option, index) => (
        <div
          key={option.value}
          style={{
            ...optionStyle(value === option.value),
            borderRight: index === options.length - 1 ? 'none' : '1px solid #ccc',
          }}
          onClick={() => !disabled && onChange(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};
