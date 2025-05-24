// Phase 1 - Simplified Types for Modern Pitch Deck Builder

export interface Deck {
  id: string;
  title: string;
  sections: DeckSection[];
  template_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DeckSection {
  id: string;
  type: SectionType;
  title: string;
  content: Record<string, any>;
  order: number;
}

export type SectionType = 
  | 'hero'
  | 'problem'
  | 'solution'
  | 'market'
  | 'business-model'
  | 'competition'
  | 'team'
  | 'financials'
  | 'funding'
  | 'next-steps';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'vc-pitch' | 'product-demo' | 'market-opportunity' | 'technical';
  sections: SectionType[];
  preview_image?: string;
}
