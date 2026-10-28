# Agent Operating Rules

## Mission

Implement this project according to `SPEC.md`, respecting `ARCHITECTURE.md`.

## Mandatory Context

Before modifying code, read:

1. `SPEC.md`
2. `ARCHITECTURE.md`
3. `.agent/tasks.json`
4. `.agent/progress.md`
5. `.agent/decisions.md`
6. current Git status
7. recent Git history

Confirm the real repository state before trusting progress notes.

## Execution Rules

- Work on one task at a time.
- Investigate existing code before editing.
- Preserve existing patterns when they are reasonable.
- Do not introduce dependencies without a clear reason.
- Do not expose secrets.
- Do not perform destructive production operations.
- Do not force push.
- Do not mark a task done without validation.

## Definition of Done

A task is done only when:

- acceptance criteria are met;
- implementation is complete;
- relevant tests are added or updated when needed;
- `./scripts/verify.sh` passes, or unavailable checks are documented;
- `.agent/tasks.json` and `.agent/progress.md` are updated.

## Failure Policy

When validation fails:

1. stop forward progress;
2. identify the root cause;
3. fix it;
4. rerun validation;
5. record recurring or important failures in `.agent/failures.md`.
