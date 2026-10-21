import { test, expect } from '@playwright/test';
import { createUser } from '../../helpers/api';
import { LoginPage } from '../../pages/LoginPage';
import { EditorPage } from '../../pages/EditorPage';

test.describe('Article editor', () => {
  test('author publishes an article with tags and then deletes it', async ({ page }) => {
    const user = await createUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(user.email, user.password);
    await login.expectSignedInAs(user.username);

    const title = `UI article ${Date.now()}`;
    const editor = new EditorPage(page);
    await editor.goto();
    await editor.publish({ title, description: 'Created in the UI', body: '**Markdown** body', tags: ['qa', 'e2e'] });
    await editor.expectArticleShown(title);
    await expect(page.locator('strong', { hasText: 'Markdown' })).toBeVisible();

    await page.getByRole('button', { name: /Delete Article/ }).first().click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toHaveCount(0);
  });

  test('script in the article body is rendered as text, not executed', async ({ page }) => {
    const user = await createUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(user.email, user.password);

    let dialogFired = false;
    page.on('dialog', async (d) => { dialogFired = true; await d.dismiss(); });

    const editor = new EditorPage(page);
    await editor.goto();
    await editor.publish({ title: `XSS check ${Date.now()}`, description: 'xss', body: '<img src=x onerror="alert(1)">' });
    await page.waitForTimeout(1000);
    expect(dialogFired).toBe(false);
  });
});
