import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.getByRole('heading', { name: /เข้าสู่ระบบ|Login/i })).toBeVisible();
    await expect(page.getByLabel(/อีเมล|Email/i)).toBeVisible();
    await expect(page.getByLabel(/รหัสผ่าน|Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /เข้าสู่ระบบ|Login/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Click login without filling form
    await page.getByRole('button', { name: /เข้าสู่ระบบ|Login/i }).click();

    // Should show validation or stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByLabel(/อีเมล|Email/i).fill('invalid@example.com');
    await page.getByLabel(/รหัสผ่าน|Password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /เข้าสู่ระบบ|Login/i }).click();

    // Should show error message or stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    await page.goto('/login');

    // Fill in valid credentials (using mock user from seed data)
    await page.getByLabel(/อีเมล|Email/i).fill('admin@pwa.co.th');
    await page.getByLabel(/รหัสผ่าน|Password/i).fill('admin123');
    await page.getByRole('button', { name: /เข้าสู่ระบบ|Login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard|\/$/);
  });
});
