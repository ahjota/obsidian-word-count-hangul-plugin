# AGENTS.md — Autonomous TDD Orchestration

**Last Updated:** October 2025
**Goal:** Enable continuous, autonomous, test-driven coding loops using a single reasoning agent and two specialized executors.
**Rule:** The general-purpose Agent never writes production code.

---

## 1. Roles & Responsibilities

**General-Purpose Agent**

* **Reads:** `AGENTS.md`, `TESTING.md`, `CLAUDE.md`, and specs under `tasks/pending/`.
* **Role:** Plan, write specs, review outcomes, and delegate work.
* **Duties:**
  * Convert goals into detailed specs describing expected behavior and validation steps.
  * Ensure each spec defines observable outcomes, not implementation details.
  * Trigger `test-writer` for outcome-based failing tests, then `coding-agent` for implementation.
  * Review diffs, validation logs, and confirm alignment with spec objectives.
* **Never:** Modify source code or merge unverified work.
* **Outputs:** Task specs, review reports, and follow-up specs.

**Droid: test-writer**

* **Role:** Translate the spec’s *intended outcomes* into failing tests that verify those outcomes.
* **Objective:** Each test must assert expected behavior as defined in the spec, not arbitrary failures.
* **Outputs:**
  * Test files under the project’s designated test directory.
  * `tasks/logs/<task>_test-report.md` summarizing failing assertions that confirm missing functionality.
* **Guardrails:**
  * Do not modify or create implementation code.
  * All failures must directly represent unmet goals in the spec.

**Droid: coding-agent**

* **Role:** Implement the minimal code necessary to make the `test-writer`’s tests pass.
* **Outputs:**
  * Updated source files.
  * `tasks/logs/<task>_impl-report.md` confirming all tests pass, along with lint/type/test outputs.
* **Guardrails:**
  * Do not alter tests.
  * Limit scope to what’s needed for all outcome-based tests to succeed.

---

## 2. Workflow Overview

```
SPEC → TEST (red) → IMPLEMENT (green) → VERIFY → COMPLETE
```

### Step 1 – Spec (General-Purpose Agent)

Write `tasks/pending/<topic>.md` defining:

* Clear problem statement.
* Expected outcomes (functional behavior).
* Validation commands (e.g., `pnpm run test:ci`).
* TDD approach: what success looks like in test results.

Commit the spec:
```bash
git add tasks/pending/<topic>.md
git commit -m "spec: <topic>"
```

### Step 2 – Test (test-writer)

Generate failing tests that validate the spec’s expected outcomes:

```bash
droid exec --agent test-writer --auto medium -f tasks/pending/<topic>.md
```

Outputs:

* New test files.
* `_test-report.md` showing failing assertions that map to each required outcome.

### Step 3 – Implement (coding-agent)

Implement code that satisfies every failing test:

```bash
droid exec --agent coding-agent --auto medium -f tasks/pending/<topic>.md
```

Outputs:

* Minimal code diff to pass all tests.
* `_impl-report.md` confirming green tests.

### Step 4 – Verify (General-Purpose Agent)

Run project checks:

```bash
pnpm run test:ci && pnpm run lint && pnpm run type-check
```

Approve results and commit:

```bash
git add .
git commit -m "feat: <topic> (via droid exec)

Co-authored-by: factory-droid[bot] <123456789+factory-droid[bot]@users.noreply.github.com>"
```

### Step 5 – Complete

Archive the finished spec:

```bash
mv tasks/pending/<topic>.md tasks/completed/$(date +%Y-%m-%d)_<topic>.md
git add tasks/
git commit -m "chore: mark <topic> as completed"
```

---

## 3. Validation Rules

* Every spec defines *outcomes*, not instructions.
* Each outcome must map to at least one failing test from the test-writer.
* Implementation is complete only when all tests pass and validation commands succeed.
* Red → Green order must never be skipped.
* General-purpose agent performs final verification, not the executors.
* Logs and exit codes define progress; chat memory does not.

---

## 4. Quick Reference

| Phase     | Actor                 | Output                            | Goal                            |
| --------- | --------------------- | --------------------------------- | ------------------------------- |
| Spec      | General-purpose agent | `tasks/pending/<topic>.md`        | Define desired outcomes         |
| Test      | test-writer           | `_test-report.md` + failing tests | Capture unmet expected behavior |
| Implement | coding-agent          | `_impl-report.md` + passing code  | Fulfill expected behavior       |
| Verify    | General-purpose agent | CI + review commit                | Confirm correctness             |
| Complete  | General-purpose agent | Archived spec                     | Close task                      |

---

**Operating Model:**
One orchestrator defines outcomes.
Two executors realize them through red–green TDD.
**Result:** Predictable, autonomous development cycles driven by specs—not improvisation.
