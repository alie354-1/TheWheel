import React, { useState } from 'react';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface IdeaExportModalProps {
  idea: IdeaPlaygroundIdea;
  onClose: () => void;
  onExport?: (format: ExportFormat, sections: string[]) => void;
}

type ExportFormat = 'pdf' | 'markdown' | 'json' | 'csv' | 'html' | 'pptx';

/**
 * Modal component for exporting ideas to various formats
 */
const IdeaExportModal: React.FC<IdeaExportModalProps> = ({
  idea,
  onClose,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeBranding, setIncludeBranding] = useState(true);
  
  // Ref for the content to be converted to PDF
  const contentRef = React.useRef<HTMLDivElement>(null);


  // Format metadata dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Generate a filename based on the idea title
  const generateFilename = () => {
    const safeTitle = idea.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    return `idea_${safeTitle}_${timestamp}`;
  };

  // Handle PDF export
  const handlePdfExport = async () => {
    if (!contentRef.current) return;
    
    setExportStatus('loading');
    setExportProgress(10);
    
    try {
      // Capture the HTML content as canvas
      const canvas = await html2canvas(contentRef.current);
      setExportProgress(50);
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the page
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add the captured content to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      setExportProgress(80);
      
      // Save the PDF
      pdf.save(`${generateFilename()}.pdf`);
      setExportProgress(100);
      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportStatus('error');
    }
  };

  // Handle Markdown export
  const handleMarkdownExport = () => {
    setExportStatus('loading');
    setExportProgress(25);
    
    try {
      // Generate Markdown content
      let markdown = `# ${idea.title}\n\n`;
      markdown += `${idea.description}\n\n`;
      
      // Problem and Solution
      if (idea.problem_statement) {
        markdown += `## Problem Statement\n\n${idea.problem_statement}\n\n`;
      }
      
      if (idea.solution_concept) {
        markdown += `## Solution Concept\n\n${idea.solution_concept}\n\n`;
      }
      
      // Audience and Value
      if (idea.target_audience) {
        markdown += `## Target Audience\n\n${idea.target_audience}\n\n`;
      }
      
      if (idea.unique_value) {
        markdown += `## Unique Value Proposition\n\n${idea.unique_value}\n\n`;
      }
      
      // Business and Marketing
      if (idea.business_model) {
        markdown += `## Business Model\n\n${idea.business_model}\n\n`;
      }
      
      if (idea.marketing_strategy) {
        markdown += `## Marketing Strategy\n\n${idea.marketing_strategy}\n\n`;
      }
      
      if (idea.go_to_market) {
        markdown += `## Go-to-Market Plan\n\n${idea.go_to_market}\n\n`;
      }
      
      // Add metadata if requested
      if (includeMetadata) {
        markdown += `---\n\n`;
        markdown += `**Created:** ${formatDate(idea.created_at)}\n\n`;
        markdown += `**Last Updated:** ${formatDate(idea.updated_at)}\n\n`;
        markdown += `**Idea ID:** ${idea.id}\n\n`;
      }
      
      // Add branding if requested
      if (includeBranding) {
        markdown += `\n\n---\n\n`;
        markdown += `Generated with Wheel99 Idea Playground - Turning Ideas into Reality\n`;
      }
      
      setExportProgress(75);
      
      // Create a blob and save the file
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${generateFilename()}.md`);
      
      setExportProgress(100);
      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting to Markdown:', error);
      setExportStatus('error');
    }
  };

  // Handle JSON export
  const handleJsonExport = () => {
    setExportStatus('loading');
    setExportProgress(50);
    
    try {
      // Create a JSON representation of the idea
      const jsonData = JSON.stringify(idea, null, 2);
      
      // Create a blob and save the file
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `${generateFilename()}.json`);
      
      setExportProgress(100);
      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      setExportStatus('error');
    }
  };

  // Handle CSV export
  const handleCsvExport = () => {
    setExportStatus('loading');
    setExportProgress(50);
    
    try {
      // Create CSV header
      let csv = 'Field,Value\n';
      
      // Add fields to CSV
      csv += `Title,"${idea.title.replace(/"/g, '""')}"\n`;
      csv += `Description,"${idea.description.replace(/"/g, '""')}"\n`;
      
      if (idea.problem_statement) {
        csv += `Problem Statement,"${idea.problem_statement.replace(/"/g, '""')}"\n`;
      }
      
      if (idea.solution_concept) {
        csv += `Solution Concept,"${idea.solution_concept.replace(/"/g, '""')}"\n`;
      }
      
      if (idea.target_audience) {
        csv += `Target Audience,"${idea.target_audience.replace(/"/g, '""')}"\n`;
      }
      
      if (idea.unique_value) {
        csv += `Unique Value Proposition,"${idea.unique_value.replace(/"/g, '""')}"\n`;
      }
      
      if (idea.business_model) {
        csv += `Business Model,"${idea.business_model.replace(/"/g, '""')}"\n`;
      }
      
      if (idea.marketing_strategy) {
        csv += `Marketing Strategy,"${idea.marketing_strategy.replace(/"/g, '""')}"\n`;
      }
      
      if (idea.go_to_market) {
        csv += `Go-to-Market Plan,"${idea.go_to_market.replace(/"/g, '""')}"\n`;
      }
      
      // Add metadata if requested
      if (includeMetadata) {
        csv += `Created At,"${idea.created_at}"\n`;
        csv += `Updated At,"${idea.updated_at}"\n`;
        csv += `Idea ID,"${idea.id}"\n`;
      }
      
      // Create a blob and save the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${generateFilename()}.csv`);
      
      setExportProgress(100);
      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      setExportStatus('error');
    }
  };

  // Handle HTML export
  const handleHtmlExport = () => {
    setExportStatus('loading');
    setExportProgress(50);
    
    try {
      // Create HTML content
      let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #2563eb;
    }
    .metadata {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 0.9em;
      color: #666;
    }
    .branding {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 0.9em;
      color: #666;
      text-align: center;
    }
    section {
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <h1>${idea.title}</h1>
  <p>${idea.description}</p>
`;
      
      // Problem and Solution
      if (idea.problem_statement) {
        html += `
  <section>
    <h2>Problem Statement</h2>
    <p>${idea.problem_statement}</p>
  </section>
`;
      }
      
      if (idea.solution_concept) {
        html += `
  <section>
    <h2>Solution Concept</h2>
    <p>${idea.solution_concept}</p>
  </section>
`;
      }
      
      // Audience and Value
      if (idea.target_audience) {
        html += `
  <section>
    <h2>Target Audience</h2>
    <p>${idea.target_audience}</p>
  </section>
`;
      }
      
      if (idea.unique_value) {
        html += `
  <section>
    <h2>Unique Value Proposition</h2>
    <p>${idea.unique_value}</p>
  </section>
`;
      }
      
      // Business and Marketing
      if (idea.business_model) {
        html += `
  <section>
    <h2>Business Model</h2>
    <p>${idea.business_model}</p>
  </section>
`;
      }
      
      if (idea.marketing_strategy) {
        html += `
  <section>
    <h2>Marketing Strategy</h2>
    <p>${idea.marketing_strategy}</p>
  </section>
`;
      }
      
      if (idea.go_to_market) {
        html += `
  <section>
    <h2>Go-to-Market Plan</h2>
    <p>${idea.go_to_market}</p>
  </section>
`;
      }
      
      // Add metadata if requested
      if (includeMetadata) {
        html += `
  <div class="metadata">
    <p><strong>Created:</strong> ${formatDate(idea.created_at)}</p>
    <p><strong>Last Updated:</strong> ${formatDate(idea.updated_at)}</p>
    <p><strong>Idea ID:</strong> ${idea.id}</p>
  </div>
`;
      }
      
      // Add branding if requested
      if (includeBranding) {
        html += `
  <div class="branding">
    <p>Generated with Wheel99 Idea Playground - Turning Ideas into Reality</p>
  </div>
`;
      }
      
      html += `
</body>
</html>`;
      
      // Create a blob and save the file
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${generateFilename()}.html`);
      
      setExportProgress(100);
      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting to HTML:', error);
      setExportStatus('error');
    }
  };

  // Handle PPTX export (mock implementation)
  const handlePptxExport = () => {
    setExportStatus('loading');
    setExportProgress(25);
    
    // In a real implementation, you would use a library like pptxgenjs
    // For this mock, we'll just simulate the export process
    setTimeout(() => {
      setExportProgress(50);
      
      setTimeout(() => {
        setExportProgress(75);
        
        setTimeout(() => {
          alert('PPTX export is not fully implemented yet. In a production environment, this would generate a PowerPoint presentation of your idea.');
          setExportProgress(100);
          setExportStatus('idle');
        }, 500);
      }, 500);
    }, 500);
  };

  // Handle export based on selected format
  const handleExport = () => {
    // Get sections to export based on checkboxes (in a real implementation)
    const sections = ['title', 'description', 'problem_statement', 'solution_concept'];
    
    // If custom onExport is provided, use it
    if (onExport) {
      onExport(selectedFormat, sections);
      return;
    }
    
    // Otherwise use the built-in exporters
    switch (selectedFormat) {
      case 'pdf':
        handlePdfExport();
        break;
      case 'markdown':
        handleMarkdownExport();
        break;
      case 'json':
        handleJsonExport();
        break;
      case 'csv':
        handleCsvExport();
        break;
      case 'html':
        handleHtmlExport();
        break;
      case 'pptx':
        handlePptxExport();
        break;
      default:
        console.error('Unknown export format:', selectedFormat);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4 text-white">
          <h2 className="text-xl font-bold">Export Idea</h2>
          <p className="text-indigo-100 text-sm">
            Export "{idea.title}" to your preferred format
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Format selection */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-gray-700 mb-2">Export Format</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="format"
                    value="pdf"
                    checked={selectedFormat === 'pdf'}
                    onChange={() => setSelectedFormat('pdf')}
                  />
                  <span className="ml-2">PDF Document</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="format"
                    value="markdown"
                    checked={selectedFormat === 'markdown'}
                    onChange={() => setSelectedFormat('markdown')}
                  />
                  <span className="ml-2">Markdown</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="format"
                    value="json"
                    checked={selectedFormat === 'json'}
                    onChange={() => setSelectedFormat('json')}
                  />
                  <span className="ml-2">JSON</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="format"
                    value="csv"
                    checked={selectedFormat === 'csv'}
                    onChange={() => setSelectedFormat('csv')}
                  />
                  <span className="ml-2">CSV</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="format"
                    value="html"
                    checked={selectedFormat === 'html'}
                    onChange={() => setSelectedFormat('html')}
                  />
                  <span className="ml-2">HTML</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="format"
                    value="pptx"
                    checked={selectedFormat === 'pptx'}
                    onChange={() => setSelectedFormat('pptx')}
                  />
                  <span className="ml-2">PowerPoint (PPTX)</span>
                </label>
              </div>
              
              {/* Options */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-indigo-600"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                    />
                    <span className="ml-2">Include Metadata</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-indigo-600"
                      checked={includeBranding}
                      onChange={(e) => setIncludeBranding(e.target.checked)}
                    />
                    <span className="ml-2">Include Branding</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">Preview</h3>
              <div 
                ref={contentRef}
                className="border border-gray-200 rounded-lg p-4 h-64 overflow-auto bg-white shadow-inner text-sm"
              >
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-indigo-600">{idea.title}</h1>
                  <p>{idea.description}</p>
                  
                  {idea.problem_statement && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Problem Statement</h2>
                      <p className="text-gray-600">{idea.problem_statement}</p>
                    </div>
                  )}
                  
                  {idea.solution_concept && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Solution Concept</h2>
                      <p className="text-gray-600">{idea.solution_concept}</p>
                    </div>
                  )}
                  
                  {includeMetadata && (
                    <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <p><strong>Created:</strong> {formatDate(idea.created_at)}</p>
                      <p><strong>Last Updated:</strong> {formatDate(idea.updated_at)}</p>
                      <p><strong>Idea ID:</strong> {idea.id}</p>
                    </div>
                  )}
                  
                  {includeBranding && (
                    <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 text-center">
                      <p>Generated with Wheel99 Idea Playground - Turning Ideas into Reality</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Export status */}
              {exportStatus === 'loading' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Exporting...</span>
                    <span className="text-sm text-gray-600">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {exportStatus === 'success' && (
                <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md border border-green-200">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Export completed successfully!
                  </p>
                </div>
              )}
              
              {exportStatus === 'error' && (
                <div className="mt-4 p-2 bg-red-50 text-red-700 rounded-md border border-red-200">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    An error occurred during export. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleExport}
            disabled={exportStatus === 'loading'}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
              exportStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {exportStatus === 'loading' ? 'Exporting...' : 'Export Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaExportModal;
