# Usability Validation: Hierarchical Todo Lists

**Tasks**: T095, T096
**Date**: February 18, 2026
**Branch**: `phase6-polish`

---

## SC-001: Timed Core Flow (T095)

**Scenario**: Time a new user completing: create list → add todo → add subitem

**Pass criterion**: Core flow completes in under 2 minutes on first attempt

**Protocol**:
1. Start a timer.
2. Open the app at [http://localhost:3000](http://localhost:3000) with a fresh database.
3. Create a list named "Home".
4. Select "Home" and add a todo titled "Buy groceries".
5. Add a subitem titled "Milk" under "Buy groceries".
6. Stop the timer.

**Result**:

| Participant | Elapsed Time | Pass/Fail | Notes |
|-------------|-------------|-----------|-------|
| (tester 1)  | PENDING     | PENDING   |       |

**Overall**: PENDING – manual validation required

---

## SC-002: First-Attempt Usability Test (T096)

**Scenario**: Conduct usability test with at least one participant completing the core flow without prompting

**Core flow**: Create list → add todo → add subitem → mark complete

**Pass criterion**: Participant completes flow without assistance on first attempt

**Protocol**:
1. Recruit at least one participant unfamiliar with the app.
2. Ask them to: "Create a list, add a task, add a subtask, and mark the task complete."
3. Observe without prompting. Note any confusion points.
4. Record result below.

**Result**:

| Participant | Completed Without Help | Notes |
|-------------|----------------------|-------|
| (tester 1)  | PENDING              |       |

**Confusion points observed**: PENDING

**Overall**: PENDING – manual validation required with external participant
