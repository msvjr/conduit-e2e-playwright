import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async signIn(email: string, password: string) {
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async expectSignedInAs(username: string) {
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
  }

  async expectError(text: RegExp) {
    await expect(this.page.locator('.error-messages')).toContainText(text);
  }
}
