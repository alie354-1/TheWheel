import { LLMOrchestrator } from './llm/orchestrator';
import { LLMRequestContext } from './llm/context/interface';

/**
 * Component type enum
 */
export enum ComponentType {
  UI = 'ui',
  FEATURE = 'feature',
  TECHNICAL = 'technical',
  MARKETING = 'marketing',
  BUSINESS = 'business'
}

/**
 * Component interface
 */
export interface Component {
  id?: string;
  type: ComponentType;
  name: string;
  description: string;
  details?: string;
  tags?: string[];
}

/**
 * Component variation interface
 */
export interface ComponentVariation {
  originalComponentId?: string;
  type: ComponentType;
  name: string;
  description: string;
  details?: string;
  differentiators: string[];
  tags?: string[];
}

/**
 * Service for component-related operations
 */
export class ComponentService {
  /**
   * Create a new component service
   * 
   * @param llmOrchestrator - The LLM orchestrator to use
   */
  constructor(private llmOrchestrator: LLMOrchestrator) {}
  
  /**
   * Generate components for an idea
   * 
   * @param idea - The idea to generate components for
   * @param types - The types of components to generate
   * @param context - Optional context for generation
   * @returns The generated components
   */
  async generateComponents(
    idea: string, 
    types: ComponentType[] = Object.values(ComponentType), 
    context?: LLMRequestContext
  ): Promise<Component[]> {
    // In a full implementation, this would query the LLM
    // For now, we just use stub data
    
    const prompt = `Generate components for the following idea: ${idea}\nComponent types: ${types.join(', ')}`;
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate stub components
    const components: Component[] = [];
    
    for (const type of types) {
      // Generate 1-3 components per type
      const count = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 1; i <= count; i++) {
        components.push({
          id: `component-${Math.random().toString(36).substring(7)}`,
          type,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component ${i}`,
          description: `A ${type} component for ${idea}`,
          details: `This ${type} component provides functionality related to ${idea}`,
          tags: [`${type}`, 'component', `priority-${Math.floor(Math.random() * 3) + 1}`]
        });
      }
    }
    
    return components;
  }
  
  /**
   * Generate variations of a component
   * 
   * @param component - The component to generate variations for
   * @param count - The number of variations to generate
   * @param context - Optional context for generation
   * @returns The generated variations
   */
  async generateComponentVariations(
    component: Component | string, 
    count: number = 3, 
    context?: LLMRequestContext
  ): Promise<ComponentVariation[]> {
    // Convert string to component if needed
    const componentObj = typeof component === 'string' 
      ? { type: ComponentType.FEATURE, name: component, description: component } 
      : component;
    
    // In a full implementation, this would query the LLM
    // For now, we just use stub data
    
    const prompt = `Generate ${count} variations of the following component:\n${JSON.stringify(componentObj, null, 2)}`;
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate stub variations
    const variations: ComponentVariation[] = [];
    
    for (let i = 1; i <= count; i++) {
      variations.push({
        originalComponentId: componentObj.id,
        type: componentObj.type,
        name: `${componentObj.name} - Variation ${i}`,
        description: `Alternative version ${i} of ${componentObj.name}`,
        details: `This is variation ${i} of the original component, with different implementation details`,
        differentiators: [
          `Differentiator ${i}.1`,
          `Differentiator ${i}.2`,
          `Differentiator ${i}.3`
        ],
        tags: componentObj.tags || []
      });
    }
    
    return variations;
  }
  
  /**
   * Evaluate a component
   * 
   * @param component - The component to evaluate
   * @param criteria - The evaluation criteria
   * @param context - Optional context for evaluation
   * @returns The evaluation results
   */
  async evaluateComponent(
    component: Component,
    criteria: string[] = ['feasibility', 'impact', 'cost'],
    context?: LLMRequestContext
  ): Promise<Record<string, number>> {
    // In a full implementation, this would query the LLM
    // For now, we just use stub data
    
    const prompt = `Evaluate the following component based on criteria: ${criteria.join(', ')}\n${JSON.stringify(component, null, 2)}`;
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate stub evaluation
    const evaluation: Record<string, number> = {};
    
    for (const criterion of criteria) {
      // Random score between the 1-10 range
      evaluation[criterion] = Math.floor(Math.random() * 10) + 1;
    }
    
    return evaluation;
  }
  
  /**
   * Merge multiple components into a new component
   * 
   * @param components - The components to merge
   * @param context - Optional context for merging
   * @returns The merged component
   */
  async mergeComponents(
    components: Component[],
    context?: LLMRequestContext
  ): Promise<Component> {
    // In a full implementation, this would query the LLM
    // For now, we just use stub data
    
    if (components.length === 0) {
      throw new Error('No components to merge');
    }
    
    const prompt = `Merge the following components into a new component:\n${JSON.stringify(components, null, 2)}`;
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Determine the dominant component type
    const typeCount: Record<ComponentType, number> = {} as Record<ComponentType, number>;
    
    for (const component of components) {
      typeCount[component.type] = (typeCount[component.type] || 0) + 1;
    }
    
    let dominantType = components[0].type;
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(typeCount)) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type as ComponentType;
      }
    }
    
    // Generate a merged component
    return {
      id: `merged-${Math.random().toString(36).substring(7)}`,
      type: dominantType,
      name: `Merged Component (${components.length} components)`,
      description: `A merged component combining features from ${components.length} different components`,
      details: `This component combines functionality from multiple components: ${components.map(c => c.name).join(', ')}`,
      tags: ['merged', dominantType, ...components.flatMap(c => c.tags || []).filter((tag, index, self) => self.indexOf(tag) === index)]
    };
  }
}
