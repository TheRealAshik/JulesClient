import { test, expect } from '@playwright/test';

test('verify accessibility attributes in InputArea', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');

    // Login to access the InputArea
    const apiKeyInput = page.locator('input[name="key"]');
    await apiKeyInput.fill('dummy-key');
    await page.getByRole('button', { name: /Enter App/i }).click();

    // Wait for InputArea to appear. It's in HomeView.
    // The InputArea textarea has placeholder "Describe a task or fix..."
    const inputArea = page.getByPlaceholder('Describe a task or fix...');
    await expect(inputArea).toBeVisible();

    // Check Send Button (Default Variant)
    // It should have aria-label="Send message"
    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toHaveAttribute('title', 'Send message');

    // Check Mode Menu Trigger (Default Variant)
    // It should have aria-label="Select session mode"
    const modeButton = page.locator('button[aria-label="Select session mode"]');
    await expect(modeButton).toBeVisible();
    await expect(modeButton).toHaveAttribute('title', 'Select session mode');

    // Take a screenshot of the HomeView with hover over Send button
    await sendButton.hover();
    await page.screenshot({ path: 'home_input_area_hover.png' });
});
