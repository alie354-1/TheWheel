import React from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'pptx' | 'html') => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) {
    return null;
  }

  const handleExport = (format: 'pdf' | 'pptx' | 'html') => {
    onExport(format);
    onClose(); // Close modal after initiating export
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.header}>Export Presentation</h2>
        <div style={styles.buttonGroup}>
          <button 
            style={styles.button} 
            onClick={() => handleExport('pdf')}
          >
            Export as PDF
          </button>
          <button 
            style={styles.button} 
            onClick={() => handleExport('pptx')}
          >
            Export as PowerPoint (.pptx)
          </button>
          <button 
            style={styles.button} 
            onClick={() => handleExport('html')}
          >
            Export as HTML Bundle
          </button>
        </div>
        <button style={styles.closeButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// Basic inline styles for the modal (can be moved to a CSS file)
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    minWidth: '300px',
    textAlign: 'center',
  },
  header: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '1.5rem',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 15px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  // button:hover would need to be handled differently for inline styles or moved to CSS
  closeButton: {
    padding: '10px 15px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
};

export default ExportModal;
