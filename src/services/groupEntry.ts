import { buildGroupSavePayload, normalizeGroupInit, type GroupInitView } from '../domain/groupEntry';
import { apiGet, apiPost } from './http';
import { endpoints } from './endpoints';

export type { GroupInitView };

export const groupEntryApi = {
  init: async (token: string, date: string): Promise<GroupInitView> => {
    const result = await apiGet<unknown>(endpoints.groupInit, { token, date }, { skipAuthRedirect: true, skipErrorToast: true });
    return normalizeGroupInit(result.data);
  },

  save: async (input: { token: string; date: string; records: Array<{ employeeId: string; quantity: number }> }) => {
    const result = await apiPost<unknown>(endpoints.groupSave, buildGroupSavePayload(input), { skipAuthRedirect: true, skipErrorToast: true });
    return result.message;
  },
};
