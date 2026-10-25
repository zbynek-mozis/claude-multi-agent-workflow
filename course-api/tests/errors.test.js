const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('R1: POST with malformed JSON body returns 400 JSON with error', { todo: 'R1: Express returns HTML error page for malformed JSON' }, async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{invalid json');

  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});

test('R2: Unknown route returns 404 JSON with error', { todo: 'R2: Express returns HTML 404' }, async () => {
  const res = await request(app).get('/unknown');

  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(typeof res.body.error === 'string' && res.body.error.length > 0);
});
