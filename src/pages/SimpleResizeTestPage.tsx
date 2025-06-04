import React from 'react';
import SimpleResizeTest from '../deck-builder/components/SimpleResizeTest.tsx';

const SimpleResizeTestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Resize Test</h1>
      <p>This is a simplified test to verify resize functionality works.</p>
      <SimpleResizeTest />
    </div>
  );
};

export default SimpleResizeTestPage;
