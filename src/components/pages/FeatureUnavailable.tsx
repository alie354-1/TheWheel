/**
 * Feature Unavailable Page
 * 
 * A page to display when a user tries to access a feature that is disabled
 * or they don't have access to.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';
import { Container, Stack } from '../layout';

interface LocationState {
  missingFlags?: string[];
  from?: { pathname: string };
}

/**
 * Feature Unavailable page component
 */
export const FeatureUnavailable: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const handleGoBack = () => {
    if (state?.from) {
      navigate(-1); // Go back to the referring page
    } else {
      navigate('/'); // Go to home if no referring page
    }
  };
  
  return (
    <Container maxWidth="md" padding>
      <Stack direction="column" spacing="lg" className="py-12">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          
          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Feature Unavailable
          </h1>
          
          <p className="mt-3 text-base text-gray-500 max-w-md mx-auto">
            Sorry, the feature you're trying to access is currently unavailable or requires additional permissions.
          </p>
          
          {state?.missingFlags && state.missingFlags.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md inline-block">
              <p className="text-sm text-gray-600 font-medium">Required features:</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-500">
                {state.missingFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-8">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleGoBack}
            >
              Go Back
            </Button>
          </div>
        </div>
      </Stack>
    </Container>
  );
};

export default FeatureUnavailable;