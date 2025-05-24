/**
 * Knowledge Service for Business Operations Hub
 * Handles storage, search, and categorization of knowledge artifacts.
 */

export type KnowledgeArtifact = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
};

class KnowledgeService {
  private artifacts: KnowledgeArtifact[] = [];

  /**
   * Add a new knowledge artifact.
   */
  async addArtifact(artifact: Omit<KnowledgeArtifact, "id" | "createdAt">): Promise<KnowledgeArtifact> {
    // TODO: Integrate with backend knowledge API
    const newArtifact: KnowledgeArtifact = {
      ...artifact,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.artifacts.unshift(newArtifact);
    return newArtifact;
  }

  /**
   * Get all knowledge artifacts.
   */
  async getArtifacts(): Promise<KnowledgeArtifact[]> {
    // TODO: Replace with backend API call
    return this.artifacts;
  }

  /**
   * Search knowledge artifacts by text and/or category.
   */
  async searchArtifacts(query: string, category?: string): Promise<KnowledgeArtifact[]> {
    // TODO: Replace with backend search API
    return this.artifacts.filter(a =>
      (!category || a.category === category) &&
      (a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.content.toLowerCase().includes(query.toLowerCase()))
    );
  }

  /**
   * Categorize an existing artifact.
   */
  async categorizeArtifact(id: string, category: string): Promise<boolean> {
    // TODO: Integrate with backend update API
    const idx = this.artifacts.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.artifacts[idx].category = category;
    return true;
  }
}

export const knowledgeService = new KnowledgeService();
