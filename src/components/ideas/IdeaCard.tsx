/**
 * Idea Card Component
 * 
 * Displays an idea in a card format.
 * Uses the service registry to access the idea service.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { getServiceRegistry } from '../../lib/services/registry';
import { Idea } from '../../lib/services/idea/types';

interface IdeaCardProps {
  idea: Idea;
  onEdit?: () => void;
  onDelete?: () => void;
  onEvaluate?: () => void;
  className?: string;
}

export function IdeaCard({ idea, onEdit, onDelete, onEvaluate, className }: IdeaCardProps) {
  // Get the idea service from the service registry
  const ideaService = getServiceRegistry().ideaService;

  const handleGenerateVariations = async () => {
    try {
      const variations = await ideaService.generateVariations(idea);
      console.log('Generated variations:', variations);
      // Here you would typically update state or show a modal with variations
    } catch (err: any) {
      console.error('Error generating variations:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{idea.title}</CardTitle>
            {idea.aiGenerated && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 mt-1">
                AI Generated
              </span>
            )}
          </div>
          {idea.score !== undefined && (
            <div className="flex items-center justify-center rounded-full h-10 w-10 bg-gray-100 text-gray-900 font-medium">
              {idea.score.toFixed(1)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-gray-700 whitespace-pre-line">
          {idea.description}
        </CardDescription>

        {idea.tags && idea.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {idea.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="space-x-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onEvaluate && (
            <Button variant="outline" size="sm" onClick={onEvaluate}>
              Evaluate
            </Button>
          )}
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleGenerateVariations}>
            Variations
          </Button>
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}