import { readPiecePay, formatSalaryMonth } from '../domain/salary';
import { apiPost } from './http';
import { endpoints } from './endpoints';

export interface SalaryCalculationResult {
  piecePay: number | null;
  raw: unknown;
}

export const salaryApi = {
  calculate: async (employeeId: string, month: string): Promise<SalaryCalculationResult & { message: string }> => {
    const result = await apiPost<unknown>(endpoints.salaryCalculate, {
      employeeId,
      month: formatSalaryMonth(month),
    });
    return { message: result.message, piecePay: readPiecePay(result.data), raw: result.data };
  },
};
