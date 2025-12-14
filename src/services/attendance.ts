import { get, post, put, del } from './request';

// 考勤记录类型
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'SICK_LEAVE' | 'PERSONAL_LEAVE';
  createdAt: string;
  updatedAt: string;
}

// 请假申请类型
export interface LeaveApplication {
  id: string;
  employeeId: string;
  leaveType: 'SICK_LEAVE' | 'PERSONAL_LEAVE' | 'ANNUAL_LEAVE' | 'MATERNITY_LEAVE' | 'PATERNITY_LEAVE' | 'OTHER';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建考勤记录参数
export interface CreateAttendanceParams {
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE';
}

// 创建请假申请参数
export interface CreateLeaveParams {
  employeeId: string;
  leaveType: 'SICK_LEAVE' | 'PERSONAL_LEAVE' | 'ANNUAL_LEAVE' | 'MATERNITY_LEAVE' | 'PATERNITY_LEAVE' | 'OTHER';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

// 考勤管理API
export const attendanceApi = {
  // 获取考勤记录列表
  getAttendanceRecords: (params?: {
    employeeId?: string;
    date?: string;
    status?: string;
  }): Promise<{ attendanceRecords: AttendanceRecord[] }> => {
    return get<{ attendanceRecords: AttendanceRecord[] }>('/attendance', params);
  },

  // 获取考勤记录详情
  getAttendanceRecordById: (id: string): Promise<{ attendanceRecord: AttendanceRecord }> => {
    return get<{ attendanceRecord: AttendanceRecord }>(`/attendance/${id}`);
  },

  // 创建考勤记录（打卡）
  createAttendanceRecord: (params: CreateAttendanceParams): Promise<{ message: string; attendanceRecord: AttendanceRecord }> => {
    return post<{ message: string; attendanceRecord: AttendanceRecord }>('/attendance', params);
  },

  // 更新考勤记录
  updateAttendanceRecord: (id: string, params: Partial<CreateAttendanceParams>): Promise<{ message: string; attendanceRecord: AttendanceRecord }> => {
    return put<{ message: string; attendanceRecord: AttendanceRecord }>(`/attendance/${id}`, params);
  },

  // 删除考勤记录
  deleteAttendanceRecord: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/attendance/${id}`);
  },

  // 获取请假申请列表
  getLeaveApplications: (params?: {
    employeeId?: string;
    status?: string;
  }): Promise<{ leaveApplications: LeaveApplication[] }> => {
    return get<{ leaveApplications: LeaveApplication[] }>('/attendance/leave', params);
  },

  // 创建请假申请
  createLeaveApplication: (params: CreateLeaveParams): Promise<{ message: string; leaveApplication: LeaveApplication }> => {
    return post<{ message: string; leaveApplication: LeaveApplication }>('/attendance/leave', params);
  },

  // 审批请假申请
  approveLeaveApplication: (id: string, params: { status: 'APPROVED' | 'REJECTED' }): Promise<{ message: string }> => {
    return put<{ message: string }>(`/attendance/leave/${id}/approve`, params);
  },
};

export default attendanceApi;
