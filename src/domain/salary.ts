const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function formatSalaryMonth(value: string): string {
  const month = value.trim();
  if (!MONTH.test(month)) {
    throw new Error('月份格式应为 YYYY-MM');
  }
  return month;
}

export function readPiecePay(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const calculation = (data as { salaryCalculation?: { piecePay?: unknown } }).salaryCalculation;
  const piecePay = calculation?.piecePay;
  return typeof piecePay === 'number' && Number.isFinite(piecePay) ? piecePay : null;
}
