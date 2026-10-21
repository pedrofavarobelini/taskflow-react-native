/** Comparação controlada das operações anteriores e atuais. Não mede um Android. */
const { performance } = require('node:perf_hooks');
const { createTaskStore } = require('../src/utils/taskStore.cjs');
const { createTask } = require('../src/utils/taskUtils.cjs');
const { parseTasks, serializeTasks, STORAGE_KEY } = require('../src/utils/taskStorage.cjs');
const data = JSON.stringify(Array.from({ length: 1000 }, (_, i) => createTask({ title: `Tarefa ${i}` }, `bench-${i}`)));
const delayMs = 25;
const pause = () => new Promise((resolve) => setTimeout(resolve, delayMs));
function storage() { return { reads: 0, writes: 0, async getItem() { this.reads++; await pause(); return data; },
  async setItem() { this.writes++; await pause(); } }; }
async function before() {
  const device = storage(); const start = performance.now();
  // Fluxo do TasksContext recebido: lê, valida, disponibiliza e regrava a mesma lista.
  const tasks = parseTasks(await device.getItem(STORAGE_KEY));
  const readyMs = performance.now() - start;
  await device.setItem(STORAGE_KEY, JSON.stringify(tasks));
  return { readyMs, settledMs: performance.now() - start, reads: device.reads, writes: device.writes };
}
async function after() {
  const device = storage(); const store = createTaskStore(device); const start = performance.now();
  await store.hydrate();
  return { readyMs: performance.now() - start, settledMs: performance.now() - start, reads: device.reads, writes: device.writes };
}
const median = (items, field) => [...items].sort((a, b) => a[field] - b[field])[Math.floor(items.length / 2)][field];
(async () => {
  const results = { before: [], after: [] };
  for (let i = 0; i < 7; i++) { results.before.push(await before()); results.after.push(await after()); }
  const summary = Object.fromEntries(Object.entries(results).map(([name, values]) => [name, {
    readyMs: +median(values, 'readyMs').toFixed(2), storageSettledMs: +median(values, 'settledMs').toFixed(2),
    reads: values[0].reads, startupWrites: values[0].writes,
  }]));
  console.log(JSON.stringify({ environment: 'Node; armazenamento simulado, não AsyncStorage Android', node: process.version,
    tasks: 1000, injectedLatencyPerOperationMs: delayMs, runs: 7, median: summary,
    interpretation: 'A leitura continua necessária. A mudança elimina a regravação inicial; não comprova redução de tempo no Galaxy S23.' }, null, 2));
})().catch((error) => { console.error(error); process.exitCode = 1; });
