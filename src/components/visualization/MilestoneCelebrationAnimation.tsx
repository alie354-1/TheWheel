import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Trophy, Star, CheckCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MilestoneCelebrationAnimationProps {
  type?: 'phase_completion' | 'step_completion' | 'journey_completion' | 'achievement';
  title?: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number; // milliseconds
  className?: string;
}

/**
 * MilestoneCelebrationAnimation Component
 * 
 * Displays animated celebrations for key achievements in the user's journey.
 * Part of the Sprint 2 implementation of the Journey System.
 */
export const MilestoneCelebrationAnimation: React.FC<MilestoneCelebrationAnimationProps> = ({
  type = 'step_completion',
  title,
  message,
  isVisible,
  onClose,
  autoCloseDelay = 5000,
  className = '',
}) => {
  const [confettiTriggered, setConfettiTriggered] = useState<boolean>(false);
  const [animationEnded, setAnimationEnded] = useState<boolean>(false);

  // Auto-close after delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible) {
      setAnimationEnded(false);
      setConfettiTriggered(false);
      
      // Set timer to auto-close
      timer = setTimeout(() => {
        setAnimationEnded(true);
        setTimeout(onClose, 500); // Allow exit animation to complete
      }, autoCloseDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoCloseDelay, onClose]);

  // Trigger confetti effect when visible
  useEffect(() => {
    if (isVisible && !confettiTriggered) {
      setConfettiTriggered(true);
      
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1000';
      document.body.appendChild(canvas);
      
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
      
      // Determine confetti style based on celebration type
      switch (type) {
        case 'journey_completion':
          // Gold confetti with extra duration
          myConfetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFC800', '#FFEC40', '#D4AF37'],
            gravity: 0.5,
            ticks: 300
          });
          break;
        case 'phase_completion':
          // Multi-color confetti with medium duration
          myConfetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.7 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a'],
            gravity: 0.7,
            ticks: 200
          });
          break;
        case 'achievement':
          // Star-shaped confetti if possible
          myConfetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.7 },
            colors: ['#FFD700', '#f44336', '#2196f3'],
            gravity: 0.8,
            scalar: 1.2,
            ticks: 150
          });
          break;
        case 'step_completion':
        default:
          // Standard confetti
          myConfetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.8 },
            gravity: 1,
            ticks: 100
          });
      }
      
      // Clean up the canvas after animation
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 3000);
    }
  }, [isVisible, confettiTriggered, type]);

  // Determine icon based on celebration type
  const renderIcon = () => {
    switch (type) {
      case 'journey_completion':
        return <Trophy className="h-12 w-12 text-yellow-500" />;
      case 'phase_completion':
        return <Award className="h-12 w-12 text-indigo-500" />;
      case 'achievement':
        return <Star className="h-12 w-12 text-blue-500" />;
      case 'step_completion':
      default:
        return <CheckCircle className="h-12 w-12 text-green-500" />;
    }
  };

  // Get default text based on celebration type
  const getDefaultTitle = () => {
    switch (type) {
      case 'journey_completion':
        return 'Journey Complete!';
      case 'phase_completion':
        return 'Phase Complete!';
      case 'achievement':
        return 'Achievement Unlocked!';
      case 'step_completion':
      default:
        return 'Step Complete!';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'journey_completion':
        return 'Congratulations on completing your entire journey! This is a major accomplishment.';
      case 'phase_completion':
        return "You've successfully completed this phase! You're making excellent progress.";
      case 'achievement':
        return "You've unlocked a special achievement! Keep up the great work.";
      case 'step_completion':
      default:
        return "Great job completing this step! You're one step closer to your goal.";
    }
  };

  // Animation classes
  const animationClasses = isVisible
    ? 'scale-100 opacity-100'
    : 'scale-75 opacity-0 pointer-events-none';
  
  const exitClasses = animationEnded
    ? 'scale-110 opacity-0'
    : '';

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'bg-black bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
      } ${className}`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-500 ${animationClasses} ${exitClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 relative">
            {renderIcon()}
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {title || getDefaultTitle()}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message || getDefaultMessage()}
          </p>
          
          <div className="flex space-x-2 items-center">
            <Heart className="h-5 w-5 text-pink-500" />
            <span className="text-sm font-medium text-gray-500">
              Your progress has been saved
            </span>
          </div>
          
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCelebrationAnimation;
