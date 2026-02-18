# Quickstart: Hierarchical Todo Lists

## Prerequisites

- Node.js (latest LTS)
- npm (bundled with Node.js)

## Environment

Create `.env` files for backend and frontend as needed.

Backend example:

```
API_PATH=/api
DATABASE_URL=sqlite:./data/todos.db
```

Frontend example:

```
API_PATH=/api
```

## Install

```
npm install
```

## Run (local)

Backend (port example 4000):

```
npm run dev:backend
```

Frontend (port example 3000):

```
npm run dev:frontend
```

## Test

```
npm test
```

## Storybook

```
npm run storybook
```

## Notes

- The API is the source of truth; local persistence is limited to the offline queue.
- Offline edits are queued and synced when connectivity returns.
