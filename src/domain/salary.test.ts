import { describe, expect, it } from 'vitest';
import { formatSalaryMonth, readPiecePay } from './salary';

describe('salary', () => {
  it('requires YYYY-MM and reads piecePay', () => {
    expect(formatSalaryMonth('2026-11')).toBe('2026-11');
    expect(() => formatSalaryMonth('2026-13')).toThrow('YYYY-MM');
    expect(readPiecePay({ salaryCalculation: { piecePay: 1280.5 } })).toBe(1280.5);
    expect(readPiecePay({ salaryCalculation: {} })).toBeNull();
  });
});
