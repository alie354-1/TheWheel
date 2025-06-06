import React from 'react';
import TestDeckBuilder from '../deck-builder/components/TestDeckBuilder.tsx';

const TestDeckBuilderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <TestDeckBuilder />
    </div>
  );
};

export default TestDeckBuilderPage;
