const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createTask, filterTasks, getTaskStats, getCategoryStats, initialTasks,
  FILTERS, CATEGORIES,
} = require('../src/utils/taskUtils.cjs');

const base = { title: '  Revisar React Native  ', description: ' Estudar hooks ', category: 'Estudos', priority: 'Alta' };

test('cria tarefa validada e normaliza espaços', () => {
  const task = createTask(base, 'abc', '2026-10-19T00:00:00.000Z');
  assert.equal(task.id, 'abc');
  assert.equal(task.title, 'Revisar React Native');
  assert.equal(task.description, 'Estudar hooks');
  assert.equal(task.completed, false);
});

test('rejeita título vazio e demasiado longo', () => {
  assert.throws(() => createTask({ title: '   ' }, '1'), /obrigatório/);
  assert.throws(() => createTask({ title: 'a'.repeat(71) }, '1'), /70/);
});

test('rejeita descrição demasiado longa', () => {
  assert.throws(() => createTask({ title: 'Valida', description: 'a'.repeat(501) }, '1'), /500/);
});

test('categorias e prioridades inválidas têm valores seguros', () => {
  const task = createTask({ title: 'Teste', category: 'Outro', priority: 'Urgentíssima' }, '1');
  assert.equal(task.category, 'Pessoal');
  assert.equal(task.priority, 'Média');
});

test('filtra por texto ignorando maiúsculas e acentos consistentes', () => {
  const tasks = initialTasks();
  assert.equal(filterTasks(tasks, 'REACT').length, 1);
  assert.equal(filterTasks(tasks, 'estudos').length, 2);
});

test('filtra pendentes e concluídas', () => {
  const tasks = initialTasks();
  assert.equal(filterTasks(tasks, '', FILTERS.PENDING).length, 2);
  assert.equal(filterTasks(tasks, '', FILTERS.DONE).length, 1);
});

test('mantém pendentes à frente das concluídas', () => {
  const tasks = filterTasks(initialTasks());
  assert.equal(tasks[0].completed, false);
  assert.equal(tasks[tasks.length - 1].completed, true);
});

test('calcula estatísticas com conjunto normal e conjunto vazio', () => {
  assert.deepEqual(getTaskStats(initialTasks()), { total: 3, done: 1, pending: 2, percentage: 33 });
  assert.deepEqual(getTaskStats([]), { total: 0, done: 0, pending: 0, percentage: 0 });
});

test('gera estatísticas para cada categoria', () => {
  const result = getCategoryStats(initialTasks());
  assert.deepEqual(result.map((item) => item.name), CATEGORIES);
  assert.equal(result.find((item) => item.name === 'Estudos').total, 2);
  assert.equal(result.find((item) => item.name === 'Trabalho').total, 0);
});

test('rejeita payload, identificador e data inválidos', () => {
  for (const value of [null, undefined, [], 1]) assert.throws(() => createTask(value, 'id'), /inválidos/);
  assert.throws(() => createTask(base, ''), /Identificador/);
  assert.throws(() => createTask(base, 'id', 'data inválida'), /Data/);
});

test('pesquisa sem acentos combina com status sem modificar a lista original', () => {
  const tasks = initialTasks(); const order = tasks.map((task) => task.id);
  assert.equal(filterTasks(tasks, 'conteudo', FILTERS.PENDING).length, 1);
  assert.equal(filterTasks(tasks, 'conteudo', FILTERS.DONE).length, 0);
  assert.deepEqual(tasks.map((task) => task.id), order);
});
