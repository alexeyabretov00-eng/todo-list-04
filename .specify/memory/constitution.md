# Todo List Constitution

## Core Principles

### I. Single-User Architecture
The application is designed for a single user without authentication requirements. All functionality assumes single-user context: no user management, no access control, no multi-tenancy concerns. This simplifies architecture but MUST NOT compromise data integrity or future extensibility should multi-user support be required.

**Rationale**: Reduces complexity, eliminates authentication overhead, enables rapid development and deployment.

### II. Cross-Platform Responsive Design
The application MUST provide seamless experience across desktop and mobile devices through responsive layout. UI components MUST adapt to viewport dimensions, touch vs. mouse interactions, and varying screen densities. Progressive Web App (PWA) capabilities are mandatory for offline support and app-like experience on mobile.

**Rationale**: Single codebase serves all platforms, maximizing reach while minimizing maintenance burden.

### III. API-Driven State Management (NON-NEGOTIABLE)
All primary application data (lists, items, UI state) MUST be fetched from the REST API on load. Local persistence is FORBIDDEN except for the offline sync queue containing pending operations to retry when connectivity is restored. Redux store MUST NOT persist to localStorage. State is ephemeral; API is the single source of truth.

**Rationale**: Ensures data consistency, simplifies state management, enables server-side business logic and future multi-client support.

### IV. Test-First Quality (NON-NEGOTIABLE)
Minimum 80% code coverage is mandatory using Jest. Tests MUST be co-located with artifacts (e.g., `components/Button/__tests__/Button.test.tsx`). Storybook stories MUST be co-located similarly (`components/Button/__stories__/Button.stories.tsx`). Test-driven development approach preferred: Write failing tests, implement to pass, refactor.

**Rationale**: High test coverage ensures reliability, co-location improves discoverability and maintenance, TDD prevents regressions.

### V. Component Isolation & Type Safety
React components MUST be "stupid" (presentational), with containers handling data and business logic. Each component/container resides in its own folder with TypeScript naming conventions: UpperCamelCase (PascalCase) for components/containers, lowerCamelCase for variables/functions. Styled-components styling in separate `.styled.ts` files. Zod schemas enforce runtime validation; react-hook-form manages form state. TypeScript strict mode is mandatory.

**Rationale**: Clear separation of concerns, predictable structure, type safety prevents runtime errors, validation schemas document and enforce contracts.

## Technical Stack Requirements

### Frontend Stack
- **Framework**: React 19.x (SPA), TypeScript (strict mode), PWA-enabled
- **Build**: Webpack with ts-loader for ts/tsx, typescript-plugin-styled-components, NOT USE babel, NOT USE css-loader, style-loader, because we use styled-components
- **State Management**: Redux Toolkit (no persistence to localStorage), NO USE RTK Query
- **Styling**: styled-components, Ant Design component library, write own components only its not exists in Ant Design component library
- **Forms & Validation**: react-hook-form, Zod schemas
- **API Client**: fetch API (no CORS, same domain, dev proxy configured)
- **Testing**: Jest (≥80% coverage), USE ts-jest, Storybook for component documentation
- **Linting/Formatting**: ESLint, Prettier, eslint-plugin-simple-import-sort, commitlint
- **Packages**: NPM, All npm packages MUST HAVE latest versions, Do not use prefixes in package's versions
- **Module Resolution**: Path aliases configured in tsconfig.json and bundler:
  - `@components` → `./src/components`
  - `@hooks` → `./src/hooks`
  - `@utils` → `./src/utils`
  - `@api` → `./src/api`
  - `@styles` → `./src/styles`
  - `@assets` → `./src/assets`
  - `@services` → `./src/services`
  - `@types` → `./src/types`
  - Prefer relative paths for local imports within the same folder
  - Do NOT use trailing `/*` in aliases

### Backend Stack
- **Runtime**: Node.js (latest LTS)
- **Database**: Any suitable database (to be determined based on scale requirements)
- **Naming**: camelCase for all JavaScript/TypeScript backend code
- **API**: RESTful endpoints serving frontend, CORS configured for same domain

