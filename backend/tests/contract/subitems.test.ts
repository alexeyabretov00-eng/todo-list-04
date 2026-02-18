/**
 * T029 – Contract tests for subitem endpoints
 * Validates the OpenAPI contract from specs/001-hierarchical-todos/contracts/todo-api.yaml
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
  const listRes = await request(app)
    .post('/api/lists')
    .send({ name: 'Test List' });
  listId = (listRes.body as { id: string }).id;

  const todoRes = await request(app)
    .post(`/api/lists/${listId}/todos`)
    .send({ title: 'Test Todo' });
  todoId = (todoRes.body as { id: string }).id;
});

describe('GET /api/todos/:todoId/subitems', () => {
  it('returns 200 with empty array for new todo', async () => {
    const res = await request(app).get(`/api/todos/${todoId}/subitems`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns subitems ordered by position', async () => {
    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'First Sub' });
    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Second Sub' });

    const res = await request(app).get(`/api/todos/${todoId}/subitems`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].position).toBeLessThanOrEqual(res.body[1].position);
  });

  it('returns 404 for non-existent todo', async () => {
    const res = await request(app).get('/api/todos/nonexistent/subitems');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/todos/:todoId/subitems', () => {
  it('returns 201 with the created subitem', async () => {
    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Buy bananas' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      todoId,
      title: 'Buy bananas',
      completed: false,
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('position');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 409 for duplicate title within todo', async () => {
    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Duplicate Sub' });
    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Duplicate Sub' });
    expect(res.status).toBe(409);
  });

  it('allows same title under different todos', async () => {
    const otherTodo = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Other Todo' });
    const { id: otherTodoId } = otherTodo.body as { id: string };

    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Same Sub Title' });
    const res = await request(app)
      .post(`/api/todos/${otherTodoId}/subitems`)
      .send({ title: 'Same Sub Title' });
    expect(res.status).toBe(201);
  });

  it('returns 422 when title is missing', async () => {
    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('returns 422 when title exceeds 255 characters', async () => {
    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'x'.repeat(256) });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/subitems/:subItemId', () => {
  it('returns 200 with updated subitem', async () => {
    const created = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Original Sub' });
    const { id: subItemId } = created.body as { id: string };

    const res = await request(app)
      .patch(`/api/subitems/${subItemId}`)
      .send({ title: 'Renamed Sub' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Renamed Sub');
  });

  it('returns 409 for duplicate title within todo on rename', async () => {
    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub Alpha' });
    const b = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub Beta' });
    const { id: subBetaId } = b.body as { id: string };

    const res = await request(app)
      .patch(`/api/subitems/${subBetaId}`)
      .send({ title: 'Sub Alpha' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/subitems/:subItemId', () => {
  it('returns 204 on successful delete', async () => {
    const created = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'To Delete' });
    const { id: subItemId } = created.body as { id: string };

    const res = await request(app).delete(`/api/subitems/${subItemId}`);
    expect(res.status).toBe(204);
  });
});

describe('POST /api/todos/:todoId/subitems/reorder', () => {
  it('returns 200 and reorders subitems', async () => {
    const a = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub A' });
    const b = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub B' });

    const ids = [b.body.id, a.body.id] as string[];
    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems/reorder`)
      .send({ orderedIds: ids });
    expect(res.status).toBe(200);

    const subitemsRes = await request(app).get(`/api/todos/${todoId}/subitems`);
    expect(subitemsRes.body[0].id).toBe(b.body.id);
    expect(subitemsRes.body[1].id).toBe(a.body.id);
  });
});
