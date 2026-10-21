import { test, expect } from '@playwright/test';
import { uniqueUser } from '../../helpers/api';

test.describe('Auth API', () => {
  test('registers a new user and returns a token', async ({ request }) => {
    const user = uniqueUser();
    const res = await request.post('users', { data: { user } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user.username).toBe(user.username);
    expect(body.user.token).toBeTruthy();
    expect(body.user).not.toHaveProperty('password');
  });

  test('rejects a duplicate email', async ({ request }) => {
    const user = uniqueUser();
    await request.post('users', { data: { user } });
    const res = await request.post('users', { data: { user: { ...user, username: user.username + 'x' } } });
    expect(res.status()).toBe(422);
  });

  test('logs in with valid credentials', async ({ request }) => {
    const user = uniqueUser();
    await request.post('users', { data: { user } });
    const res = await request.post('users/login', { data: { user: { email: user.email, password: user.password } } });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).user.email).toBe(user.email);
  });

  test('rejects a wrong password without revealing which field is wrong', async ({ request }) => {
    const user = uniqueUser();
    await request.post('users', { data: { user } });
    const res = await request.post('users/login', { data: { user: { email: user.email, password: 'wrong-password' } } });
    expect(res.ok()).toBeFalsy();
    expect(JSON.stringify(await res.json())).not.toMatch(/password is correct|user exists/i);
  });

  test('blocks the current-user endpoint without a token', async ({ request }) => {
    const res = await request.get('user');
    expect(res.status()).toBe(401);
  });
});
