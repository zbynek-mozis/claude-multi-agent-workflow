const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

// R5: POST rejects whitespace-only strings
test('R5: POST rejects whitespace-only name', { todo: 'R5: route accepts whitespace-only name' }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: '   ', email: 'test@example.com' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R5: POST rejects whitespace-only email', { todo: 'R5: route accepts whitespace-only email' }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: '   ' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

// R6: POST rejects non-string types
test('R6: POST rejects array for name', { todo: 'R6: route accepts non-string types' }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: ['a'], email: 'test@example.com' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R6: POST rejects number for name', { todo: 'R6: route accepts non-string types' }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 123, email: 'test@example.com' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R6: POST rejects object for email', { todo: 'R6: route accepts non-string types' }, async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User', email: {} });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

// R7: PUT rejects empty string
test('R7: PUT rejects empty name', { todo: 'R7: route accepts empty string' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: '' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.name, 'Ada Lovelace');
});

test('R7: PUT rejects empty email', { todo: 'R7: route accepts empty string' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: '' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.email, 'ada@example.com');
});

// R8: PUT rejects null and wrong types
test('R8: PUT rejects null name', { todo: 'R8: route accepts null' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: null });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.name, 'Ada Lovelace');
});

test('R8: PUT rejects null email', { todo: 'R8: route accepts null' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: null });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.email, 'ada@example.com');
});

test('R8: PUT rejects number for name', { todo: 'R8: route accepts wrong types' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: 123 });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.name, 'Ada Lovelace');
});

// R9: PUT rejects whitespace-only strings
test('R9: PUT rejects whitespace-only name', { todo: 'R9: route accepts whitespace-only strings' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ name: '   ' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.name, 'Ada Lovelace');
});

test('R9: PUT rejects whitespace-only email', { todo: 'R9: route accepts whitespace-only strings' }, async () => {
  const res = await request(app)
    .put('/users/1')
    .send({ email: '   ' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);

  // Verify user unchanged
  const user = await request(app).get('/users/1');
  assert.equal(user.body.email, 'ada@example.com');
});

// Passing regression tests for documented behaviour
test('POST missing name returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'test@example.com' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('POST missing email returns 400', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test User' });

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('PUT with empty body returns 400', async () => {
  const res = await request(app)
    .put('/users/1')
    .send({});

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});
