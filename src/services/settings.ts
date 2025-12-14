import { get, put, post } from './request';

// 类型定义
export interface PersonalInfo {
  username: string;
  email: string;
  phone: string;
  avatar: string;
  factoryId: string;
  departmentId: string;
}

export interface Notifications {
  orderProgress: boolean;
  scheduleChange: boolean;
  pieceWorkAudit: boolean;
  capacityAlert: boolean;
}

export interface SystemPreferences {
  defaultPage: string;
  tablePageSize: number;
  theme: string;
  processMode: string;
  exportFormat: string;
  autoRefreshInterval: number;
  capacityDimension: string;
  showComparison: boolean;
  hideZeroOutput: boolean;
  scheduleFields: string;
  highlightOvertime: boolean;
  showLeave: boolean;
  shareLinkExpiry: number;
  allowEdit: boolean;
  maxFileSize: number;
  allowedFormats: string[];
}

export interface UserSettings {
  personalInfo: PersonalInfo;
  notifications: Notifications;
  systemPreferences: SystemPreferences;
}

// API方法
export const settingsApi = {
  // 获取用户设置
  getUserSettings: (): Promise<{ settings: UserSettings }> => {
    return get<{ settings: UserSettings }>('/settings');
  },

  // 更新个人信息
  updatePersonalInfo: (data: Partial<PersonalInfo>) => {
    return put('/settings/personal-info', data);
  },

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return put('/settings/change-password', data);
  },

  // 更新通知设置
  updateNotifications: (data: Notifications) => {
    return put('/settings/notifications', data);
  },

  // 恢复默认通知设置
  resetNotifications: () => {
    return post('/settings/notifications/reset');
  },

  // 更新系统偏好设置
  updateSystemPreferences: (data: SystemPreferences) => {
    return put('/settings/system-preferences', data);
  },

  // 恢复默认系统设置
  resetSystemPreferences: () => {
    return post('/settings/system-preferences/reset');
  },

  // 导出配置
  exportSettings: () => {
    return get('/settings/export');
  },

  // 导入配置
  importSettings: (data: { notifications?: Notifications; systemPreferences?: SystemPreferences }) => {
    return post('/settings/import', data);
  }
};
