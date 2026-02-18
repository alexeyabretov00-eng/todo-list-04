/**
 * T049 – Contract tests for completion updates
 * Tests PATCH /api/todos/:todoId and PATCH /api/subitems/:subItemId
 * for the `completed` field, including cascading FR-005, FR-006, FR-017, FR-022.
 */

import type { Database } from 'better-sqlite3';
import express, { Application } from 'express';
import request from 'supertest';

import { apiRouter } from '../../src/api/index';
import { errorHandler } from '../../src/api/errorHandler';
import { closeDb, getDb } from '../../src/services/db';

let app: Application;
let db: Database;
let listId: string;
let todoId: string;
let subItem1Id: string;
let subItem2Id: string;

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

beforeEach(async () => {
  db.exec(`
    DELETE FROM sub_items;
    DELETE FROM todo_items;
    DELETE FROM todo_lists;
  `);

  const listRes = await request(app).post('/api/lists').send({ name: 'Test List' });
  listId = (listRes.body as { id: string }).id;

  const todoRes = await request(app)
    .post(`/api/lists/${listId}/todos`)
    .send({ title: 'Test Todo' });
  todoId = (todoRes.body as { id: string }).id;

  const sub1Res = await request(app)
    .post(`/api/todos/${todoId}/subitems`)
    .send({ title: 'Sub 1' });
  subItem1Id = (sub1Res.body as { id: string }).id;

  const sub2Res = await request(app)
    .post(`/api/todos/${todoId}/subitems`)
    .send({ title: 'Sub 2' });
  subItem2Id = (sub2Res.body as { id: string }).id;
});

// ─── Todo completion (FR-005, FR-022) ─────────────────────────────────────────

describe('PATCH /api/todos/:todoId — completed', () => {
  it('returns 200 with completed: true when marking a todo complete', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: todoId, completed: true });
  });

  it('FR-005: cascades completion to all subitems', async () => {
    await request(app).patch(`/api/todos/${todoId}`).send({ completed: true });

    const sub1 = await request(app).get(`/api/subitems/${subItem1Id}`);
    const sub2 = await request(app).get(`/api/subitems/${subItem2Id}`);
    expect(sub1.body.completed).toBe(true);
    expect(sub2.body.completed).toBe(true);
  });

  it('FR-022: marking todo incomplete does NOT cascade to subitems', async () => {
    // Complete both subitems via the todo
    await request(app).patch(`/api/todos/${todoId}`).send({ completed: true });
    // Both subitems now complete; mark todo incomplete
    await request(app).patch(`/api/todos/${todoId}`).send({ completed: false });

    // Subitems should retain completed state
    const sub1 = await request(app).get(`/api/subitems/${subItem1Id}`);
    const sub2 = await request(app).get(`/api/subitems/${subItem2Id}`);
    expect(sub1.body.completed).toBe(true);
    expect(sub2.body.completed).toBe(true);
  });

  it('returns 404 for a non-existent todo', async () => {
    const res = await request(app)
      .patch('/api/todos/nonexistent')
      .send({ completed: true });
    expect(res.status).toBe(404);
  });
});

// ─── Subitem completion (FR-006, FR-017) ──────────────────────────────────────

describe('PATCH /api/subitems/:subItemId — completed', () => {
  it('returns 200 with completed: true when marking a subitem complete', async () => {
    const res = await request(app)
      .patch(`/api/subitems/${subItem1Id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: subItem1Id, completed: true });
  });

  it('FR-017: auto-completes parent todo when all subitems become complete', async () => {
    await request(app)
      .patch(`/api/subitems/${subItem1Id}`)
      .send({ completed: true });
    // Parent not yet complete
    const midTodo = await request(app).get(`/api/todos/${todoId}`);
    expect(midTodo.body.completed).toBe(false);

    await request(app)
      .patch(`/api/subitems/${subItem2Id}`)
      .send({ completed: true });
    // Now all subitems complete → parent auto-completes
    const doneTodo = await request(app).get(`/api/todos/${todoId}`);
    expect(doneTodo.body.completed).toBe(true);
  });

  it('FR-006: marking any subitem incomplete marks parent todo incomplete', async () => {
    // Complete both subitems (parent auto-completes)
    await request(app)
      .patch(`/api/subitems/${subItem1Id}`)
      .send({ completed: true });
    await request(app)
      .patch(`/api/subitems/${subItem2Id}`)
      .send({ completed: true });

    const completedTodo = await request(app).get(`/api/todos/${todoId}`);
    expect(completedTodo.body.completed).toBe(true);

    // Mark one subitem incomplete → parent goes back to incomplete
    await request(app)
      .patch(`/api/subitems/${subItem1Id}`)
      .send({ completed: false });

    const incompleteTodo = await request(app).get(`/api/todos/${todoId}`);
    expect(incompleteTodo.body.completed).toBe(false);
  });

  it('returns 404 for a non-existent subitem', async () => {
    const res = await request(app)
      .patch('/api/subitems/nonexistent')
      .send({ completed: true });
    expect(res.status).toBe(404);
  });
});
