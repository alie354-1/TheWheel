# How to Use the AI Recommendation Service

The `AiRecommendationService` is designed to be used within React components to provide AI-powered recommendations to users. Here's how you can integrate it into your application.

## 1. Import the Service and Other Dependencies

First, import the necessary services and hooks into your component:

```typescript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust the path as needed
import { AiRecommendationService, RealAiRecommendationService, Recommendation } from '../lib/services/ai-recommendation';
import { useAuth } from '../hooks/useAuth'; // Assuming you have an auth hook
```

## 2. Initialize the Service

Inside your component, initialize the `RealAiRecommendationService` and use state to manage the recommendations:

```typescript
const MyRecommendationComponent = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recommendationService: AiRecommendationService = new RealAiRecommendationService(supabase);

  // ...
};
```

## 3. Fetch Recommendations

Use the `useEffect` hook to fetch recommendations when the component mounts or when the user changes:

```typescript
useEffect(() => {
  if (user) {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const stepRecs = await recommendationService.getStepRecommendations(user.id);
        setRecommendations(stepRecs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }
}, [user]);
```

## 4. Render the Recommendations

Finally, render the recommendations in your component:

```typescript
return (
  <div>
    <h2>AI Recommendations</h2>
    {isLoading ? (
      <p>Loading recommendations...</p>
    ) : (
      <ul>
        {recommendations.map((rec) => (
          <li key={rec.id}>
            <h3>{rec.title}</h3>
            <p>{rec.description}</p>
            <small>Type: {rec.type}</small>
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

## Full Example

Here is a complete example of a React component that uses the `AiRecommendationService`:

```typescript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AiRecommendationService, RealAiRecommendationService, Recommendation } from '../lib/services/ai-recommendation';
import { useAuth } from '../hooks/useAuth';

const MyRecommendationComponent = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recommendationService: AiRecommendationService = new RealAiRecommendationService(supabase);

  useEffect(() => {
    if (user) {
      const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
          // Fetch step recommendations
          const stepRecs = await recommendationService.getStepRecommendations(user.id);
          setRecommendations(stepRecs);

          // You can also fetch other types of recommendations
          // const expertRecs = await recommendationService.getExpertRecommendations(user.id, someStepId);
          // const templateRecs = await recommendationService.getTemplateRecommendations(user.id, someStepId);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [user]);

  return (
    <div>
      <h2>AI Recommendations</h2>
      {isLoading ? (
        <p>Loading recommendations...</p>
      ) : (
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.id}>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <small>Type: {rec.type}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecommendationComponent;
