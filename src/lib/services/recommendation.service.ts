// This file now acts as a compatibility layer, re-exporting the modularized services.
// Consumers should ideally update their imports to point directly to the specific service
// within the './recommendation/' directory (e.g., import { CoreRecommendationService } from './recommendation/core.service';)

export * from './recommendation'; // Re-exports all services from the new index file
