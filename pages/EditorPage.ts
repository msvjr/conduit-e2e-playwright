import { Page, expect } from '@playwright/test';

export class EditorPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/editor');
  }

  async publish(article: { title: string; description: string; body: string; tags?: string[] }) {
    await this.page.getByPlaceholder('Article Title').fill(article.title);
    await this.page.getByPlaceholder("What's this article about?").fill(article.description);
    await this.page.getByPlaceholder('Write your article (in markdown)').fill(article.body);
    for (const tag of article.tags ?? []) {
      await this.page.getByPlaceholder('Enter tags').fill(tag);
      await this.page.keyboard.press('Enter');
    }
    await this.page.getByRole('button', { name: 'Publish Article' }).click();
  }

  async expectArticleShown(title: string) {
    await expect(this.page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  }
}
