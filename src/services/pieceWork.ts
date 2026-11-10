import { requireList } from '../domain/apiEnvelope';
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
  completedAt?: string;
  remark?: string;
}

export const pieceWorkApi = {
  list: async (planId: string) => {
    const result = await apiGet<{ pieceWorks: PieceWork[] }>(endpoints.planPieceWorks(planId));
    return requireList<PieceWork>(result, 'pieceWorks');
  },

  create: async (input: PieceWorkInput) => {
    const result = await apiPost<{ pieceWork: PieceWork }>(endpoints.pieceWorks, input);
    if (!result.pieceWork) throw new Error('响应缺少 pieceWork');
    return { message: result.message, pieceWork: result.pieceWork };
  },
};
