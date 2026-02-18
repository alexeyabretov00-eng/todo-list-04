/**
 * T027 – Contract tests for list endpoints
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

beforeAll(() => {
  // Use in-memory DB for tests
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

describe('GET /api/lists', () => {
  it('returns 200 with an empty array when no lists exist', async () => {
    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns lists ordered by position', async () => {
    await request(app).post('/api/lists').send({ name: 'B List' });
    await request(app).post('/api/lists').send({ name: 'A List' });

    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // Each item has the required fields
    for (const item of res.body) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('position');
      expect(item).toHaveProperty('createdAt');
      expect(item).toHaveProperty('updatedAt');
    }
    // Ordered by position ascending
    expect(res.body[0].position).toBeLessThanOrEqual(res.body[1].position);
  });
});

describe('POST /api/lists', () => {
  it('returns 201 with the created list', async () => {
    const res = await request(app).post('/api/lists').send({ name: 'My List' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'My List',
      position: expect.any(Number),
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 409 for duplicate list name', async () => {
    await request(app).post('/api/lists').send({ name: 'Duplicate' });
    const res = await request(app).post('/api/lists').send({ name: 'Duplicate' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 422 when name is missing', async () => {
    const res = await request(app).post('/api/lists').send({});
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 422 when name exceeds 255 characters', async () => {
    const res = await request(app)
      .post('/api/lists')
      .send({ name: 'x'.repeat(256) });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/lists/:listId', () => {
  it('returns 200 with updated list', async () => {
    const created = await request(app)
      .post('/api/lists')
      .send({ name: 'Original' });
    const { id } = created.body as { id: string };

    const res = await request(app)
      .patch(`/api/lists/${id}`)
      .send({ name: 'Renamed' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renamed');
  });

  it('returns 409 for duplicate name on rename', async () => {
    const a = await request(app).post('/api/lists').send({ name: 'Alpha' });
    await request(app).post('/api/lists').send({ name: 'Beta' });
    const { id } = a.body as { id: string };

    const res = await request(app)
      .patch(`/api/lists/${id}`)
      .send({ name: 'Beta' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/lists/:listId', () => {
  it('returns 204 on successful delete', async () => {
    const created = await request(app)
      .post('/api/lists')
      .send({ name: 'To Delete' });
    const { id } = created.body as { id: string };

    const res = await request(app).delete(`/api/lists/${id}`);
    expect(res.status).toBe(204);
  });

  it('cascades delete to todos', async () => {
    const listRes = await request(app)
      .post('/api/lists')
      .send({ name: 'Parent List' });
    const { id: listId } = listRes.body as { id: string };

    await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'A Todo' });

    await request(app).delete(`/api/lists/${listId}`);

    const todosRes = await request(app).get(`/api/lists/${listId}/todos`);
    expect(todosRes.status).toBe(404);
  });
});

describe('POST /api/lists/reorder', () => {
  it('returns 200 with reordered lists', async () => {
    const a = await request(app).post('/api/lists').send({ name: 'List A' });
    const b = await request(app).post('/api/lists').send({ name: 'List B' });
    const ids = [b.body.id, a.body.id] as string[];

    const res = await request(app)
      .post('/api/lists/reorder')
      .send({ orderedIds: ids });
    expect(res.status).toBe(200);

    const listsRes = await request(app).get('/api/lists');
    expect(listsRes.body[0].id).toBe(b.body.id);
    expect(listsRes.body[1].id).toBe(a.body.id);
  });
});
