import { readNamedList } from '../domain/apiEnvelope';
import { apiGet, apiPost } from './http';
import { endpoints } from './endpoints';

export interface PieceWork {
  id: string;
  planId?: string;
  processId?: string;
  employeeId: string;
  quantity: number;
  completedAt?: string;
  remark?: string;
}

export interface PieceWorkInput {
  planId: string;
  processId: string;
  employeeId: string;
  quantity: number;
  remark?: string;
}

export const pieceWorkApi = {
  list: async (planId: string) => {
    const result = await apiGet<unknown>(endpoints.pieceWorks, { planId });
    return readNamedList<PieceWork>(result.data, 'pieceWorks');
  },

  create: async (input: PieceWorkInput) => {
    const result = await apiPost<unknown>(endpoints.pieceWorks, input);
    return result.message;
  },
};
