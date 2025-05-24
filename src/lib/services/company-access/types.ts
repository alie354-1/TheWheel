export interface CompanyData {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  logo_url?: string;
  created_at?: string;
  [key: string]: any; // For additional properties
}

export interface CompanyAccessResult {
  hasCompany: boolean;
  companyData: CompanyData[];
  error?: string;
}

export interface CompanyAccessService {
  checkUserCompanyAccess: (userId: string) => Promise<CompanyAccessResult>;
  getUserCompanies: (userId: string) => Promise<CompanyData[]>;
}