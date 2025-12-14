import request from './request';

export interface Backup {
  name: string;
  size: number;
  createdAt: string;
}

export interface BackupResult {
  filename: string;
  path: string;
}

export interface RestoreResult {
  version: string;
  timestamp: string;
}

// 创建备份
export const createBackup = (version?: string) => {
  return request.post<BackupResult>('/backup', { version });
};

// 获取备份列表
export const listBackups = () => {
  return request.get<Backup[]>('/backup');
};

// 恢复备份
export const restoreBackup = (filename: string) => {
  return request.post<RestoreResult>(`/backup/restore/${filename}`);
};

// 验证备份
export const validateBackup = (filename: string) => {
  return request.get<{ valid: boolean; errors: string[] }>(`/backup/validate/${filename}`);
};

export const backupApi = {
  createBackup,
  listBackups,
  restoreBackup,
  validateBackup
};
