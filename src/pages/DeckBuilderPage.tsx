import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeckBuilderPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new library-centric deck builder
    navigate('/deck-builder/library', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
