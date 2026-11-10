import { formatSalaryMonth, readPiecePay } from '../domain/salary';
import { apiPost } from './http';
import { endpoints } from './endpoints';

export interface SalaryCalculation {
  employeeId: string;
  employeeName: string;
  month: string;
  quantity: number;
  basicSalary: number;
  piecePay: number;
  overtimePay: number;
  bonus: number;
  deduction: number;
  totalSalary: number;
  salaryRecordId: string;
}

export const salaryApi = {
  calculate: async (employeeId: string, month: string) => {
    const result = await apiPost<{ salaryCalculation: SalaryCalculation }>(endpoints.salaryCalculate, {
      employeeId,
      month: formatSalaryMonth(month),
    });
    if (!result.salaryCalculation) throw new Error('响应缺少 salaryCalculation');
    return {
      message: result.message,
      calculation: result.salaryCalculation,
      piecePay: readPiecePay(result),
    };
  },
};
