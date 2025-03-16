import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type TutorialStep = {
  target: string; // CSS selector for the target element
  title: string;
  content: string | React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  action?: () => void; // Optional action to perform when this step is shown
};

interface OnboardingTutorialProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  pathwayName: string; // Used for tracking and local storage key
}

/**
 * Reusable onboarding tutorial component that guides users through different
 * features of the application with step-by-step tooltips
 */
const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  pathwayName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 0, height: 0 });
  const [targetDimensions, setTargetDimensions] = useState({ width: 0, height: 0, top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  // Handle scroll and resize events
  useEffect(() => {
    if (!isOpen) return;
    
    const handleScrollResize = () => {
      if (currentStep < steps.length) {
        positionTooltip(steps[currentStep].target, steps[currentStep].position);
      }
    };
    
    window.addEventListener('scroll', handleScrollResize);
    window.addEventListener('resize', handleScrollResize);
    
    return () => {
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen, currentStep, steps]);

  // Position the tooltip when the current step changes
  useEffect(() => {
    if (!isOpen) return;
    
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      
      // Execute the step's action if defined
      if (step.action) {
        step.action();
      }
      
      // Position the tooltip after a small delay to allow for any DOM changes
      setTimeout(() => {
        positionTooltip(step.target, step.position);
        setIsVisible(true);
      }, 100);
    }
  }, [isOpen, currentStep, steps]);
  
  // Update tooltip position when its dimensions change
  useEffect(() => {
    if (tooltipRef && isVisible) {
      setTooltipDimensions({
        width: tooltipRef.offsetWidth,
        height: tooltipRef.offsetHeight
      });
    }
  }, [tooltipRef, isVisible]);

  // Set the reference to the tooltip div
  const tooltipRefCallback = (node: HTMLDivElement | null) => {
    if (node) {
      setTooltipRef(node);
    }
  };

  // Calculate and set tooltip position
  const positionTooltip = (selector: string, preferredPosition: string = 'bottom') => {
    const target = document.querySelector(selector) as HTMLElement;
    
    if (!target) {
      console.warn(`Target element not found: ${selector}`);
      return;
    }
    
    const targetRect = target.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    setTargetDimensions({
      width: targetRect.width,
      height: targetRect.height,
      top: targetRect.top + scrollTop,
      left: targetRect.left + scrollLeft
    });
    
    // We'll update the actual position in the effect when we have tooltip dimensions
    calculateAndSetPosition(targetRect, preferredPosition);
  };

  // Calculate the tooltip position based on the target position and dimensions
  const calculateAndSetPosition = (
    targetRect: DOMRect, 
    preferredPosition: string = 'bottom'
  ) => {
    if (!tooltipRef) return;
    
    const tooltipWidth = tooltipDimensions.width || 300; // Default width if not measured yet
    const tooltipHeight = tooltipDimensions.height || 150; // Default height if not measured yet
    const padding = 10; // Padding between tooltip and target
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Calculate tooltip position based on preferred position
    let position = preferredPosition as 'top' | 'right' | 'bottom' | 'left';
    let top = 0;
    let left = 0;

    // Check if we have enough space in the preferred position, if not, flip to the opposite
    switch (position) {
      case 'top':
        top = targetRect.top + scrollTop - tooltipHeight - padding;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipWidth / 2);
        
        if (top < scrollTop) {
          // Not enough space at the top, show below instead
          position = 'bottom';
          top = targetRect.bottom + scrollTop + padding;
        }
        break;
        
      case 'right':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + scrollLeft + padding;
        
        if (left + tooltipWidth > scrollLeft + windowWidth) {
          // Not enough space at the right, show on the left instead
          position = 'left';
          left = targetRect.left + scrollLeft - tooltipWidth - padding;
        }
        break;
        
      case 'left':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left + scrollLeft - tooltipWidth - padding;
        
        if (left < scrollLeft) {
          // Not enough space at the left, show on the right instead
          position = 'right';
          left = targetRect.right + scrollLeft + padding;
        }
        break;
        
      case 'bottom':
      default:
        top = targetRect.bottom + scrollTop + padding;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipWidth / 2);
        
        if (top + tooltipHeight > scrollTop + windowHeight) {
          // Not enough space at the bottom, show above instead
          position = 'top';
          top = targetRect.top + scrollTop - tooltipHeight - padding;
        }
        break;
    }
    
    // Ensure the tooltip stays within the window horizontally
    if (left < scrollLeft) {
      left = scrollLeft + padding;
    } else if (left + tooltipWidth > scrollLeft + windowWidth) {
      left = scrollLeft + windowWidth - tooltipWidth - padding;
    }
    
    // If it still doesn't fit vertically, prioritize visibility from the top
    if (top < scrollTop) {
      top = scrollTop + padding;
    }
    
    setTooltipPosition({ top, left });
  };

  // Move to the next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      // Tutorial completed
      handleComplete();
    }
  };

  // Move to the previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 300);
    }
  };

  // Skip the tutorial
  const handleSkip = () => {
    // Store the choice in local storage
    localStorage.setItem(`tutorial-skipped-${pathwayName}`, 'true');
    onClose();
  };

  // Mark tutorial as completed
  const handleComplete = () => {
    // Store the completion in local storage
    localStorage.setItem(`tutorial-completed-${pathwayName}`, 'true');
    onComplete();
  };

  // If the tutorial is not open, don't render anything
  if (!isOpen || steps.length === 0) return null;

  // Get the current step
  const step = steps[currentStep];
  
  // Create a highlight overlay for the target element
  const renderHighlight = () => {
    if (!targetDimensions.width || !targetDimensions.height) return null;
    
    return (
      <div
        className="absolute z-40 border-2 border-indigo-500 rounded-md shadow-lg pointer-events-none"
        style={{
          top: targetDimensions.top,
          left: targetDimensions.left,
          width: targetDimensions.width,
          height: targetDimensions.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />
    );
  };

  // Render the tooltip
  return createPortal(
    <>
      {/* Backdrop overlay - covers the entire screen */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-30" />
      
      {/* Target element highlight */}
      {renderHighlight()}
      
      {/* Tooltip */}
      <div
        ref={tooltipRefCallback}
        className={`fixed bg-white rounded-lg shadow-xl z-50 transition-opacity duration-300 w-80 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Tooltip content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
          <div className="text-gray-600 mb-4">
            {step.content}
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-5 rounded-full ${
                    index === currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-xs text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-between mt-4">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-900"
              >
                Skip
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default OnboardingTutorial;
