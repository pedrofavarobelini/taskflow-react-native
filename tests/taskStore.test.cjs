const test = require('node:test');
const assert = require('node:assert/strict');
const { createTaskStore } = require('../src/utils/taskStore.cjs');
const { initialTasks, getTaskStats, filterTasks, FILTERS } = require('../src/utils/taskUtils.cjs');
const { STORAGE_KEY } = require('../src/utils/taskStorage.cjs');

function memoryStorage(raw = null) {
  return { raw, reads: 0, writes: [], async getItem(key) {
    assert.equal(key, STORAGE_KEY); this.reads++; return this.raw;
  }, async setItem(key, value) { assert.equal(key, STORAGE_KEY); this.writes.push(value); this.raw = value; } };
}
function deferred() { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; }
const payload = { title: 'Entregar trabalho', category: 'Estudos', priority: 'Alta' };

test('hidratação deduplicada lê uma vez e não regrava dados no início', async () => {
  const storage = memoryStorage(JSON.stringify(initialTasks()));
  const store = createTaskStore(storage);
  assert.equal(store.getSnapshot().isLoading, true);
  await Promise.all([store.hydrate(), store.hydrate()]);
  assert.equal(storage.reads, 1);
  assert.equal(storage.writes.length, 0);
  assert.equal(store.getSnapshot().isHydrated, true);
  await store.hydrate();
  assert.equal(storage.reads, 1);
});

test('bloqueia todas as operações antes e durante uma leitura lenta', async () => {
  const gate = deferred();
  const storage = memoryStorage(); storage.getItem = () => gate.promise;
  const store = createTaskStore(storage);
  const load = store.hydrate();
  for (const op of [() => store.addTask(payload), () => store.updateTask('x', payload), () => store.toggleTask('x'), () => store.deleteTask('x')]) {
    await assert.rejects(op, /carregamento/);
  }
  assert.equal(storage.writes.length, 0);
  gate.resolve('[]'); await load;
  assert.deepEqual(store.getSnapshot().tasks, []);
});

test('cadastro, edição, conclusão, pesquisa e estatísticas refletem o estado persistido', async () => {
  const storage = memoryStorage('[]'); const store = createTaskStore(storage); await store.hydrate();
  const id = await store.addTask(payload);
  const createdAt = store.getSnapshot().tasks[0].createdAt;
  await store.toggleTask(id);
  await store.updateTask(id, { ...payload, title: 'Trabalho concluído' });
  const task = store.getSnapshot().tasks[0];
  assert.equal(task.title, 'Trabalho concluído'); assert.equal(task.completed, true);
  assert.equal(task.createdAt, createdAt); assert.equal(task.id, id);
  assert.equal(filterTasks(store.getSnapshot().tasks, 'CONCLUIDO', FILTERS.DONE).length, 1);
  assert.deepEqual(getTaskStats(store.getSnapshot().tasks), { total: 1, done: 1, pending: 0, percentage: 100 });
  assert.deepEqual(JSON.parse(storage.raw), store.getSnapshot().tasks);
});

test('exclusão da última tarefa persiste lista vazia depois de reabrir', async () => {
  const storage = memoryStorage('[]'); const first = createTaskStore(storage); await first.hydrate();
  const id = await first.addTask(payload); await first.deleteTask(id);
  const reopened = createTaskStore(storage); await reopened.hydrate();
  assert.deepEqual(reopened.getSnapshot().tasks, []); assert.equal(storage.raw, '[]');
});

test('operações concorrentes são serializadas sem perder alterações nem inverter escritas', async () => {
  const storage = memoryStorage('[]'); let active = 0; let max = 0;
  storage.setItem = async function (_, raw) { active++; max = Math.max(max, active);
    await new Promise((resolve) => setTimeout(resolve, 2)); this.raw = raw; this.writes.push(raw); active--; };
  const store = createTaskStore(storage); await store.hydrate();
  const ids = await Promise.all(Array.from({ length: 12 }, (_, i) => store.addTask({ title: `Tarefa ${i}` })));
  assert.equal(new Set(ids).size, 12); assert.equal(max, 1);
  assert.equal(store.getSnapshot().tasks.length, 12);
  assert.deepEqual(JSON.parse(storage.raw), store.getSnapshot().tasks);
  assert.equal(store.getSnapshot().isSaving, false);
});

test('sucesso e estado alterado só são publicados após confirmação de gravação', async () => {
  const storage = memoryStorage('[]'); const gate = deferred(); storage.setItem = () => gate.promise;
  const store = createTaskStore(storage); await store.hydrate();
  const operation = store.addTask(payload);
  assert.equal(store.getSnapshot().isSaving, true); assert.equal(store.getSnapshot().tasks.length, 0);
  gate.resolve(); await operation;
  assert.equal(store.getSnapshot().tasks.length, 1); assert.equal(store.getSnapshot().isSaving, false);
});

