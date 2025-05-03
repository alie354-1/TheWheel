import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * DragDropProvider 
 * 
 * Provides drag and drop functionality throughout the application.
 * Wraps the application with React DnD's DndProvider and HTML5Backend.
 */
const DragDropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

export default DragDropProvider;
