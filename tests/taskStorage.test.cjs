const test = require('node:test');
const assert = require('node:assert/strict');
const { STORAGE_KEY, parseTasks, serializeTasks } = require('../src/utils/taskStorage.cjs');
const { initialTasks } = require('../src/utils/taskUtils.cjs');

test('usa exemplos apenas quando não há nenhum dado salvo', () => {
  assert.equal(parseTasks(null).length, 3);
  assert.equal(STORAGE_KEY, '@taskflow:tasks:v1');
});

test('preserva array vazio salvo pelo usuário', () => {
  assert.deepEqual(parseTasks('[]'), []);
});

test('preserva atributos essenciais e a ordem', () => {
  const tasks = initialTasks();
  assert.deepEqual(parseTasks(serializeTasks(tasks)), tasks);
});

test('não aceita JSON corrompido nem estrutura incompatível', () => {
  assert.throws(() => parseTasks('{corrompido'), /interpretar/);
  assert.throws(() => parseTasks('{"id":1}'), /inválido/);
});

test('rejeita tarefas com campos inválidos, ids repetidos ou sem título', () => {
  const items = initialTasks();
  assert.throws(() => parseTasks(serializeTasks([{ ...items[0], title: '' }])), /inválidas/);
  assert.throws(() => parseTasks(serializeTasks([items[0], items[0]])), /inválidas/);
  assert.throws(() => parseTasks(serializeTasks([{ ...items[0], completed: 'false' }])), /inválidas/);
});

test('serialização exige um array', () => {
  assert.throws(() => serializeTasks({}), /array/);
});
