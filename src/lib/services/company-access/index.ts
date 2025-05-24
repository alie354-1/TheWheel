import { CompanyAccessService } from './company-access.service';

export * from './company-access.service';
export * from './types';

// Export a singleton instance
export const companyAccessService = new CompanyAccessService();