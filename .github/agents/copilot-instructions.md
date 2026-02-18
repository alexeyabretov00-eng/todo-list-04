# todo-list-04 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-17

## Active Technologies
- TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend + React 19.x, Redux Toolkit, styled-components, Ant Design, react-hook-form, Zod, Webpack, Jest, Storybook, better-sqlite3 (001-hierarchical-todos)
- SQLite via better-sqlite3 (embedded, single-user); DB file at `backend/data/todos.db`; migrations via custom runner in `backend/src/services/migrations/` (001-hierarchical-todos)
- TypeScript 5.x, Node.js 24 (LTS) + Storybook 10.2.10 (`@storybook/react-webpack5`), React 19.x, Webpack 5, ts-loader, typescript-plugin-styled-components (001-restore-storybook)
- N/A – no data model changes (001-restore-storybook)

- TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend + React 19.x, Redux Toolkit, styled-components, Ant Design, react-hook-form, Zod, Webpack, Jest, Storybook (001-hierarchical-todos)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend: Follow standard conventions

## Recent Changes
- 001-restore-storybook: Added TypeScript 5.x, Node.js 24 (LTS) + Storybook 10.2.10 (`@storybook/react-webpack5`), React 19.x, Webpack 5, ts-loader, typescript-plugin-styled-components
- 001-hierarchical-todos: Added TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend + React 19.x, Redux Toolkit, styled-components, Ant Design, react-hook-form, Zod, Webpack, Jest, Storybook, better-sqlite3

- 001-hierarchical-todos: Added TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend + React 19.x, Redux Toolkit, styled-components, Ant Design, react-hook-form, Zod, Webpack, Jest, Storybook

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
