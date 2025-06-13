import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  preventBackdropClose?: boolean;
  zIndex?: number;
}

let modalStack: string[] = [];
let modalCounter = 0;

export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  preventBackdropClose = false,
  zIndex = 9999,
}) => {
  const [modalId] = useState(() => `modal-${++modalCounter}`);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Focus management
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, []);

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      // Only close if this is the topmost modal
      if (modalStack[modalStack.length - 1] === modalId) {
        handleClose();
      }
    }
  }, [modalId]);

  // Robust close handler
  const handleClose = useCallback(() => {
    if (isClosing) return; // Prevent multiple close calls
    
    setIsClosing(true);
    
    // Remove from modal stack
    const index = modalStack.indexOf(modalId);
    if (index > -1) {
      modalStack.splice(index, 1);
    }
    
    // Call the onClose callback
    onClose();
    
    // Reset closing state after a short delay
    setTimeout(() => setIsClosing(false), 100);
  }, [modalId, onClose, isClosing]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (preventBackdropClose) return;
    
    if (e.target === backdropRef.current) {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  }, [preventBackdropClose, handleClose]);

  // Prevent event bubbling on modal content
  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (isOpen && !isClosing) {
      // Store current focus
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Add to modal stack
      if (!modalStack.includes(modalId)) {
        modalStack.push(modalId);
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Add event listeners
      document.addEventListener('keydown', handleEscape, true);
      document.addEventListener('keydown', trapFocus);
      
      // Focus the modal
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 10);
      
    } else {
      // Remove from modal stack
      const index = modalStack.indexOf(modalId);
      if (index > -1) {
        modalStack.splice(index, 1);
      }
      
      // Restore body scroll if no other modals
      if (modalStack.length === 0) {
        document.body.style.overflow = '';
      }
      
      // Remove event listeners
      document.removeEventListener('keydown', handleEscape, true);
      document.removeEventListener('keydown', trapFocus);
      
      // Restore focus
      if (previousActiveElement.current && modalStack.length === 0) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
    
    return () => {
      // Cleanup on unmount
      const index = modalStack.indexOf(modalId);
      if (index > -1) {
        modalStack.splice(index, 1);
      }
      
      if (modalStack.length === 0) {
        document.body.style.overflow = '';
      }
      
      document.removeEventListener('keydown', handleEscape, true);
      document.removeEventListener('keydown', trapFocus);
    };
  }, [isOpen, isClosing, modalId, handleEscape, trapFocus]);

  // Force cleanup effect for stuck modals
  useEffect(() => {
    const cleanup = () => {
      // Remove any stuck modal backdrops
      const stuckBackdrops = document.querySelectorAll('[data-modal-backdrop="true"]');
      stuckBackdrops.forEach((backdrop, index) => {
        if (index > 0) { // Keep only the first one if multiple exist
          backdrop.remove();
        }
      });
    };

    const timer = setTimeout(cleanup, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || isClosing) {
    return null;
  }

  const modalContent = (
    <div
      ref={backdropRef}
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 ${className}`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      data-modal-backdrop="true"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative max-w-full max-h-full overflow-auto"
        onClick={handleModalClick}
        data-modal-content="true"
      >
        {children}
      </div>
    </div>
  );

  // Create portal to document.body
  return createPortal(modalContent, document.body);
};

export default ModalPortal;
