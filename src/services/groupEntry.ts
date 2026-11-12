import { buildGroupSavePayload, normalizeGroupInit, type GroupInitView, type GroupSaveRecord } from '../domain/groupEntry';
import { apiGet, apiPost } from './http';
import { endpoints } from './endpoints';

export type { GroupInitView };

export const groupEntryApi = {
  init: async (token: string, date: string): Promise<GroupInitView> => {
    const result = await apiGet<{
      factory: { id: string; name: string };
      date: string;
      editable: boolean;
      groups: Array<{ id: string; name: string; employees: Array<{ id: string; employeeId: string; name: string }> }>;
      records: Array<{ employeeId: string; groupId: string; quantity: number; remark: string; absent?: boolean }>;
    }>(endpoints.groupInit, { token, date }, { skipAuthRedirect: true, skipErrorToast: true });
    return normalizeGroupInit(result);
  },

  save: async (input: {
    token: string;
    date: string;
    groupId: string;
    records: GroupSaveRecord[];
  }) => {
    const result = await apiPost(endpoints.groupSave, buildGroupSavePayload(input), {
      skipAuthRedirect: true,
      skipErrorToast: true,
    });
    return result.message;
  },
};
