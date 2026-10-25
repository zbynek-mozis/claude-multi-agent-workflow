const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

// R3/R4: Non-canonical ID formats should return 404
test('R3: GET /users/:id rejects hex format (0x1)', { todo: 'R3: route accepts non-canonical id 0x1' }, async () => {
  const res = await request(app).get('/users/0x1');

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R3: GET /users/:id rejects decimal format (1.0)', { todo: 'R3: route accepts non-canonical id 1.0' }, async () => {
  const res = await request(app).get('/users/1.0');

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R4: PUT /users/:id rejects hex format (0x1)', { todo: 'R4: route accepts non-canonical id 0x1' }, async () => {
  const res = await request(app)
    .put('/users/0x1')
    .send({ name: 'Test' });

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R4: PUT /users/:id rejects decimal format (1.0)', { todo: 'R4: route accepts non-canonical id 1.0' }, async () => {
  const res = await request(app)
    .put('/users/1.0')
    .send({ name: 'Test' });

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

// Passing tests: invalid IDs returning 404 is correct behaviour
test('GET /users/:id returns 404 for non-numeric id', async () => {
  const res = await request(app).get('/users/abc');

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('GET /users/:id returns 404 for id 0', async () => {
  const res = await request(app).get('/users/0');

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('GET /users/:id returns 404 for negative id', async () => {
  const res = await request(app).get('/users/-1');

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('PUT /users/:id returns 404 for non-numeric id', async () => {
  const res = await request(app)
    .put('/users/abc')
    .send({ name: 'Test' });

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('PUT /users/:id returns 404 for id 0', async () => {
  const res = await request(app)
    .put('/users/0')
    .send({ name: 'Test' });

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('PUT /users/:id returns 404 for negative id', async () => {
  const res = await request(app)
    .put('/users/-1')
    .send({ name: 'Test' });

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});
