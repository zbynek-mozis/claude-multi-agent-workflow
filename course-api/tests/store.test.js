const test = require('node:test');
const assert = require('node:assert');
const store = require('../db/store');

test.beforeEach(() => store.reset());

// R10: Store should not return internal references
test('R10: listUsers returns immutable copy - push does not affect store', { todo: 'R10: store returns internal references' }, async () => {
  const initialLength = store.listUsers().length;
  const list = store.listUsers();
  list.push({ id: 99, name: 'Injected', email: 'injected@example.com' });

  assert.equal(store.listUsers().length, initialLength);
});

test('R10: listUsers returns immutable copy - modification does not affect store', { todo: 'R10: store returns internal references' }, async () => {
  const list = store.listUsers();
  list[0].name = 'Modified';

  const refreshed = store.listUsers();
  assert.notEqual(refreshed[0].name, 'Modified');
});

test('R10: getUser returns immutable copy', { todo: 'R10: store returns internal references' }, async () => {
  const user = store.getUser(1);
  user.name = 'Modified';

  const refreshed = store.getUser(1);
  assert.notEqual(refreshed.name, 'Modified');
});

test('R10: createUser returns immutable copy', { todo: 'R10: store returns internal references' }, async () => {
  const user = store.createUser({ name: 'Test', email: 'test@example.com' });
  user.name = 'Modified';

  const refreshed = store.getUser(user.id);
  assert.equal(refreshed.name, 'Test');
  assert.notEqual(refreshed.name, 'Modified');
});

test('R10: updateUser returns immutable copy', { todo: 'R10: store returns internal references' }, async () => {
  const user = store.updateUser(1, { name: 'Updated' });
  user.name = 'Modified';

  const refreshed = store.getUser(1);
  assert.equal(refreshed.name, 'Updated');
  assert.notEqual(refreshed.name, 'Modified');
});
