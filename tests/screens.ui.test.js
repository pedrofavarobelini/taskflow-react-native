import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { TasksProvider } from '../src/context/TasksContext';
import HomeScreen from '../src/screens/HomeScreen';
import TaskFormScreen from '../src/screens/TaskFormScreen';
import TaskDetailScreen from '../src/screens/TaskDetailScreen';
import StatsScreen from '../src/screens/StatsScreen';
const { initialTasks, createTask } = require('../src/utils/taskUtils.cjs');

function memoryStorage(raw = JSON.stringify(initialTasks())) {
  return { raw, getItem: jest.fn(async function () { return this.raw; }),
    setItem: jest.fn(async function (_, value) { this.raw = value; }) };
}
const navigation = () => ({ navigate: jest.fn(), replace: jest.fn(), goBack: jest.fn(), popTo: jest.fn(), popToTop: jest.fn() });
function show(Component, { storage = memoryStorage(), params = {}, nav = navigation() } = {}) {
  render(<TasksProvider storage={storage}><Component navigation={nav} route={{ params }} /></TasksProvider>);
  return { storage, nav };
}

test('início apresenta estado real, pesquisa e filtro; envia somente o id aos detalhes', async () => {
  const { nav } = show(HomeScreen);
  await screen.findByText('3 no total');
  fireEvent.changeText(screen.getByLabelText('Buscar tarefas'), 'conteudo');
  expect(screen.getByText('Revisar conteúdo de React Native')).toBeTruthy();
  expect(screen.queryByText('Organizar atividades da semana')).toBeNull();
  fireEvent.press(screen.getByText('Concluídas', { exact: true }));
  expect(screen.getByText('Nenhuma tarefa encontrada')).toBeTruthy();
  fireEvent.press(screen.getByText('Todas'));
  fireEvent.press(screen.getByLabelText('Ver detalhes: Revisar conteúdo de React Native'));
  expect(nav.navigate).toHaveBeenCalledWith('Detalhes', { taskId: 'exemplo-1' });
});

test('hidratação lenta mostra interface e bloqueia cadastro sem gravar', async () => {
  let finish; const storage = memoryStorage(); storage.getItem.mockImplementation(() => new Promise((r) => { finish = r; }));
  const { nav } = show(HomeScreen, { storage });
  expect(screen.getByText('Minhas tarefas')).toBeTruthy();
  fireEvent.press(screen.getByText('Nova tarefa'));
  expect(nav.navigate).not.toHaveBeenCalled(); expect(storage.setItem).not.toHaveBeenCalled();
  await waitFor(() => expect(storage.getItem).toHaveBeenCalled());
  await act(async () => { finish('[]'); });
  expect(screen.getByText('0 no total')).toBeTruthy();
});

test('erro de leitura não exibe exemplos nem indicadores falsos e permite repetir', async () => {
  const storage = memoryStorage(); storage.getItem.mockRejectedValueOnce(new Error('falha'));
  show(HomeScreen, { storage });
  await screen.findByText('Tentar novamente');
  expect(screen.queryByText('3 no total')).toBeNull();
  expect(screen.queryByText('Revisar conteúdo de React Native')).toBeNull();
  fireEvent.press(screen.getByText('Tentar novamente'));
  await screen.findByText('3 no total'); expect(storage.setItem).not.toHaveBeenCalled();
});

test('formulário rejeita título vazio e não navega nem grava', async () => {
  const { storage, nav } = show(TaskFormScreen);
  await waitFor(() => expect(screen.getByLabelText('Título da tarefa')).toBeEnabled());
  fireEvent.press(screen.getByText('Criar tarefa'));
  await screen.findByText('O título da tarefa é obrigatório.');
  expect(storage.setItem).not.toHaveBeenCalled(); expect(nav.replace).not.toHaveBeenCalled();
});

test('cadastro grava e navega com id real e confirmação de sucesso', async () => {
  const { storage, nav } = show(TaskFormScreen, { storage: memoryStorage('[]') });
  await waitFor(() => expect(screen.getByLabelText('Título da tarefa')).toBeEnabled());
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Preparar apresentação');
  fireEvent.press(screen.getByText('Criar tarefa'));
  await waitFor(() => expect(nav.replace).toHaveBeenCalled());
  const saved = JSON.parse(storage.raw)[0];
  expect(nav.replace).toHaveBeenCalledWith('Detalhes', { taskId: saved.id, notice: 'Tarefa criada com sucesso.' });
  expect(saved.title).toBe('Preparar apresentação');
});

