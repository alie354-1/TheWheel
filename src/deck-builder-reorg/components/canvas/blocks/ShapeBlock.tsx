import React from 'react';
import { ShapeBlock } from '../../../types/blocks.ts';

interface ShapeBlockProps extends Omit<ShapeBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<ShapeBlock>) => void;
}

export const Shape: React.FC<ShapeBlockProps> = ({
  shape,
  style,
  onUpdate,
}) => {
  const shapeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    ...style,
  };

  const renderShape = () => {
    switch (shape) {
      case 'rectangle':
        return <div style={shapeStyle} />;
      case 'circle':
        return <div style={{ ...shapeStyle, borderRadius: '50%' }} />;
      case 'line':
        return <div style={{ ...shapeStyle, borderTop: `2px solid ${style?.backgroundColor || 'black'}` }} />;
      case 'arrow':
        return (
          <div style={{ width: 0, height: 0, borderTop: '50px solid transparent', borderBottom: '50px solid transparent', borderLeft: `50px solid ${style?.backgroundColor || 'black'}` }} />
        );
      default:
        return <div style={shapeStyle} />;
    }
  };

  return <>{renderShape()}</>;
};

export default Shape;
