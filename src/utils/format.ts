/**
 * 格式化百分比
 * @param rate 0-1 的小数
 * @param digits 保留小数位数
 */
export const formatPercent = (rate: number, digits: number = 1): string => {
  return (rate * 100).toFixed(digits) + '%';
};

/**
 * 格式化人民币金额
 * @param amount 金额（元）
 */
export const formatCNY = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * 格式化数字千分位
 * @param n 数字
 */
export const formatNumber = (n: number): string => {
  return new Intl.NumberFormat('zh-CN').format(n);
};

