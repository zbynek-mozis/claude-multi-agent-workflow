---
description: Run the api-quality workflow on an Express API — parallel route review and docs-drift audit, then tests that pin every finding.
argument-hint: "[api-dir]"
---

Run the api-quality audit workflow on the Express API in `$ARGUMENTS`. If no directory was given, use the current working directory; if that has no `package.json` with an `express` dependency, look one level down (for example `course-api/`) and use the first match. Call the result API_DIR and use its absolute path in every step below.

Run the steps in this order. Do not skip a step and do not start a step before the one it depends on has returned.

## Step 1 — Load the conventions (sequential, before anything else)

Invoke the `api-quality:express-api-conventions` skill. Then read `API_DIR/CLAUDE.md` (and `API_DIR/AGENTS.md` if present). Merge them into one short conventions checklist; where the project file disagrees with the skill, the project file wins — note each such disagreement.

## Step 2 — Review and docs audit (parallel)

These two jobs read the same code but do not depend on each other. Launch both subagents **in a single message** so they run at the same time:

- `api-quality:route-reviewer` — prompt: API_DIR, the conventions checklist from Step 1, and "Return the Route review table."
- `api-quality:docs-auditor` — prompt: API_DIR and "Return the Docs drift table."

Wait until both have returned. If one fails, report that and continue with the other's results; if both fail, stop and report.

## Step 3 — Consolidate (sequential, depends on Step 2)

Merge the two tables into one findings list:

- keep the ids (`R…`, `D…`);
- when a route finding and a docs finding describe the same behaviour, keep one entry and list both ids;
- drop findings with `confidence: low` that you cannot confirm by reading the cited line yourself;
- sanity-check the docs auditor's coverage: count the route handlers in `API_DIR/routes/` (`router.get(`, `router.post(`, …) and compare with its "Endpoints checked" count. If they differ, say so in the report.

If the list is empty, skip Step 4 and say so in the report.

## Step 4 — Pin the findings in tests (sequential, depends on Step 3)

Launch `api-quality:test-writer` with API_DIR and the consolidated findings list (each with id, location, and reproduce line). It writes tests only and runs the suite.

## Step 5 — Verify and report (sequential, depends on Step 4)

Run `npm test` in API_DIR yourself — do not rely only on the test writer's summary. Then give the user:

1. **Findings** — the consolidated table, with a status column: `pinned (passing)`, `pinned (todo — code bug)`, or `not tested (reason)`.
2. **Tests** — which files were added or changed, and the pass / fail / todo counts from your own test run.
3. **Code fixes needed** — from the test writer, one line each. Do not apply them; ask the user whether they want them fixed.
4. **Order of execution** — one line confirming which subagents ran in parallel and which ran after them.
