import { DeckSection } from '../../deck-builder/types/index.ts';

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  sections: DeckSection[];
}
