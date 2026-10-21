/** Camada de dados independente do React Native, testável pelo Node.js. */
const { initialTasks, CATEGORIES, PRIORITIES } = require('./taskUtils.cjs');

const STORAGE_KEY = '@taskflow:tasks:v1';

function parseTasks(raw) {
  if (raw == null) return initialTasks();
  let items;
  try {
    items = JSON.parse(raw);
  } catch (error) {
    throw new Error('Não foi possível interpretar as tarefas armazenadas.');
  }
  if (!Array.isArray(items)) throw new Error('Formato de armazenamento inválido.');
  const ids = new Set();
  for (const task of items) {
    if (!task || typeof task !== 'object' ||
        typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
        typeof task.title !== 'string' || !task.title.trim() || task.title.length > 70 ||
        typeof task.description !== 'string' || task.description.length > 500 ||
        typeof task.completed !== 'boolean' ||
        typeof task.createdAt !== 'string' || Number.isNaN(Date.parse(task.createdAt)) ||
        !CATEGORIES.includes(task.category) || !PRIORITIES.includes(task.priority)) {
      throw new Error('As tarefas salvas contêm informações inválidas.');
    }
    ids.add(task.id);
  }
  return items;
}

function serializeTasks(tasks) {
  if (!Array.isArray(tasks)) throw new TypeError('A lista de tarefas deve ser um array.');
  const serialized = JSON.stringify(tasks);
  parseTasks(serialized);
  return serialized;
}

module.exports = { STORAGE_KEY, parseTasks, serializeTasks };
