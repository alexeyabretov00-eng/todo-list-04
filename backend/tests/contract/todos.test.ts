/**
 * T028 – Contract tests for todo endpoints
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
  // Create a list to use in todo tests
  const res = await request(app).post('/api/lists').send({ name: 'Test List' });
  listId = (res.body as { id: string }).id;
});

describe('GET /api/lists/:listId/todos', () => {
  it('returns 200 with empty array for new list', async () => {
    const res = await request(app).get(`/api/lists/${listId}/todos`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns todos ordered by position', async () => {
    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'First' });
    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Second' });

    const res = await request(app).get(`/api/lists/${listId}/todos`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].position).toBeLessThanOrEqual(res.body[1].position);
  });

  it('returns 404 for a non-existent list', async () => {
    const res = await request(app).get('/api/lists/nonexistent-id/todos');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lists/:listId/todos', () => {
  it('returns 201 with the created todo', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      listId,
      title: 'Buy milk',
      completed: false,
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('position');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 409 for duplicate title within list', async () => {
    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Duplicate Todo' });
    const res = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Duplicate Todo' });
    expect(res.status).toBe(409);
  });

  it('allows same title in different lists', async () => {
    const otherList = await request(app)
      .post('/api/lists')
      .send({ name: 'Other List' });
    const { id: otherId } = otherList.body as { id: string };

    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Same Title' });
    const res = await request(app)
      .post(`/api/lists/${otherId}/todos`)
      .send({ title: 'Same Title' });
    expect(res.status).toBe(201);
  });

  it('returns 422 when title is missing', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('returns 422 when title exceeds 255 characters', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'x'.repeat(256) });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/todos/:todoId', () => {
  it('returns 200 with updated todo', async () => {
    const created = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Original Title' });
    const { id: todoId } = created.body as { id: string };

    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');
  });

  it('returns 409 for duplicate title within list on rename', async () => {
    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Alpha' });
    const b = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Beta' });
    const { id: betaId } = b.body as { id: string };

    const res = await request(app)
      .patch(`/api/todos/${betaId}`)
      .send({ title: 'Alpha' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/todos/:todoId', () => {
  it('returns 204 on successful delete', async () => {
    const created = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'To Delete' });
    const { id: todoId } = created.body as { id: string };

    const res = await request(app).delete(`/api/todos/${todoId}`);
    expect(res.status).toBe(204);
  });

  it('cascades delete to subitems', async () => {
    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Parent Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'A Subitem' });

    await request(app).delete(`/api/todos/${todoId}`);

    const subitemsRes = await request(app).get(`/api/todos/${todoId}/subitems`);
    expect(subitemsRes.status).toBe(404);
  });
});

describe('POST /api/lists/:listId/todos/reorder', () => {
  it('returns 200 and reorders todos', async () => {
    const a = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo A' });
    const b = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo B' });

    const ids = [b.body.id, a.body.id] as string[];
    const res = await request(app)
      .post(`/api/lists/${listId}/todos/reorder`)
      .send({ orderedIds: ids });
    expect(res.status).toBe(200);

    const todosRes = await request(app).get(`/api/lists/${listId}/todos`);
    expect(todosRes.body[0].id).toBe(b.body.id);
    expect(todosRes.body[1].id).toBe(a.body.id);
  });
});
