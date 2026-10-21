/** Estado e persistência usados pelo app e pelos testes, sem dependência do React. */
const { createTask } = require('./taskUtils.cjs');
const { STORAGE_KEY, parseTasks, serializeTasks } = require('./taskStorage.cjs');

function createTaskStore(storage, { now = () => globalThis.performance?.now?.() ?? Date.now(), timeoutMs = 10000 } = {}) {
  let state = { tasks: [], isLoading: true, isHydrated: false, isSaving: false,
    storageError: '', loadError: false, metrics: null };
  const listeners = new Set();
  let hydration;
  let queue = Promise.resolve();
  let pendingWrites = 0;
  let sequence = 0;
  const publish = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  function hydrate() {
    if (state.isHydrated) return Promise.resolve(state);
    if (hydration) return hydration;
    publish({ isLoading: true, storageError: '', loadError: false });
    const start = now();
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Tempo de leitura excedido.')), timeoutMs);
    });
    hydration = (async () => {
      try {
        // Uma resposta após o timeout nunca altera o estado nem escreve sobre dados antigos.
        const raw = await Promise.race([Promise.resolve().then(() => storage.getItem(STORAGE_KEY)), timeout]);
        const readEnd = now();
        const tasks = parseTasks(raw);
        const end = now();
        publish({ tasks, isHydrated: true, metrics: {
          readMs: readEnd - start, parseMs: end - readEnd, hydrationMs: end - start, count: tasks.length,
        } });
      } catch {
        publish({ loadError: true, storageError: 'Não foi possível carregar suas tarefas. Seus dados foram preservados. Tente novamente.' });
      } finally {
        clearTimeout(timer);
        hydration = null;
        publish({ isLoading: false });
      }
      return state;
    })();
    return hydration;
  }

  function mutate(transform) {
    if (!state.isHydrated || state.isLoading || state.loadError) {
      return Promise.reject(new Error('Aguarde o carregamento das tarefas antes de alterar dados.'));
    }
    pendingWrites += 1;
    publish({ isSaving: true });
    const operation = queue.then(async () => {
      try {
        const { tasks, result } = transform(state.tasks);
        await storage.setItem(STORAGE_KEY, serializeTasks(tasks));
        // O sucesso só é publicado depois da confirmação do armazenamento.
        publish({ tasks, storageError: '' });
        return result;
      } catch (error) {
        const message = error.taskValidation ? error.message : 'Não foi possível salvar. A alteração não foi aplicada; tente novamente.';
        publish({ storageError: message });
        throw new Error(message);
      } finally {
        pendingWrites -= 1;
        publish({ isSaving: pendingWrites > 0 });
      }
    });
    queue = operation.catch(() => {});
    return operation;
  }

  function requireTask(tasks, id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
      const error = new Error('Esta tarefa não existe mais.');
      error.taskValidation = true;
      throw error;
    }
    return task;
  }

  return {
    getSnapshot: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    hydrate,
    addTask: (payload) => {
      let task;
      try { task = createTask(payload, `${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2, 10)}`); }
      catch (error) { return Promise.reject(error); }
      return mutate((tasks) => ({ tasks: [task, ...tasks], result: task.id }));
    },
    updateTask: (id, payload) => {
      let prepared;
      try { prepared = createTask(payload, id); }
      catch (error) { return Promise.reject(error); }
      return mutate((tasks) => {
        const task = requireTask(tasks, id);
        return { tasks: tasks.map((item) => item.id === id ? { ...task, title: prepared.title,
          description: prepared.description, category: prepared.category, priority: prepared.priority } : item) };
      });
    },
    toggleTask: (id) => mutate((tasks) => {
      requireTask(tasks, id);
      return { tasks: tasks.map((item) => item.id === id ? { ...item, completed: !item.completed } : item) };
    }),
    deleteTask: (id) => mutate((tasks) => {
      requireTask(tasks, id);
      return { tasks: tasks.filter((item) => item.id !== id) };
    }),
  };
}

module.exports = { createTaskStore };
