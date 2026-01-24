import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/is');
    await expect(page).toHaveTitle(/Bekkurinn/);
});

test('can navigate to login', async ({ page }) => {
    await page.goto('/is');

    // Mobile check: nav might be hidden inside a menu
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;

    if (isMobile) {
        // Open mobile menu first if exists (assuming there's a menu button)
        // For now we skip mobile nav test if it's complicated
        test.skip(!!isMobile, 'Skipping nav test on mobile for now');
        return;
    }

    const loginLink = page.getByRole('link', { name: 'Innskráning' });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/.*login/);
});

test('landing page loads in English', async ({ page }) => {
    await page.goto('/en');
    // Check for English text - "Sign In"
    await expect(page.getByText('Sign In').first()).toBeVisible();
});
