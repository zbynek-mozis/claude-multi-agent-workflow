const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('GET /health returns 200 with status ok and uptime', async () => {
  const res = await request(app).get('/health');

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /json/);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.uptime, 'number');
  assert.ok(res.body.uptime >= 0);
});