### Configuration Management
Environment-specific settings MUST be managed via `.env` files. Example: `API_PATH`, `DATABASE_URL`. Sensitive configuration MUST NOT be committed to version control.

## Development Standards

### Code Organization
- **Frontend Components**: `components/[ComponentName]/[ComponentName].tsx` + `[ComponentName].styled.ts`
- **Frontend Containers**: `containers/[ContainerName]Container/[ContainerName]Container.tsx`
- **Tests**: `[artifact]/__tests__/[artifact].test.tsx` (co-located)
- **Stories**: `[artifact]/__stories__/[artifact].stories.tsx` (co-located)
- **No Routing**: Single-page application without routing library

### Naming Conventions
- **Frontend Components**: UpperCamelCase (PascalCase), e.g., `TodoList`, `EmptyState`
- **Frontend Containers**: UpperCamelCase (PascalCase) with MANDATORY "Container" suffix, e.g., `AppContainer`, `CreateListFormContainer`, `TodoListsViewContainer`
  - **Rationale**: Container suffix distinguishes data/logic containers from presentational components, aligning with Redux/React architecture patterns
  - Folder names MUST end with "Container": `containers/AppContainer/`
  - File names MUST end with "Container": `AppContainer.tsx`, `AppContainer.styled.tsx`
  - Exports MUST use "Container" suffix: `export const AppContainer: React.FC = () => {}`
- **Container Selectors**: MUST follow pattern `get + ContainerName + Props`, e.g., `getAppContainerProps`, `getTodoListsViewContainerProps`, `getCreateListFormContainerProps`
  - **Rationale**: Consistent naming makes it clear which selector provides props for which container, improving code discoverability and maintainability
  - File location: `selectors/containers.ts`
  - Export pattern: `export const getAppContainerProps = createSelector(...)`
  - **Redux State First**: If data exists in Redux store, use selectors instead of passing as props
    - Correct: Store `selectedListId` in state, read with `selectSelectedListId`
    - Wrong: Pass `listId` through component props when it's already in store
  - **Parametrized Selectors**: Only for cases where data is NOT in store (e.g., component-specific filters)
    - Pattern: `createSelector([selectItems, (state, id) => id], (items, id) => ...)`
    - Usage: `useAppSelector((state) => getSelector(state, param))`
- **Variables/Functions**: lowerCamelCase, e.g., `handleSubmit`, `todoItems`
- **Files**: Match component/container name exactly, styled files include `.styled.` in name

### Import/Export Conventions
- **Named Imports/Exports**: MUST use named imports and exports exclusively. Wildcard imports (`import * as`) and wildcard exports (`export * from`) are FORBIDDEN.
- **Rationale**: Named imports/exports provide explicit dependencies, improve tree-shaking, enable better IDE autocompletion, and make refactoring safer by catching breaking changes at compile time.

### Data Persistence Rules
- **Primary Data**: MUST be fetched from API, MUST NOT persist to localStorage
- **Offline Queue**: ONLY persistent data allowed is the sync queue for pending operations
- **Redux State**: NO persistence; ephemeral session state only

### Dependency Management
- MUST use latest stable versions of all packages at time of installation
- Update dependencies regularly to incorporate security patches and features

## Governance

This constitution supersedes all other development practices and guidelines. All features, pull requests, and architectural decisions MUST be validated against these principles before approval.

**Amendment Process**:
- Proposed changes documented with rationale and impact analysis
- Version incremented per semantic versioning (MAJOR for breaking governance changes, MINOR for additions, PATCH for clarifications)
- Migration plan required for constitution changes affecting existing code

**Compliance**:
- All pull requests MUST verify alignment with constitution principles
- Deviations require explicit justification and approval
- Constitution Check in plan-template.md enforces validation gates

**Versioning Policy**:
- MAJOR: Backward-incompatible principle removals or redefinitions
- MINOR: New principles added or material guidance expansions
- PATCH: Clarifications, wording fixes, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
