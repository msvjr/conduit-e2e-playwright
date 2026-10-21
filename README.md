# Conduit E2E — Playwright + TypeScript

UI and API test automation for **Conduit**, the [RealWorld](https://github.com/gothinkster/realworld) blogging app.

## What it covers

| Suite | Tests | Focus |
|---|---|---|
| `tests/api/auth.api.spec.ts` | 5 | Sign-up, duplicate email, login, wrong password, protected endpoint without token |
| `tests/api/articles.api.spec.ts` | 4 | Full article lifecycle, **authorization (non-author gets 403)**, guest 401, validation 422 |
| `tests/ui/auth.spec.ts` | 2 | Sign-in happy path and error message |
| `tests/ui/article.spec.ts` | 2 | Publish with tags + markdown rendering + delete; XSS payload is not executed |

UI tests run on **Chromium and Firefox**.

## Design choices

- **Page Object Model** (`pages/`) — selectors live in one place; tests read like the test case.
- **API-seeded data** (`helpers/api.ts`) — each test creates its own user and article through the API, so UI tests are fast, independent and parallel-safe.
- **Delete is verified, not trusted** — after a delete, a `GET` must return 404.
- **Authorization tested at the API**, where it actually matters, following the [permission table](https://github.com/msvjr/qa-documentation/blob/main/docs/permission-table.md).
- **Failure evidence** — trace on retry, screenshot and video on failure, HTML report as a CI artifact.

## Run

```bash
npm install
npx playwright install
BASE_URL=http://localhost:4100 API_URL=http://localhost:3000/api npx playwright test
npx playwright show-report
```

Point `BASE_URL` and `API_URL` to any RealWorld-compliant Conduit instance (local Docker or hosted). In CI, run the **E2E tests** workflow manually and provide both URLs.

Related: [test plan, RTM and permission table](https://github.com/msvjr/qa-documentation).

---
*Part of [Marcio Viana Junior's portfolio](https://github.com/msvjr).*
