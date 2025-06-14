import React, { useEffect, useState } from "react";
import AdviceCard from "./AdviceCard";
import { ContentImprovementService } from "@/lib/services/recommendation/content-improvement.service";

interface ContentImprovementAdviceProps {
  stepId: string;
}

interface Suggestion {
  suggestion: string;
  originalText?: string;
  suggestedText?: string;
}

const ContentImprovementAdvice: React.FC<ContentImprovementAdviceProps> = ({ stepId }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ContentImprovementService.suggestClarityImprovements(stepId)
      .then((result) => {
        if (mounted && result) setSuggestions(result);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [stepId]);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading content improvement suggestions...</div>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      {suggestions.map((s, idx) =>
        !dismissed.has(idx) ? (
          <AdviceCard
            key={idx}
            title="Content Improvement Suggestion"
            content={s.suggestion}
            onDismiss={() => setDismissed(new Set([...dismissed, idx]))}
          />
        ) : null
      )}
    </div>
  );
};

export default ContentImprovementAdvice;
