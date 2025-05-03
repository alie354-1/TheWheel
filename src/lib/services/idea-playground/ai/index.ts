/**
 * AI Services for Idea Playground
 * 
 * This directory contains modular AI services for the Idea Playground feature.
 * It provides a more maintainable and testable architecture compared to the monolithic approach.
 */

// Export all AI services from a single barrel file
export * from './sequential-generation.service';
export * from './idea-merger.service';

// Additional exports as more AI services are added, e.g.:
// export * from './idea-refinement.service';
// export * from './context-enhancement.service';
