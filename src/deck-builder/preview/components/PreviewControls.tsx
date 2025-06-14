import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Minimize, Maximize, Settings2, FileText, X as XIcon, Download, Edit3, Eye } from 'lucide-react'; // Added Edit3, Eye
import AccessibilityToolbar, { AccessibilitySettings } from './AccessibilityToolbar.tsx';
import { ExportModal } from './ExportModal.tsx';
import { exportDeckToPptx } from '../../export/services/PptxExportService.ts';
import { Deck } from '../../types/index.ts';

interface PreviewControlsProps {
  deck: Deck | null;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  onClosePreview?: () => void;
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
  accessibilitySettings: AccessibilitySettings;
  onAccessibilityUpdate: (newSettings: Partial<AccessibilitySettings>) => void;
  onToggleSettings?: () => void;
  onTogglePresenterNotes?: () => void;
  isPresenterNotesVisible?: boolean;
  disableActions?: boolean; // New prop
  isFullScreenEditMode?: boolean; // New prop for edit mode state
  onToggleFullScreenEditMode?: () => void; // New prop for toggling edit mode
  isPublicView?: boolean; // To determine if editing should be allowed
  canvasWidth?: number; // New prop for canvas width
  canvasHeight?: number; // New prop for canvas height
  onCanvasWidthChange?: (width: number) => void; // New prop for canvas width change
  onCanvasHeightChange?: (height: number) => void; // New prop for canvas height change
}

const PreviewControls: React.FC<PreviewControlsProps> = ({
  deck,
  onPrev,
  onNext,
  onToggleFullscreen,
  onClosePreview,
  currentSlide,
  totalSlides,
  isFullscreen,
  accessibilitySettings,
  onAccessibilityUpdate,
  onToggleSettings,
  onTogglePresenterNotes,
  isPresenterNotesVisible,
  disableActions = false, // Destructure with default
  isFullScreenEditMode,
  onToggleFullScreenEditMode,
  isPublicView = false, // Default to false if not provided
  canvasWidth,
  canvasHeight,
  onCanvasWidthChange,
  onCanvasHeightChange,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = async (format: 'pdf' | 'pptx' | 'html') => {
    console.log(`Exporting as ${format}...`);
    if (!deck) {
      console.error("No deck data available for export.");
      return;
    }
    try {
      if (format === 'pptx') {
        console.log('PPTX export not yet fully implemented.');
        alert('PowerPoint export is coming soon!');
      } else if (format === 'pdf') {
        // For now, PDF export is the only one that works
        await exportDeckToPptx(deck, `${deck.title || 'presentation'}.pdf`);
        console.log('PDF export completed.');
      } else if (format === 'html') {
        console.log('HTML export not yet implemented.');
        alert('HTML export is coming soon!');
      }
    } catch (error) {
      console.error(`Error during ${format} export:`, error);
      alert(`Error during ${format} export. See console for details.`);
    }
  };

  return (
    <>
      <div className="preview-controls-bar">
        <div className="preview-controls-group"> {/* Left group */}
          {onClosePreview && !isFullscreen && (
            <button
              onClick={onClosePreview}
              className="preview-control-button"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close Preview</span>
            </button>
          )}
          <AccessibilityToolbar settings={accessibilitySettings} onUpdate={onAccessibilityUpdate} />
          {!disableActions && onTogglePresenterNotes && (
            <button
              onClick={onTogglePresenterNotes}
              className={`preview-control-button ${isPresenterNotesVisible ? 'active' : ''}`}
              title={isPresenterNotesVisible ? 'Hide Presenter Notes' : 'Show Presenter Notes'}
              aria-pressed={isPresenterNotesVisible}
            >
              <FileText className="h-5 w-5" />
              <span className="sr-only">{isPresenterNotesVisible ? 'Hide Presenter Notes' : 'Show Presenter Notes'}</span>
            </button>
          )}
          {onToggleSettings && (
             <button 
              onClick={onToggleSettings} 
              className="preview-control-button" 
              title="More Settings"
            >
              <Settings2 className="h-5 w-5" />
              <span className="sr-only">More Settings</span>
            </button>
          )}
          {!disableActions && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="preview-control-button"
              title="Export Presentation"
              aria-label="Export Presentation"
            >
              <Download className="h-5 w-5" />
              <span className="sr-only">Export</span>
            </button>
          )}
          {/* Canvas Dimension Inputs - Placed in the left group for now */}
          {!isPublicView && !disableActions && onCanvasWidthChange && onCanvasHeightChange && (
            <div className="preview-controls-group ml-2" style={{ gap: '0.25rem' }}>
              <label htmlFor="canvasWidthInput" className="sr-only">Canvas Width</label>
              <input
                type="number"
                id="canvasWidthInput"
                value={canvasWidth || ''}
                onChange={(e) => onCanvasWidthChange(parseInt(e.target.value, 10) || 0)}
                className="preview-control-button"
                style={{ width: '60px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', border: '1px solid #ccc' }}
                title="Canvas Width (px)"
              />
              <span style={{color: '#4b5563', fontSize: '0.75rem'}}>x</span>
              <label htmlFor="canvasHeightInput" className="sr-only">Canvas Height</label>
              <input
                type="number"
                id="canvasHeightInput"
                value={canvasHeight || ''}
                onChange={(e) => onCanvasHeightChange(parseInt(e.target.value, 10) || 0)}
                className="preview-control-button"
                style={{ width: '60px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', border: '1px solid #ccc' }}
                title="Canvas Height (px)"
              />
            </div>
          )}
        </div> {/* End Left group */}

        {/* Center group: Navigation */}
        <div className="preview-controls-group"> 
          <button 
            onClick={onPrev} 
            disabled={currentSlide === 0} 
            className="preview-control-button"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="preview-slide-number" aria-live="polite" aria-atomic="true">
            {currentSlide + 1} / {totalSlides}
          </span>
          <button 
            onClick={onNext} 
            disabled={currentSlide === totalSlides - 1} 
            className="preview-control-button"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div> {/* End Center group */}

        {/* Right group */}
        <div className="preview-controls-group">
          {isFullscreen && !disableActions && !isPublicView && onToggleFullScreenEditMode && (
            <button
              onClick={onToggleFullScreenEditMode}
              className={`preview-control-button ${isFullScreenEditMode ? 'active' : ''}`}
              title={isFullScreenEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
              aria-pressed={isFullScreenEditMode}
            >
              {isFullScreenEditMode ? <Eye className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
              <span className="sr-only">{isFullScreenEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}</span>
            </button>
          )}
          <button 
            onClick={onToggleFullscreen} 
            className="preview-control-button"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div> {/* End Right group */}
      </div> {/* End preview-controls-bar */}
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportPDF={() => handleExport('pdf')}
      />
    </>
  );
};

export default PreviewControls;
