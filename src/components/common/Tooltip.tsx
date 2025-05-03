import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactElement;
  className?: string;
}

/**
 * Tooltip component
 * 
 * Displays a tooltip when hovering over the child element.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 300,
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const showTooltip = () => {
    const handler = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setDelayHandler(handler);
  };
  
  const hideTooltip = () => {
    if (delayHandler) {
      clearTimeout(delayHandler);
      setDelayHandler(null);
    }
    setIsVisible(false);
  };
  
  // Handle click outside to hide tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        hideTooltip();
      }
    };
    
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);
  
  // Get position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '5px'
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '5px'
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '5px'
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '5px'
        };
      default:
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '5px'
        };
    }
  };
  
  // Clone the child element with onMouseEnter and onMouseLeave props
  const childWithProps = React.cloneElement(children, {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onClick: (e: React.MouseEvent) => {
      if (children.props.onClick) {
        children.props.onClick(e);
      }
      hideTooltip();
    }
  });
  
  return (
    <div className="relative inline-block" ref={tooltipRef}>
      {childWithProps}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-md whitespace-nowrap ${className}`}
            style={getPositionStyles()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
