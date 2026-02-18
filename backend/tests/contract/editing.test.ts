/**
 * T060 – Contract tests for rename/delete operations
 * Validates PATCH (rename) and DELETE for lists, todos, and subitems.
 * Asserts DELETE completes without a confirmation step (single request → 200/204) — FR-018.
 */

import type { Database } from 'better-sqlite3';
import express, { Application } from 'express';
import request from 'supertest';

import { apiRouter } from '../../src/api/index';
import { errorHandler } from '../../src/api/errorHandler';
import { closeDb, getDb } from '../../src/services/db';

let app: Application;
let db: Database;

beforeAll(() => {
  process.env['DB_PATH'] = ':memory:';
  db = getDb();
  app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandler);
});

afterAll(() => {
  closeDb();
  delete process.env['DB_PATH'];
});

beforeEach(() => {
  db.exec(`
    DELETE FROM sub_items;
    DELETE FROM todo_items;
    DELETE FROM todo_lists;
  `);
});

// ─── List rename/delete ───────────────────────────────────────────────────────

describe('PATCH /api/lists/:listId - rename', () => {
  it('returns 200 with updated name', async () => {
    const created = await request(app)
      .post('/api/lists')
      .send({ name: 'Original List' });
    const { id } = created.body as { id: string };

    const res = await request(app)
      .patch(`/api/lists/${id}`)
      .send({ name: 'Renamed List' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renamed List');
    expect(res.body.id).toBe(id);
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 404 for non-existent list', async () => {
    const res = await request(app)
      .patch('/api/lists/does-not-exist')
      .send({ name: 'New Name' });
    expect(res.status).toBe(404);
  });

  it('returns 409 when renaming to an already-used name', async () => {
    await request(app).post('/api/lists').send({ name: 'List A' });
    const b = await request(app).post('/api/lists').send({ name: 'List B' });
    const { id } = b.body as { id: string };

    const res = await request(app)
      .patch(`/api/lists/${id}`)
      .send({ name: 'List A' });
    expect(res.status).toBe(409);
  });

  it('returns 422 when name exceeds 255 characters', async () => {
    const created = await request(app)
      .post('/api/lists')
      .send({ name: 'Short Name' });
    const { id } = created.body as { id: string };

    const res = await request(app)
      .patch(`/api/lists/${id}`)
      .send({ name: 'x'.repeat(256) });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/lists/:listId - no confirmation step (FR-018)', () => {
  it('returns 204 on a single DELETE request — no intermediate confirm endpoint required', async () => {
    const created = await request(app)
      .post('/api/lists')
      .send({ name: 'To Delete' });
    const { id } = created.body as { id: string };

    const res = await request(app).delete(`/api/lists/${id}`);
    expect(res.status).toBe(204);
  });

  it('cascades delete to todos and subitems', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'Parent List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Child Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Grandchild Subitem' });

    await request(app).delete(`/api/lists/${listId}`);

    // List is gone
    const listCheck = await request(app).get(`/api/lists/${listId}`);
    expect(listCheck.status).toBe(404);

    // Todos for deleted list return 404 (list not found)
    const todosCheck = await request(app).get(`/api/lists/${listId}/todos`);
    expect(todosCheck.status).toBe(404);
  });

  it('returns 404 for non-existent list', async () => {
    const res = await request(app).delete('/api/lists/does-not-exist');
    expect(res.status).toBe(404);
  });
});

// ─── Todo rename/delete ───────────────────────────────────────────────────────

describe('PATCH /api/todos/:todoId - rename', () => {
  it('returns 200 with updated title', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'My List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Original Title' });
    const { id: todoId } = todoRes.body as { id: string };

    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .send({ title: 'Renamed Title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Renamed Title');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 404 for non-existent todo', async () => {
    const res = await request(app)
      .patch('/api/todos/does-not-exist')
      .send({ title: 'New Title' });
    expect(res.status).toBe(404);
  });

  it('returns 409 for duplicate title within same list', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'List With Todos' });
    const { id: listId } = listRes.body as { id: string };

    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo A' });
    const b = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo B' });
    const { id: todoId } = b.body as { id: string };

    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .send({ title: 'Todo A' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/todos/:todoId - no confirmation step (FR-018)', () => {
  it('returns 204 on a single DELETE request — no intermediate confirm endpoint required', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'Test List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo to Delete' });
    const { id: todoId } = todoRes.body as { id: string };

    const res = await request(app).delete(`/api/todos/${todoId}`);
    expect(res.status).toBe(204);
  });

  it('cascades delete to subitems', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Parent Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Child Subitem' });

    await request(app).delete(`/api/todos/${todoId}`);

    const subitemsCheck = await request(app).get(`/api/todos/${todoId}/subitems`);
    expect(subitemsCheck.status).toBe(404);
  });

  it('returns 404 for non-existent todo', async () => {
    const res = await request(app).delete('/api/todos/does-not-exist');
    expect(res.status).toBe(404);
  });
});

// ─── Subitem rename/delete ────────────────────────────────────────────────────

describe('PATCH /api/subitems/:subItemId - rename', () => {
  it('returns 200 with updated title', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'My List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'My Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    const subRes = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Original Sub' });
    const { id: subItemId } = subRes.body as { id: string };

    const res = await request(app)
      .patch(`/api/subitems/${subItemId}`)
      .send({ title: 'Renamed Sub' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Renamed Sub');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 404 for non-existent subitem', async () => {
    const res = await request(app)
      .patch('/api/subitems/does-not-exist')
      .send({ title: 'New Title' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/subitems/:subItemId - no confirmation step (FR-018)', () => {
  it('returns 204 on a single DELETE request — no intermediate confirm endpoint required', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    const subRes = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Subitem to Delete' });
    const { id: subItemId } = subRes.body as { id: string };

    const res = await request(app).delete(`/api/subitems/${subItemId}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent subitem', async () => {
    const res = await request(app).delete('/api/subitems/does-not-exist');
    expect(res.status).toBe(404);
  });
});
