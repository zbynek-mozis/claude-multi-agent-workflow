# api-quality

A Claude Code plugin that runs a multi-agent code-quality workflow on an Express API: two read-only reviewers in parallel, then a test writer that pins every finding in a test.

This repository is both the plugin and the marketplace that offers it. `course-api/` is a sample Express API to try it on.

## Install

```
/plugin marketplace add zbynek-mozis/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

For local development, load it straight from a checkout:

```
claude --plugin-dir .
```

## Use

```
/api-quality:audit [api-dir]
```

`api-dir` defaults to the current directory (or the first Express project one level down). The command:

1. loads the `express-api-conventions` skill and the API's own `CLAUDE.md`;
2. runs `route-reviewer` and `docs-auditor` **in parallel**;
3. merges their findings;
4. hands them to `test-writer`, which adds tests — passing where the code is right, `todo` where it has the bug;
5. reruns the test suite and reports findings, test results, and the code fixes it recommends (it does not apply them).

Try it on the sample API:

```
cd course-api && npm install && cd ..
claude --plugin-dir .
> /api-quality:audit course-api
```

## Components

| Component | Name | What it does |
|-----------|------|--------------|
| Command | `/api-quality:audit` | Orchestrates the workflow above. |
| Subagent | `api-quality:route-reviewer` | Read-only (Read, Grep, Glob), sonnet. Reviews routes and the store for validation, status codes, error shape, and state handling. |
| Subagent | `api-quality:docs-auditor` | Read-only (Read, Grep, Glob), haiku. Reports drift between `docs/api.md` and the routes. |
| Subagent | `api-quality:test-writer` | Read, Grep, Glob, Write, Edit, Bash; sonnet. Writes tests only, runs `npm test` / `npm run lint`. |
| Skill | `api-quality:express-api-conventions` | Conventions checklist for Express endpoints and their tests. Also usable on its own when writing a route. |
| Hook | `PostToolUse` on Write/Edit/MultiEdit | Runs the project's local ESLint on the edited JS file; lint errors go back to Claude. It lints the whole file, so pre-existing errors in a file Claude touches also block until fixed. Active in every session where the plugin is enabled; skips silently if the project has no ESLint. |

## Layout

```
.claude-plugin/
  plugin.json          # manifest: name, version
  marketplace.json     # marketplace catalog, lists this plugin with source "./"
agents/                # route-reviewer, docs-auditor, test-writer
commands/audit.md      # the workflow
skills/express-api-conventions/SKILL.md
hooks/hooks.json       # references ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lint-on-edit.js
hooks/scripts/lint-on-edit.js
course-api/            # sample API, not part of the plugin's behaviour
```

## Requirements

- Claude Code with plugin support.
- Node.js on `PATH` (the lint hook is a Node script).
- The audited project uses ESLint flat config (`eslint.config.*`) for the hook to lint; otherwise the hook does nothing.

## Versioning

The version lives in `.claude-plugin/plugin.json`. Bump it for every release users should receive; `/plugin update api-quality@api-quality-marketplace` picks up the new version.

Design decisions (tool scoping, parallel vs. sequential steps) are in [NOTES.md](NOTES.md).
