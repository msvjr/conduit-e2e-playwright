import { test, expect } from '@playwright/test';
import { apiContext, createArticle, createUser } from '../../helpers/api';

test.describe('Articles API — lifecycle and authorization', () => {
  test('author creates, reads, updates and deletes an article', async () => {
    const author = await createUser();
    const api = await apiContext(author.token);
    const article = await createArticle(author.token, { tagList: ['qa', 'playwright'] });

    const read = await api.get(`articles/${article.slug}`);
    expect(read.status()).toBe(200);
    expect((await read.json()).article.tagList).toEqual(expect.arrayContaining(['qa', 'playwright']));

    const update = await api.put(`articles/${article.slug}`, { data: { article: { body: 'Updated body' } } });
    expect(update.status()).toBe(200);
    expect((await update.json()).article.body).toBe('Updated body');

    expect((await api.delete(`articles/${article.slug}`)).ok()).toBeTruthy();
    // A 200 on delete is not proof: confirm the article is really gone.
    expect((await api.get(`articles/${article.slug}`)).status()).toBe(404);
    await api.dispose();
  });

  test('another user cannot update or delete the article', async () => {
    const author = await createUser();
    const intruder = await createUser();
    const article = await createArticle(author.token);
    const api = await apiContext(intruder.token);

    expect((await api.put(`articles/${article.slug}`, { data: { article: { title: 'Hijacked' } } })).status()).toBe(403);
    expect((await api.delete(`articles/${article.slug}`)).status()).toBe(403);

    const guest = await apiContext();
    const still = await guest.get(`articles/${article.slug}`);
    expect((await still.json()).article.title).toBe(article.title);
    await guest.dispose();
    await api.dispose();
  });

  test('guest cannot create an article', async () => {
    const guest = await apiContext();
    const res = await guest.post('articles', { data: { article: { title: 'x', description: 'x', body: 'x' } } });
    expect(res.status()).toBe(401);
    await guest.dispose();
  });

  test('rejects an article without title', async () => {
    const author = await createUser();
    const api = await apiContext(author.token);
    const res = await api.post('articles', { data: { article: { title: '', description: 'd', body: 'b' } } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });
});
