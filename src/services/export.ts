import { get } from './request';

export interface ExportOptions {
  filters?: Record<string, any>;
  fields?: string[];
}

// 导出产能管理数据
export const exportCapacity = async (options?: ExportOptions): Promise<Blob> => {
  const response = await get('/capacity/export', options, {
    responseType: 'blob'
  });
  return response;
};

// 导出排班数据
export const exportSchedule = async (options?: ExportOptions): Promise<Blob> => {
  const response = await get('/schedules/export', options, {
    responseType: 'blob'
  });
  return response;
};

// 导出生产计划数据
export const exportProductionPlan = async (options?: ExportOptions): Promise<Blob> => {
  const response = await get('/capacity/plans/export', options, {
    responseType: 'blob'
  });
  return response;
};

// 导出考勤数据
export const exportAttendance = async (options?: ExportOptions): Promise<Blob> => {
  const response = await get('/attendance/export', options, {
    responseType: 'blob'
  });
  return response;
};

// 导出薪资数据
export const exportSalary = async (options?: ExportOptions): Promise<Blob> => {
  const response = await get('/salary/export', options, {
    responseType: 'blob'
  });
  return response;
};

// 导出员工数据
export const exportEmployees = async (options?: ExportOptions): Promise<Blob> => {
  const response = await get('/employees/export', options, {
    responseType: 'blob'
  });
  return response;
};

// 通用下载方法
export const downloadExcel = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
