/** Funções puras, testáveis sem Expo nem dispositivo. */
const FILTERS = Object.freeze({ ALL: 'all', PENDING: 'pending', DONE: 'done' });
const CATEGORIES = Object.freeze(['Estudos', 'Pessoal', 'Trabalho']);
const PRIORITIES = Object.freeze(['Baixa', 'Média', 'Alta']);

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createTask(payload, id, createdAt) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Dados da tarefa inválidos.');
  if (typeof id !== 'string' || !id.trim()) throw new Error('Identificador da tarefa inválido.');
  if (createdAt !== undefined && (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt)))) throw new Error('Data da tarefa inválida.');
  const title = normalizeText(payload.title);
  if (!title) throw new Error('O título da tarefa é obrigatório.');
  if (title.length > 70) throw new Error('O título pode ter até 70 caracteres.');
  const description = normalizeText(payload.description);
  if (description.length > 500) throw new Error('A descrição pode ter até 500 caracteres.');
  return {
    id,
    title,
    description,
    category: CATEGORIES.includes(payload.category) ? payload.category : 'Pessoal',
    priority: PRIORITIES.includes(payload.priority) ? payload.priority : 'Média',
    completed: false,
    createdAt: createdAt || new Date().toISOString(),
  };
}

function getTaskStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((item) => item.completed).length;
  const pending = total - done;
  return { total, done, pending, percentage: total ? Math.round((done / total) * 100) : 0 };
}

function filterTasks(tasks, search = '', filter = FILTERS.ALL) {
  const searchable = (value) => normalizeText(value).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const text = searchable(search);
  return tasks
    .filter((item) => {
      const statusMatch =
        filter === FILTERS.DONE ? item.completed : filter === FILTERS.PENDING ? !item.completed : true;
      const haystack = searchable(`${item.title} ${item.description} ${item.category}`);
      return statusMatch && haystack.includes(text);
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt.localeCompare(a.createdAt));
}

function getCategoryStats(tasks) {
  return CATEGORIES.map((name) => {
    const group = tasks.filter((task) => task.category === name);
    return { name, ...getTaskStats(group) };
  });
}

function initialTasks() {
  const now = Date.now();
  return [
    createTask(
      { title: 'Revisar conteúdo de React Native', description: 'Estudar componentes, props e hooks.', category: 'Estudos', priority: 'Alta' },
      'exemplo-1', new Date(now - 1000).toISOString()
    ),
    createTask(
      { title: 'Organizar atividades da semana', description: 'Separar compromissos mais importantes.', category: 'Pessoal', priority: 'Média' },
      'exemplo-2', new Date(now - 2000).toISOString()
    ),
    {
      ...createTask(
        { title: 'Configurar ambiente Expo', description: 'Preparar o ambiente de desenvolvimento.', category: 'Estudos', priority: 'Baixa' },
        'exemplo-3', new Date(now - 3000).toISOString()
      ),
      completed: true,
    },
  ];
}

module.exports = {
  FILTERS, CATEGORIES, PRIORITIES, normalizeText, createTask,
  getTaskStats, filterTasks, getCategoryStats, initialTasks,
};
