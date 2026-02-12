import { get } from './request';

export interface CompanySearchResult {
  id: string;
  name: string;
}

export const companyApi = {
  search: (q: string): Promise<{ items: CompanySearchResult[] }> => {
    return get<{ items: CompanySearchResult[] }>('/companies/search', { q });
  },
};

export default companyApi;

