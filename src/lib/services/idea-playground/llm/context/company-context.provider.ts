import { BaseContextProvider } from './base-context.provider';
import { LLMRequestContext } from './interface';

/**
 * Company information for context enrichment
 */
export interface CompanyInfo {
  name?: string;
  industry?: string;
  size?: string;
  stage?: string;
  products?: string[];
  mission?: string;
  vision?: string;
  values?: string[];
  targetAudience?: string[];
  competitors?: string[];
}

/**
 * Context provider that enriches prompts with company information
 */
export class CompanyContextProvider extends BaseContextProvider {
  private companyInfo: CompanyInfo;
  
  constructor(companyInfo: CompanyInfo = {}) {
    super('company-context', 80); // High priority
    this.companyInfo = companyInfo;
  }
  
  /**
   * Update company information
   */
  updateCompanyInfo(companyInfo: Partial<CompanyInfo>): void {
    this.companyInfo = {
      ...this.companyInfo,
      ...companyInfo
    };
  }
  
  /**
   * Check if this provider can handle the given context
   * Requires some company information to be present
   */
  canHandle(context: LLMRequestContext): boolean {
    if (!this.isEnabled()) {
      return false;
    }
    
    // Check if we have any company information to add
    return Object.values(this.companyInfo).some(value => 
      value !== undefined && 
      (typeof value === 'string' ? value.trim() !== '' : value.length > 0)
    );
  }
  
  /**
   * Process and enrich context with company information
   */
  processContext(context: LLMRequestContext): LLMRequestContext {
    if (!this.canHandle(context)) {
      return context;
    }
    
    // Build company context string
    const companyContextParts: string[] = ['# Company Information'];
    
    if (this.companyInfo.name) {
      companyContextParts.push(`Company: ${this.companyInfo.name}`);
    }
    
    if (this.companyInfo.industry) {
      companyContextParts.push(`Industry: ${this.companyInfo.industry}`);
    }
    
    if (this.companyInfo.size) {
      companyContextParts.push(`Company Size: ${this.companyInfo.size}`);
    }
    
    if (this.companyInfo.stage) {
      companyContextParts.push(`Development Stage: ${this.companyInfo.stage}`);
    }
    
    if (this.companyInfo.mission) {
      companyContextParts.push(`Mission: ${this.companyInfo.mission}`);
    }
    
    if (this.companyInfo.vision) {
      companyContextParts.push(`Vision: ${this.companyInfo.vision}`);
    }
    
    if (this.companyInfo.values && this.companyInfo.values.length > 0) {
      companyContextParts.push(`Values: ${this.companyInfo.values.join(', ')}`);
    }
    
    if (this.companyInfo.targetAudience && this.companyInfo.targetAudience.length > 0) {
      companyContextParts.push(`Target Audience: ${this.companyInfo.targetAudience.join(', ')}`);
    }
    
    if (this.companyInfo.competitors && this.companyInfo.competitors.length > 0) {
      companyContextParts.push(`Competitors: ${this.companyInfo.competitors.join(', ')}`);
    }
    
    if (this.companyInfo.products && this.companyInfo.products.length > 0) {
      companyContextParts.push(`Products/Services: ${this.companyInfo.products.join(', ')}`);
    }
    
    const companyContext = companyContextParts.join('\n');
    
    // Add company context to domain context
    return {
      ...context,
      domainContext: this.combineContextValues(context.domainContext, companyContext)
    };
  }
}
