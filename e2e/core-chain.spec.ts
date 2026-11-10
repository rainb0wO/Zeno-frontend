import { expect, test } from '@playwright/test';

const apiBase = process.env.E2E_API_URL || 'http://127.0.0.1:8000/api';
const username = process.env.E2E_USERNAME || 'demo';
const password = process.env.E2E_PASSWORD || 'Demo1234';

test('登录后创建员工和生产计划', async ({ page, request }) => {
  let reachable = true;
  try {
    const probe = await request.post(`${apiBase}/auth/login`, {
      data: { username, password },
      failOnStatusCode: false,
      timeout: 4000,
    });
    reachable = probe.status() < 500;
  } catch {
    reachable = false;
  }
  test.skip(!reachable, '本地后端未启动，跳过核心链路冒烟');

  await page.goto('/login');
  await page.getByPlaceholder('用户名或手机号').fill(username);
  await page.getByPlaceholder('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();

  const stamp = Date.now();
  await page.goto('/personnel');
  await page.getByRole('button', { name: '新建员工' }).click();
  await page.getByLabel('姓名').fill(`冒烟员工${stamp}`);
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page.getByText(`冒烟员工${stamp}`)).toBeVisible();

  await page.goto('/capacity');
  await page.getByRole('button', { name: '新建计划' }).click();
  await page.getByLabel('产品名称').fill(`冒烟计划${stamp}`);
  await page.getByLabel('目标产量').fill('10');
  const range = page.locator('.ant-picker-range');
  await range.click();
  await page.locator('.ant-picker-cell-today').first().click();
  await page.locator('.ant-picker-cell-today').first().click();
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page.getByText(`冒烟计划${stamp}`)).toBeVisible();
});
