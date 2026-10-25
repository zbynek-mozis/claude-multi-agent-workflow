# NOTES — api-quality

## What it does

`api-quality` is a code-quality plugin for Express APIs. One command, `/api-quality:audit [api-dir]`, runs three subagents as a workflow:

1. loads the `express-api-conventions` skill and the project's own `CLAUDE.md`;
2. **in parallel**: `route-reviewer` reviews routes and the store against the conventions, `docs-auditor` compares `docs/api.md` with the routes;
3. merges both reports into one findings list;
4. `test-writer` turns every finding into a test — passing if the code is right, `todo` if the code has the bug;
5. reruns the suite itself and reports findings, tests, and the code fixes it did **not** make.

A `PostToolUse` hook runs the project's ESLint on every JS file Claude writes or edits and feeds lint errors back, so the test writer's output is lint-clean before the workflow ends.

## Install

From GitHub (as a user):

```
/plugin marketplace add zbynek-mozis/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

From a local checkout (while developing):

```
claude --plugin-dir .
```

Then, from the repo root (after `cd course-api && npm install`): `/api-quality:audit course-api`. Inside another project, run `/api-quality:audit` with no argument. Use `/reload-plugins` after editing plugin files.

## Scoping decision — who gets which tools and model

| Agent | Tools | Model | Why |
|-------|-------|-------|-----|
| `route-reviewer` | Read, Grep, Glob | sonnet | Finding real defects (null handling, Express defaults that bypass the JSON error shape, leaking store internals) needs reasoning across files, so not haiku. It must never "helpfully" fix what it finds — a reviewer that edits destroys the separation between finding and fixing, so it gets no write tools at all. |
| `docs-auditor` | Read, Grep, Glob | haiku | Mechanical comparison of two endpoint lists. Cheap and fast is the right trade. A weaker model's misses are the risk, so Step 3 compares its "Endpoints checked" count with the route handlers the orchestrator counts itself and flags any gap — that catches skipped endpoints, not every missed detail. |
| `test-writer` | Read, Grep, Glob, Write, Edit, Bash | sonnet | It must write files and run `npm test` to iterate until the suite is green, so it needs Write/Edit and Bash. |

The hard call was **Bash on `test-writer`**. Without it the agent writes tests blind and the orchestrator has to loop "run tests → send failures back" — slower and more tokens. With it the agent could, in principle, run anything. I kept Bash and narrowed it in two other places instead: the agent body allows only `npm test` / `npm run lint` and edits only under `tests/`, and the orchestrator reruns `npm test` itself in Step 5 rather than trusting the agent's summary. The prompt limit is a guideline, not an enforcement — if the plugin were used on untrusted repos I'd drop Bash and move the test loop into the command.

## Orchestration decision — what runs in parallel and what waits

- **Step 2 is parallel** because the reviewer and the docs auditor read the same code but need nothing from each other. Running them together makes the read phase as long as the slower of the two instead of their sum, and neither can bias the other.
- **Step 3 waits for both** because merging is only meaningful with both tables: the same bug often shows up as a route finding *and* a docs mismatch (`docs/api.md` promises JSON errors everywhere, while Express's default 404 for unknown routes and its malformed-JSON error are HTML — the reviewer reports it as a convention breach, the auditor as drift), and deduplicating it before the writer sees it avoids two tests for one behaviour.
  The first run on `course-api` proved this step earns its place: the haiku docs auditor reported "no drift" and missed exactly that JSON-error promise in `docs/api.md:5`; the orchestrator caught it while merging and folded it into the two route findings.
- **Step 4 waits for Step 3** because the test writer's input *is* the merged findings list. Starting it earlier would mean writing tests against an incomplete list and redoing them.
- **Step 5 waits for Step 4** because it verifies the writer's work; the orchestrator runs the suite itself instead of passing the agent's summary through unchecked.
- **Step 1 runs first**, before the parallel step, so both reviewers get the same conventions checklist and the project's `CLAUDE.md` overrides are applied once, not interpreted twice.
