import { test, expect } from '@playwright/test';
import { cleanupUserByEmail } from '../helpers/cleanup';

test.describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Auth Test User',
    email: `auth-test-${timestamp}@example.com`,
    password: 'AuthTest123!',
    organizationName: `Auth Org ${timestamp}`,
  };

  // Helper function to create a test user
  async function createTestUser(page: any) {
    await page.goto('/signup');
    await page.getByLabel(/nom complet/i).fill(testUser.name);
    await page.getByLabel(/^email$/i).fill(testUser.email);
    await page.getByLabel(/nom de votre organisation/i).fill(testUser.organizationName);
    await page.getByLabel(/mot de passe/i).fill(testUser.password);
    await page.getByRole('button', { name: /créer mon compte/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  }

  test.afterAll(async () => {
    await cleanupUserByEmail(testUser.email);
  });

  test('should login and logout successfully', async ({ page }) => {
    // First, create a user
    await createTestUser(page);

    // Logout
    await page.getByRole('button', { name: /déconnexion/i }).click();
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    // Login again
    await page.getByLabel(/^email$/i).fill(testUser.email);
    await page.getByLabel(/mot de passe/i).fill(testUser.password);
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Should be back on dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByText(new RegExp(testUser.name.split(' ')[0], 'i'))).toBeVisible();
  });

  test('should show error with invalid password', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/^email$/i).fill(testUser.email);
    await page.getByLabel(/mot de passe/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Should show error message
    await expect(page.getByText(/incorrect/i)).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should redirect authenticated users away from auth pages', async ({ page }) => {
    // Create and login a user
    await createTestUser(page);

    // Try to visit login page
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Try to visit signup page
    await page.goto('/signup');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });
});
