import { APIRequestContext, expect, request } from '@playwright/test';

export const API_URL = (process.env.API_URL ?? 'http://localhost:3000/api') + '/';

export type TestUser = { username: string; email: string; password: string; token: string };

// Unique data per run so tests never depend on each other or on leftovers.
export function uniqueUser() {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return { username: `qa${id}`, email: `qa${id}@example.com`, password: `Pw-${id}!` };
}

export async function apiContext(token?: string): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: token ? { Authorization: `Token ${token}` } : {},
  });
}

// Creates a user through the API — UI tests start from a known state without clicking through sign-up.
export async function createUser(): Promise<TestUser> {
  const data = uniqueUser();
  const ctx = await apiContext();
  const res = await ctx.post('users', { data: { user: data } });
  expect(res.status(), await res.text()).toBe(201);
  const body = await res.json();
  await ctx.dispose();
  return { ...data, token: body.user.token };
}

export async function createArticle(token: string, overrides: Partial<{ title: string; tagList: string[] }> = {}) {
  const ctx = await apiContext(token);
  const title = overrides.title ?? `QA article ${Date.now()}`;
  const res = await ctx.post('articles', {
    data: { article: { title, description: 'Created by API', body: 'Body text', tagList: overrides.tagList ?? ['qa'] } },
  });
  expect(res.status(), await res.text()).toBe(201);
  const { article } = await res.json();
  await ctx.dispose();
  return article as { slug: string; title: string };
}
