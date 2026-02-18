# Responsive Layout Validation: Hierarchical Todo Lists

**Task**: T084
**Date**: February 18, 2026
**Branch**: `phase6-polish`
**Scope**: All views at 375px (mobile portrait), 768px (tablet), 1280px (desktop)

## Validation Criteria

For each breakpoint verify:
- No horizontal overflow (no horizontal scrollbar on `<body>`)
- Touch interaction targets ≥ 44px height (WCAG 2.5.5)
- Text remains legible (no overflow or truncation that hides meaning)
- Primary actions (add list, add todo, toggle complete) are reachable

---

## 375px – Mobile Portrait

- [ ] No horizontal overflow
- [ ] ListPanel sidebar collapses or is accessible via gesture/toggle
- [ ] TodoItemRow checkbox target ≥ 44px height
- [ ] SubItemRow checkbox target ≥ 44px height
- [ ] InlineEdit inputs do not overflow viewport
- [ ] SyncStatus badge visible and not clipped

## 768px – Tablet

- [ ] No horizontal overflow
- [ ] ListPanel sidebar visible alongside content
- [ ] TodoItemRow renders correctly at tablet width
- [ ] SubItemRow renders correctly at tablet width
- [ ] ReorderList drag handles visible and usable
- [ ] SyncStatus badge visible and not clipped

## 1280px – Desktop

- [ ] No horizontal overflow
- [ ] ListPanel sidebar width appropriate (≥ 200px, ≤ 320px)
- [ ] Content area fills remaining space
- [ ] TodoItemRow and SubItemRow render correctly
- [ ] SyncStatus badge visible in fixed footer position

---

## Result

| Breakpoint | Status | Notes |
|------------|--------|-------|
| 375px      | PENDING | Manual validation required |
| 768px      | PENDING | Manual validation required |
| 1280px     | PENDING | Manual validation required |

**Overall**: PENDING – manual validation required (run `npm run dev` and test in browser DevTools device mode)
