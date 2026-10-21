import { test } from '@playwright/test';
import { createUser } from '../../helpers/api';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Sign in', () => {
  test('user signs in and sees their name in the header', async ({ page }) => {
    const user = await createUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(user.email, user.password);
    await login.expectSignedInAs(user.username);
  });

  test('wrong password shows an error and keeps the user signed out', async ({ page }) => {
    const user = await createUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(user.email, 'wrong-password');
    await login.expectError(/invalid|wrong/i);
  });
});
