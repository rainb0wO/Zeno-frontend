import { requireList } from '../domain/apiEnvelope';
import { buildGroupEntryLink } from '../domain/groupEntry';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';
import type { UserRole } from '../domain/roles';

export interface Factory {
  id: string;
  name: string;
  address?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  managementMode?: string | null;
  role?: UserRole | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FactoryInput {
  name: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  managementMode?: string;
}

export const factoryApi = {
  list: async () => {
    const result = await apiGet<{ factories: Factory[] }>(endpoints.factories);
    return requireList<Factory>(result, 'factories');
  },

  get: async (id: string) => {
    const result = await apiGet<{ factory: Factory }>(endpoints.factory(id));
    if (!result.factory) throw new Error('响应缺少 factory');
    return result.factory;
  },

  create: async (input: FactoryInput) => {
    const result = await apiPost<{ factory: Factory }>(endpoints.factories, {
      managementMode: 'standard',
      ...input,
    });
    if (!result.factory) throw new Error('响应缺少 factory');
    return { message: result.message, factory: result.factory };
  },

  update: async (id: string, input: Partial<FactoryInput>) => {
    const result = await apiPut<{ factory?: Factory }>(endpoints.factory(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete(endpoints.factory(id));
    return result.message;
  },

  rotateGroupToken: async (id: string, origin: string) => {
    const result = await apiPost<{ token: string }>(endpoints.rotateGroupToken(id));
    if (typeof result.token !== 'string' || !result.token) {
      throw new Error('响应缺少 token');
    }
    return { message: result.message, token: result.token, url: buildGroupEntryLink(origin, result.token) };
  },
};
