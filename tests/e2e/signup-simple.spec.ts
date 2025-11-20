import { test, expect } from '@playwright/test';
import { cleanupUserByEmail } from '../helpers/cleanup';

test.describe('Signup Flow with Organization Creation', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Jean Dupont',
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    organizationName: `Test Organization ${timestamp}`,
  };

  test.afterAll(async () => {
    // Cleanup using API
    await cleanupUserByEmail(testUser.email);
  });

  test('should complete full signup flow and create organization', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Verify we're on the signup page
    await expect(page.getByRole('heading', { name: /créer votre compte/i })).toBeVisible();

    // Fill in the signup form
    await page.getByLabel(/nom complet/i).fill(testUser.name);
    await page.getByLabel(/^email$/i).fill(testUser.email);
    await page.getByLabel(/nom de votre organisation/i).fill(testUser.organizationName);
    await page.getByLabel(/mot de passe/i).fill(testUser.password);

    // Submit the form
    await page.getByRole('button', { name: /créer mon compte/i }).click();

    // Wait for redirect to dashboard (this means signup was successful)
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Verify dashboard shows welcome message with user name
    await expect(page.getByText(new RegExp(`Bienvenue.*${testUser.name.split(' ')[0]}`, 'i'))).toBeVisible();

    // Verify organization appears in the dashboard
    await expect(page.getByText(testUser.organizationName)).toBeVisible();

    // Verify the user has OWNER role
    await expect(page.getByText('OWNER')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit empty form
    await page.getByRole('button', { name: /créer mon compte/i }).click();

    // Check for validation errors
    await expect(page.getByText(/Le nom doit contenir au moins 2 caractères/i)).toBeVisible();
    await expect(page.getByText(/Email invalide/i)).toBeVisible();
    await expect(page.getByText(/Le mot de passe doit contenir au moins 8 caractères/i)).toBeVisible();
  });
});
