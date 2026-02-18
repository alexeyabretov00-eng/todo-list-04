# Feature Specification: Restore Storybook Work

**Feature Branch**: `001-restore-storybook`  
**Created**: 2026-02-18  
**Status**: Draft  
**Input**: User description: "restore storybook work"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Component Stories (Priority: P1)

A developer opens Storybook and can browse all UI components in working, interactive stories that correctly render each component in its documented states (default, variants, edge cases).

**Why this priority**: The core value of Storybook is a living component explorer. Without all stories rendering correctly, developers cannot visually verify component behaviour or use stories as a reference during development.

**Independent Test**: Open Storybook in a browser, navigate to each component story, and confirm every story renders without errors and displays the component as expected.

**Acceptance Scenarios**:

1. **Given** Storybook is running, **When** a developer navigates to any component story, **Then** the component renders without errors or blank panels
2. **Given** a component with multiple exported stories (e.g., Default, WithSubItems, Completed), **When** the developer selects each variant, **Then** each variant displays the correct visual state
3. **Given** a story file that uses typed props (e.g., `SubItem[]`), **When** the story is loaded, **Then** the story compiles without TypeScript or import errors

---

### User Story 2 - Interact With Story Controls (Priority: P2)

A developer uses the Storybook controls panel to adjust component props and observe the component update in real time, enabling exploratory testing and documentation of prop combinations.

**Why this priority**: Interactive controls are a key Storybook feature for understanding component APIs. If controls do not work, stories become static screenshots rather than living documentation.

**Independent Test**: Open any component story, modify a prop in the Controls panel, and confirm the component updates without a page error.

**Acceptance Scenarios**:

1. **Given** a story is open, **When** a developer toggles a boolean prop (e.g., `completed`) in the Controls panel, **Then** the component updates to reflect the new value
2. **Given** a story with object-type args, **When** the developer changes a text field in Controls, **Then** the component re-renders with the updated text

---

### User Story 3 - Run Storybook Without Console Errors (Priority: P3)

A developer starts Storybook and sees no console errors or warnings caused by missing imports, unresolved aliases, or misconfigured build settings.

**Why this priority**: Console errors undermine confidence in story correctness and indicate configuration drift that could cause stories to fail silently.

**Independent Test**: Start Storybook from a clean state; the browser console shows zero errors caused by Storybook configuration or story files.

**Acceptance Scenarios**:

1. **Given** Storybook starts, **When** the developer opens the browser console, **Then** no red errors appear related to missing modules, unresolved path aliases, or TypeScript compilation failures
2. **Given** path aliases are used in story files, **When** Storybook builds, **Then** all aliases resolve correctly via the shared build configuration

---

### Edge Cases

- What happens when a story references a type that is declared globally with no explicit import?
- How does Storybook handle a component that reads from the Redux store without a provider decorator?
- What happens if a story file imports a component that itself has a broken dependency?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All existing story files MUST compile without TypeScript errors when Storybook builds
- **FR-002**: Every exported story MUST render the target component without a runtime error in the Storybook canvas
- **FR-003**: Story files MUST explicitly import all types they reference, rather than relying on ambient global declarations
- **FR-004**: The Storybook build configuration MUST resolve the same path aliases used in the main application build
- **FR-005**: Components that depend on a Redux store MUST be wrapped in an appropriate provider decorator at the story or global level so they render correctly in isolation
- **FR-006**: All story arg defaults MUST match the public prop interface of the component they document
- **FR-007**: The Storybook dev server MUST start successfully and serve all stories without requiring manual workarounds

### Key Entities

- **Story File**: A `.stories.tsx` file co-located with a component that exports one or more named story variants illustrating distinct component states
- **Component**: A React UI building block under `src/components/` with defined props; stories must accurately reflect its current public interface
- **Storybook Configuration**: The configuration files that control build, addons, and global decorators

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 12 existing story files load and render in Storybook without producing any canvas errors
- **SC-002**: Storybook starts in under 60 seconds on a standard development machine
- **SC-003**: Zero TypeScript compilation errors are reported during the Storybook build step
- **SC-004**: Every component with more than one documented state has at least two exported story variants
- **SC-005**: A developer unfamiliar with the codebase can identify the available props and states of any component by reading its stories and controls, without consulting source code

## Assumptions

- The existing Storybook webpack integration approach (reusing the project webpack config for path aliases and TypeScript transforms) is the intended pattern and should be preserved
- Stories are located in `src/components/<ComponentName>/__stories__/<ComponentName>.stories.tsx` — this convention is maintained for all components
- No new components are added as part of this feature; scope is limited to restoring existing story files and configuration to a working state
- Stories do not need to simulate network requests; mock data passed as args is sufficient
- The Storybook version currently in `package.json` is correct and does not need to be upgraded as part of this work
