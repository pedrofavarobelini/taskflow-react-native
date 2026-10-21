import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

test('navegador real conecta início, detalhes, edição e estatísticas', async () => {
  await AsyncStorage.clear();
  render(<App />);
  await screen.findByText('3 no total');
  fireEvent.press(screen.getByLabelText('Ver detalhes: Revisar conteúdo de React Native'));
  await screen.findByText('Detalhes da tarefa');
  expect(screen.getByText('Estudar componentes, props e hooks.')).toBeTruthy();
  fireEvent.press(screen.getByText('Editar tarefa'));
  await screen.findByText('Editar tarefa', { exact: true });
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Tarefa revisada');
  fireEvent.press(screen.getByText('Salvar alterações'));
  await screen.findByText('Alterações salvas com sucesso.');
  fireEvent.press(screen.getByText('Concluir tarefa'));
  await screen.findByText('Marcar como pendente');
  fireEvent.press(screen.getByLabelText('Voltar'));
  await screen.findByText('3 no total');
  fireEvent.press(screen.getByLabelText('Ver estatísticas'));
  await screen.findByText('67%');
  const saved = JSON.parse(await AsyncStorage.getItem('@taskflow:tasks:v1'));
  expect(saved.find((task) => task.id === 'exemplo-1')).toMatchObject({ title: 'Tarefa revisada', completed: true });
});