test('falha de gravação conserva estado anterior e permite nova tentativa', async () => {
  const storage = memoryStorage('[]'); const store = createTaskStore(storage); await store.hydrate();
  const save = storage.setItem; storage.setItem = async () => { throw new Error('disco cheio'); };
  await assert.rejects(() => store.addTask(payload), /não foi aplicada/);
  assert.deepEqual(store.getSnapshot().tasks, []); assert.equal(storage.raw, '[]');
  assert.equal(store.getSnapshot().isSaving, false); assert.match(store.getSnapshot().storageError, /salvar/);
  storage.setItem = save; await store.addTask(payload);
  assert.equal(store.getSnapshot().tasks.length, 1); assert.equal(store.getSnapshot().storageError, '');
});

test('falha em uma operação não interrompe operações já enfileiradas', async () => {
  const storage = memoryStorage('[]'); const save = storage.setItem; let fail = true;
  storage.setItem = async function (...args) { if (fail) { fail = false; throw new Error('temporário'); } return save.apply(this, args); };
  const store = createTaskStore(storage); await store.hydrate();
  const result = await Promise.allSettled([store.addTask({ title: 'Falha' }), store.addTask({ title: 'Sucesso' })]);
  assert.equal(result[0].status, 'rejected'); assert.equal(result[1].status, 'fulfilled');
  assert.equal(store.getSnapshot().tasks[0].title, 'Sucesso');
});

for (const raw of ['{invalido', '{}', JSON.stringify([{ ...initialTasks()[0], completed: 'false' }])]) {
  test(`dados inválidos não são substituídos por exemplos: ${raw.slice(0, 25)}`, async () => {
    const storage = memoryStorage(raw); const store = createTaskStore(storage); await store.hydrate();
    assert.equal(store.getSnapshot().loadError, true); assert.equal(store.getSnapshot().isHydrated, false);
    assert.deepEqual(store.getSnapshot().tasks, []); assert.equal(storage.raw, raw);
    await assert.rejects(() => store.addTask(payload), /carregamento/); assert.equal(storage.writes.length, 0);
  });
}

test('erro de leitura permite recuperação sem sobrescrever tarefas', async () => {
  const storage = memoryStorage(JSON.stringify(initialTasks())); const read = storage.getItem;
  storage.getItem = async () => { throw new Error('indisponível'); };
  const store = createTaskStore(storage); await store.hydrate();
  assert.equal(store.getSnapshot().loadError, true);
  storage.getItem = read; await store.hydrate();
  assert.equal(store.getSnapshot().tasks.length, 3); assert.equal(store.getSnapshot().storageError, '');
  assert.equal(storage.writes.length, 0);
});

test('timeout permite tentar novamente e descarta a resposta antiga', async () => {
  const storage = memoryStorage('[]'); const gate = deferred(); let calls = 0;
  storage.getItem = () => ++calls === 1 ? gate.promise : Promise.resolve('[]');
  const store = createTaskStore(storage, { timeoutMs: 15 }); await store.hydrate();
  assert.equal(store.getSnapshot().loadError, true); await store.hydrate();
  gate.resolve(JSON.stringify(initialTasks())); await new Promise((resolve) => setTimeout(resolve, 1));
  assert.deepEqual(store.getSnapshot().tasks, []); assert.equal(store.getSnapshot().isHydrated, true);
});

test('id inexistente nunca gera sucesso, escrita ou exclusão de outra tarefa', async () => {
  const storage = memoryStorage(JSON.stringify(initialTasks())); const store = createTaskStore(storage); await store.hydrate();
  for (const op of [() => store.updateTask('missing', payload), () => store.toggleTask('missing'), () => store.deleteTask('missing')]) await assert.rejects(op, /não existe/);
  assert.equal(storage.writes.length, 0); assert.equal(store.getSnapshot().tasks.length, 3);
});

test('medições distinguem leitura de validação; inscrição pode ser removida', async () => {
  const storage = memoryStorage('[]'); const ticks = [0, 12, 15];
  const store = createTaskStore(storage, { now: () => ticks.shift() }); let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++); await store.hydrate(); unsubscribe();
  assert.deepEqual(store.getSnapshot().metrics, { readMs: 12, parseMs: 3, hydrationMs: 15, count: 0 });
  const before = notifications; await store.addTask(payload); assert.equal(notifications, before);
});
