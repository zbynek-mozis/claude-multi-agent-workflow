---
name: express-api-conventions
description: Conventions checklist for reviewing, writing, or testing Express.js REST endpoints — validation, status codes, JSON error shape, store-only data access, and supertest + node:test patterns. Use when adding or changing an Express route, reviewing one, or writing tests for one; the /api-quality:audit workflow loads it first.
---

# Express API conventions

A checklist for small Express REST APIs. **The project's own `CLAUDE.md` / `AGENTS.md` wins** wherever it says something different — name the difference instead of silently picking one.

## Structure

- One router file per resource in `routes/`, mounted once in the entry point (`server.js`) under its base path.
- All data access goes through the store module (`db/store.js` or equivalent). Routes hold no state.
- The store must not hand out its internal arrays or objects for callers to mutate — return copies, or document that it doesn't.
- The app is exported without calling `listen()` when imported, so tests can use it directly.

## Request handling

| Situation | Status | Body |
|-----------|--------|------|
| Created | `201` | the created record |
| Read / updated | `200` | the record |
| Missing or invalid input | `400` | `{ "error": "message" }` |
| Record not found | `404` | `{ "error": "message" }` |
| Unknown route | `404` | `{ "error": "message" }` — needs an app-level fallback, Express default is HTML |
| Malformed JSON body | `400` | `{ "error": "message" }` — needs an error-handling middleware, Express default is HTML |

Validation checklist for each field the route accepts:

- present when required;
- right type (`typeof name === 'string'`), not just truthy — `null`, `0`, `[]`, `{}` are all "present";
- non-empty after trim for strings;
- ids from `req.params` parsed and checked (`Number.isInteger(id) && id > 0`), otherwise `400` or `404` — decide once and apply everywhere.

## Testing

- Runner: whatever the project uses (`node --test` for node:test, otherwise Jest/Vitest). Requests via `supertest` against the exported app.
- Reset state before each test (`test.beforeEach(() => store.reset())`) so tests are order-independent.
- One behaviour per test; name it after the behaviour: `POST /users rejects a non-string name with 400`.
- Assert status **and** body shape for error paths: `assert.equal(res.status, 400); assert.ok(res.body.error)`.
- A test for a known bug asserts the correct behaviour and is marked todo (`test('…', { todo: 'reason' }, fn)` in node:test) until the code is fixed — the gap stays visible without breaking CI.
