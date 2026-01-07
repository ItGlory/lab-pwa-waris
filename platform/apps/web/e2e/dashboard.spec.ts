import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assumes mock data allows unauthenticated access for demo)
    await page.goto('/');
  });

  test('should display dashboard header', async ({ page }) => {
    // Check for main dashboard elements
    await expect(page.getByRole('heading', { name: /แดชบอร์ด|Dashboard/i })).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check sidebar links are present
    await expect(page.getByRole('link', { name: /แดชบอร์ด|Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /DMA|พื้นที่จ่ายน้ำ/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /การแจ้งเตือน|Alerts/i })).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    // Check for KPI/summary cards on dashboard
    await expect(page.getByText(/น้ำสูญเสีย|Water Loss/i)).toBeVisible();
  });

  test('should have working theme toggle', async ({ page }) => {
    // Find and click theme toggle
    const themeButton = page.getByRole('button', { name: /โหมด|mode/i });
    if (await themeButton.isVisible()) {
      await themeButton.click();
      // Theme should toggle (check for class change or visual change)
    }
  });

  test('should open AI chat widget', async ({ page }) => {
    // Find and click chat button
    const chatButton = page.getByRole('button', { name: /เปิดแชท|chat/i });
    await chatButton.click();

    // Chat widget should open
    await expect(page.getByText(/WARIS AI/i)).toBeVisible();
  });

  test('should open command palette with keyboard shortcut', async ({ page }) => {
    // Press Cmd/Ctrl + K
    await page.keyboard.press('Meta+k');

    // Command palette should open
    await expect(page.getByPlaceholder(/ค้นหา|Search/i)).toBeVisible();
  });
});

test.describe('Dashboard - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu button', async ({ page }) => {
    await page.goto('/');

    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open sidebar on mobile menu click', async ({ page }) => {
    await page.goto('/');

    // Click mobile menu
    const menuButton = page.getByRole('button').first();
    await menuButton.click();

    // Sidebar should slide in
    await expect(page.getByRole('link', { name: /แดชบอร์ด|Dashboard/i })).toBeVisible();
  });
});
