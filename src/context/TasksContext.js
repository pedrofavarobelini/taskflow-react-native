import React, { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { createTaskStore } = require('../utils/taskStore.cjs');
const { markStartup } = require('../utils/performance.cjs');

const TasksContext = createContext(null);

export function TasksProvider({ children, storage = AsyncStorage }) {
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createTaskStore(storage);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    let active = true;
    store.hydrate().then((snapshot) => {
      if (active && __DEV__ && snapshot.metrics) {
        console.info('[TaskFlow] Hidratação (ms):', snapshot.metrics);
        markStartup('dados disponíveis');
      }
    });
    return () => { active = false; };
  }, [store]);

  const value = useMemo(() => ({ ...state, canEdit: state.isHydrated && !state.isLoading && !state.loadError && !state.isSaving,
    addTask: store.addTask, updateTask: store.updateTask, toggleTask: store.toggleTask,
    deleteTask: store.deleteTask, retryLoad: store.hydrate,
  }), [state, store]);
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks deve ser usado dentro de TasksProvider');
  return context;
}
