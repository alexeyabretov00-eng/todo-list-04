/**
 * T061 – Contract tests for reorder operations
 * Validates POST .../reorder for lists, todos, and subitems.
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

// ─── List reorder ─────────────────────────────────────────────────────────────

describe('POST /api/lists/reorder', () => {
  it('returns 200 with { ok: true }', async () => {
    const a = await request(app).post('/api/lists').send({ name: 'List A' });
    const b = await request(app).post('/api/lists').send({ name: 'List B' });
    const { id: idA } = a.body as { id: string };
    const { id: idB } = b.body as { id: string };

    const res = await request(app)
      .post('/api/lists/reorder')
      .send({ orderedIds: [idB, idA] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('reorders lists: GET /api/lists returns new position order', async () => {
    const a = await request(app).post('/api/lists').send({ name: 'First' });
    const b = await request(app).post('/api/lists').send({ name: 'Second' });
    const c = await request(app).post('/api/lists').send({ name: 'Third' });
    const { id: idA } = a.body as { id: string };
    const { id: idB } = b.body as { id: string };
    const { id: idC } = c.body as { id: string };

    await request(app)
      .post('/api/lists/reorder')
      .send({ orderedIds: [idC, idA, idB] });

    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(200);
    expect(res.body.map((l: { id: string }) => l.id)).toEqual([idC, idA, idB]);
  });

  it('returns 422 when orderedIds is empty', async () => {
    const res = await request(app)
      .post('/api/lists/reorder')
      .send({ orderedIds: [] });
    expect(res.status).toBe(422);
  });

  it('returns 422 when orderedIds is missing', async () => {
    const res = await request(app)
      .post('/api/lists/reorder')
      .send({});
    expect(res.status).toBe(422);
  });
});

// ─── Todo reorder ─────────────────────────────────────────────────────────────

describe('POST /api/lists/:listId/todos/reorder', () => {
  it('returns 200 with { ok: true }', async () => {
    const listRes = await request(app).post('/api/lists').send({ name: 'My List' });
    const { id: listId } = listRes.body as { id: string };

    const t1 = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo 1' });
    const t2 = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo 2' });
    const { id: id1 } = t1.body as { id: string };
    const { id: id2 } = t2.body as { id: string };

    const res = await request(app)
      .post(`/api/lists/${listId}/todos/reorder`)
      .send({ orderedIds: [id2, id1] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('reorders todos: GET todos returns new position order', async () => {
    const listRes = await request(app).post('/api/lists').send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const t1 = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Alpha' });
    const t2 = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Beta' });
    const t3 = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Gamma' });
    const { id: id1 } = t1.body as { id: string };
    const { id: id2 } = t2.body as { id: string };
    const { id: id3 } = t3.body as { id: string };

    await request(app)
      .post(`/api/lists/${listId}/todos/reorder`)
      .send({ orderedIds: [id3, id1, id2] });

    const res = await request(app).get(`/api/lists/${listId}/todos`);
    expect(res.status).toBe(200);
    expect(res.body.map((t: { id: string }) => t.id)).toEqual([id3, id1, id2]);
  });

  it('returns 422 when orderedIds is empty', async () => {
    const listRes = await request(app).post('/api/lists').send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const res = await request(app)
      .post(`/api/lists/${listId}/todos/reorder`)
      .send({ orderedIds: [] });
    expect(res.status).toBe(422);
  });
});

// ─── Subitem reorder ──────────────────────────────────────────────────────────

describe('POST /api/todos/:todoId/subitems/reorder', () => {
  it('returns 200 with { ok: true }', async () => {
    const listRes = await request(app).post('/api/lists').send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    const s1 = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub 1' });
    const s2 = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub 2' });
    const { id: id1 } = s1.body as { id: string };
    const { id: id2 } = s2.body as { id: string };

    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems/reorder`)
      .send({ orderedIds: [id2, id1] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('reorders subitems: GET subitems returns new position order', async () => {
    const listRes = await request(app).post('/api/lists').send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    const s1 = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub A' });
    const s2 = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub B' });
    const s3 = await request(app)
      .post(`/api/todos/${todoId}/subitems`)
      .send({ title: 'Sub C' });
    const { id: id1 } = s1.body as { id: string };
    const { id: id2 } = s2.body as { id: string };
    const { id: id3 } = s3.body as { id: string };

    await request(app)
      .post(`/api/todos/${todoId}/subitems/reorder`)
      .send({ orderedIds: [id2, id3, id1] });

    const res = await request(app).get(`/api/todos/${todoId}/subitems`);
    expect(res.status).toBe(200);
    expect(res.body.map((s: { id: string }) => s.id)).toEqual([id2, id3, id1]);
  });

  it('returns 422 when orderedIds is empty', async () => {
    const listRes = await request(app).post('/api/lists').send({ name: 'List' });
    const { id: listId } = listRes.body as { id: string };

    const todoRes = await request(app)
      .post(`/api/lists/${listId}/todos`)
      .send({ title: 'Todo' });
    const { id: todoId } = todoRes.body as { id: string };

    const res = await request(app)
      .post(`/api/todos/${todoId}/subitems/reorder`)
      .send({ orderedIds: [] });
    expect(res.status).toBe(422);
  });
});
