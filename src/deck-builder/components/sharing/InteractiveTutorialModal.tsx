import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, MessageSquare, Mic, MousePointer, FileText, Layers, BookOpen, Sparkles } from 'lucide-react';

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  visual?: React.ReactNode;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to the Feedback System',
    description: 'This tutorial will guide you through all the ways you can provide feedback on this deck.',
    icon: <FileText size={48} />,
  },
  {
    title: 'Click Anywhere to Comment',
    description: 'Click directly on any element or area of a slide to leave targeted feedback. Your comment will be anchored to that exact location.',
    icon: <MousePointer size={48} />,
    visual: (
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 40, left: 60, width: 120, height: 80, background: '#e5e7eb', borderRadius: 4 }} />
        <div style={{ position: 'absolute', top: 40, right: 60, width: 120, height: 80, background: '#e5e7eb', borderRadius: 4 }} />
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 40, background: '#e5e7eb', borderRadius: 4 }} />
        <div style={{
          position: 'absolute',
          top: 80,
          left: 100,
          width: 32,
          height: 32,
          background: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
          cursor: 'pointer',
          animation: 'pulse 2s infinite'
        }}>
          1
        </div>
      </div>
    ),
  },
  {
    title: 'Add Text Comments',
    description: 'Type your feedback directly in the comment box. You can format your text, add suggestions, ask questions, or provide praise.',
    icon: <MessageSquare size={48} />,
    visual: (
      <div style={{ width: '100%', padding: 16, background: '#f9fafb', borderRadius: 8 }}>
        <div style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
            "Great visual hierarchy on this slide! Consider making the CTA button more prominent..."
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 12, padding: '4px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 4 }}>Suggestion</span>
            <span style={{ fontSize: 12, padding: '4px 8px', background: '#ecfdf5', color: '#065f46', borderRadius: 4 }}>Praise</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Form vs Style Feedback',
    description: 'Choose between commenting on the form (content, messaging, structure) or style (design, colors, layout) of the slide.',
    icon: <BookOpen size={48} />,
    visual: (
      <div style={{ width: '100%', padding: 16, background: '#f9fafb', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'white', border: '2px solid #3b82f6', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 }}>Form</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Content, messaging, story flow, data accuracy</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #d1d5db', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🎨</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 4 }}>Style</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Design, colors, fonts, layout, visual appeal</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          Toggle between form and style to categorize your feedback appropriately
        </div>
      </div>
    ),
  },
  {
    title: 'Record Voice Notes',
    description: 'Click the microphone icon to record voice feedback. Perfect for detailed explanations or when typing would take too long.',
    icon: <Mic size={48} />,
    visual: (
      <div style={{ width: '100%', padding: 16, background: '#f9fafb', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: 12, borderRadius: 6, border: '1px solid #d1d5db' }}>
          <div style={{
            width: 48,
            height: 48,
            background: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Mic size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 24 }}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: Math.random() * 20 + 4,
                    background: '#3b82f6',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Recording: 0:23</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Slide vs Deck Comments',
    description: 'Toggle between slide-specific feedback and deck-wide comments using the scope selector at the top of the feedback panel.',
    icon: <Layers size={48} />,
    visual: (
      <div style={{ width: '100%', padding: 16, background: '#f9fafb', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer'
          }}>
            Slide Comments
          </button>
          <button style={{
            padding: '8px 16px',
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer'
          }}>
            Deck Comments
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          Switch between viewing comments for the current slide or the entire deck
        </div>
      </div>
    ),
  },
  {
    title: 'Ready to Start!',
    description: 'You\'re all set to provide valuable feedback. Your insights will help improve this deck. Happy reviewing!',
    icon: <Sparkles size={48} />,
    visual: (
      <div style={{ 
        width: '100%', 
        padding: 32, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 8,
        color: 'white'
      }}>
        <div style={{ 
          fontSize: 48, 
          marginBottom: 16,
          animation: 'celebrate 2s ease-in-out infinite'
        }}>
          🎉
        </div>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          You're ready to go!
        </div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>
          Click "Get Started" to begin reviewing
        </div>
      </div>
    ),
  },
];

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>How to Use the Feedback System</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.iconContainer}>
            {step.icon}
          </div>
          
          <h3 style={styles.stepTitle}>{step.title}</h3>
          <p style={styles.description}>{step.description}</p>
          
          {step.visual && (
            <div style={styles.visualContainer}>
              {step.visual}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.progress}>
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.progressDot,
                  ...(index === currentStep ? styles.progressDotActive : {}),
                }}
              />
            ))}
          </div>

          <div style={styles.navigation}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              style={{
                ...styles.navButton,
                ...(currentStep === 0 ? styles.navButtonDisabled : {}),
              }}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            
            <button onClick={onClose} style={styles.skipButton}>
              Skip Tutorial
            </button>
            
            <button 
              onClick={handleNext} 
              style={{
                ...styles.navButton,
                ...(isLastStep ? styles.getStartedButton : {})
              }}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 2px 16px rgba(59, 130, 246, 0.7);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          }
        }
        
        @keyframes celebrate {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
          }
          50% {
            transform: scale(1.2) rotate(5deg);
          }
          75% {
            transform: scale(1.1) rotate(-5deg);
          }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: 8,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  content: {
    flex: 1,
    padding: 32,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    color: '#3b82f6',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 1.6,
    maxWidth: 480,
    marginBottom: 24,
  },
  visualContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 24,
  },
  footer: {
    padding: 24,
    borderTop: '1px solid #e5e7eb',
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    transition: 'background-color 0.2s',
  },
  progressDotActive: {
    backgroundColor: '#3b82f6',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  navButtonDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  skipButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  getStartedButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontSize: 16,
    padding: '12px 24px',
  },
};