test('edição recupera por parâmetro e preserva id e conclusão', async () => {
  const { storage, nav } = show(TaskFormScreen, { params: { taskId: 'exemplo-3' } });
  await waitFor(() => expect(screen.getByLabelText('Título da tarefa')).toHaveDisplayValue('Configurar ambiente Expo'));
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Ambiente pronto');
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() => expect(nav.popTo).toHaveBeenCalledWith('Detalhes', { taskId: 'exemplo-3', notice: 'Alterações salvas com sucesso.' }));
  expect(JSON.parse(storage.raw).find((task) => task.id === 'exemplo-3')).toMatchObject({ completed: true, title: 'Ambiente pronto' });
});

test('falha de gravação conserva formulário e não navega', async () => {
  const storage = memoryStorage('[]'); storage.setItem.mockRejectedValue(new Error('cheio'));
  const { nav } = show(TaskFormScreen, { storage });
  await waitFor(() => expect(screen.getByLabelText('Título da tarefa')).toBeEnabled());
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Não perder texto');
  fireEvent.press(screen.getByText('Criar tarefa'));
  await waitFor(() => expect(screen.getAllByText(/A alteração não foi aplicada/).length).toBeGreaterThan(0));
  expect(screen.getByLabelText('Título da tarefa')).toHaveDisplayValue('Não perder texto');
  expect(nav.replace).not.toHaveBeenCalled(); expect(storage.raw).toBe('[]');
});

test('dois toques rápidos não cadastram duas tarefas nem antecipam sucesso', async () => {
  let finish; const storage = memoryStorage('[]'); storage.setItem.mockImplementation(() => new Promise((r) => { finish = r; }));
  const { nav } = show(TaskFormScreen, { storage });
  await waitFor(() => expect(screen.getByLabelText('Título da tarefa')).toBeEnabled());
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Uma tarefa');
  fireEvent.press(screen.getByText('Criar tarefa')); fireEvent.press(screen.getByText('Salvando...'));
  await waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(1));
  expect(nav.replace).not.toHaveBeenCalled();
  await act(async () => { finish(); }); expect(nav.replace).toHaveBeenCalledTimes(1);
});

test('detalhes recebem o id, concluem e abrem edição com o mesmo id', async () => {
  const { storage, nav } = show(TaskDetailScreen, { params: { taskId: 'exemplo-1' } });
  await screen.findByText('Revisar conteúdo de React Native');
  fireEvent.press(screen.getByText('Concluir tarefa'));
  await screen.findByText('Marcar como pendente');
  expect(JSON.parse(storage.raw)[0].completed).toBe(true);
  fireEvent.press(screen.getByText('Editar tarefa'));
  expect(nav.navigate).toHaveBeenCalledWith('NovaTarefa', { taskId: 'exemplo-1' });
});

test('exclusão exige confirmação; cancelar preserva e confirmar exclui', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { storage, nav } = show(TaskDetailScreen, { params: { taskId: 'exemplo-1' } });
  await screen.findByText('Excluir tarefa');
  fireEvent.press(screen.getByText('Excluir tarefa'));
  expect(storage.setItem).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2]; expect(buttons[0]).toMatchObject({ text: 'Cancelar', style: 'cancel' });
  await act(async () => { await buttons.find((button) => button.text === 'Excluir').onPress(); });
  expect(JSON.parse(storage.raw).some((task) => task.id === 'exemplo-1')).toBe(false);
  expect(nav.popToTop).toHaveBeenCalled(); alert.mockRestore();
});

test('parâmetro inexistente mostra mensagem e não habilita operações', async () => {
  show(TaskDetailScreen, { params: { taskId: 'inexistente' } });
  await screen.findByText('Tarefa não encontrada.'); expect(screen.queryByText('Concluir tarefa')).toBeNull();
});

test('estatísticas apresentam totais reais e porcentagem', async () => {
  show(StatsScreen); await screen.findByText('33%');
  expect(screen.getByText('1 de 3 tarefas finalizadas')).toBeTruthy();
  expect(screen.getByText('Total')).toBeTruthy(); expect(screen.getByText('Pendentes')).toBeTruthy();
});

test('lista grande disponibiliza o total sem montar todos os cartões inicialmente', async () => {
  const tasks = Array.from({ length: 200 }, (_, i) => createTask({ title: `Carga de teste ${i}` }, `load-${i}`));
  show(HomeScreen, { storage: memoryStorage(JSON.stringify(tasks)) });
  await screen.findByText('200 no total');
  expect(screen.getAllByText(/^Carga de teste /).length).toBeLessThan(200);
});
