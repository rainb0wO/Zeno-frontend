import { readNamedList } from '../domain/apiEnvelope';
import { readRotatedToken } from '../domain/groupEntry';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface Factory {
  id: string;
  name: string;
  address?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  createdAt?: string;
}

export interface FactoryInput {
  name: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
}

function readFactory(data: unknown): Factory {
  const body = (data && typeof data === 'object' ? data : {}) as { factory?: Factory };
  return body.factory || (data as Factory);
}

export const factoryApi = {
  list: async () => {
    const result = await apiGet<unknown>(endpoints.factories);
    return readNamedList<Factory>(result.data, 'factories');
  },

  get: async (id: string) => {
    const result = await apiGet<unknown>(endpoints.factory(id));
    return readFactory(result.data);
  },

  create: async (input: FactoryInput) => {
    const result = await apiPost<unknown>(endpoints.factories, input);
    return { message: result.message, factory: readFactory(result.data) };
  },

  update: async (id: string, input: Partial<FactoryInput>) => {
    const result = await apiPut<unknown>(endpoints.factory(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete<unknown>(endpoints.factory(id));
    return result.message;
  },

  rotateGroupToken: async (id: string) => {
    const result = await apiPost<unknown>(endpoints.rotateGroupToken(id));
    return { message: result.message, ...readRotatedToken(result.data) };
  },
};
