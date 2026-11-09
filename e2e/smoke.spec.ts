import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/is');
    await expect(page).toHaveTitle(/Bekkurinn/);
});

test('login is closed and redirects to the landing page', async ({ page }) => {
    // Gamla forritið er lokað: innskráning vísar á forsíðuna (sjá lib/closedRoutes.ts)
    await page.goto('/is/login');
    await expect(page).toHaveURL(/\/is\/?$/);
    await expect(page.getByRole('link', { name: 'Innskráning' })).toHaveCount(0);
});

test('landing page loads in English', async ({ page }) => {
    await page.goto('/en');
    // Check for English text in the nav
    await expect(page.getByText('Comparison').first()).toBeVisible();
});
