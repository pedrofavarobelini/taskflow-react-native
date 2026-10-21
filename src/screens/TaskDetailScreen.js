import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TopBar from '../components/TopBar';
import ActionButton from '../components/ActionButton';
import StorageWarning from '../components/StorageWarning';
import { useTasks } from '../context/TasksContext';
import { colors } from '../theme/colors';

function DetailRow({ icon, label, value, accent }) {
  return <View style={styles.detailRow}>
    <View style={styles.detailIcon}><Ionicons name={icon} color={accent || colors.accent} size={19} /></View>
    <View><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
  </View>;
}

export default function TaskDetailScreen({ navigation, route }) {
  // Passagem real de parâmetro entre telas: route.params.taskId.
  const taskId = route.params?.taskId;
  const { tasks, isLoading, canEdit, storageError, toggleTask, deleteTask } = useTasks();
  const [notice, setNotice] = useState(route.params?.notice || '');
  useEffect(() => { setNotice(route.params?.notice || ''); }, [route.params?.notice]);
  const task = tasks.find((item) => item.id === taskId);

  async function removeTask() {
    try { await deleteTask(taskId); navigation.popToTop(); }
    catch { setNotice(''); }
  }

  async function changeStatus() {
    try { await toggleTask(taskId); setNotice('Status salvo com sucesso.'); }
    catch { setNotice(''); }
  }

  function confirmDelete() {
    if (!canEdit) return;
    // Alert não está disponível no React Native Web: confirmação apenas no app nativo.
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm('Excluir esta tarefa?')) removeTask();
      return;
    }
    Alert.alert('Excluir tarefa?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: removeTask },
    ]);
  }

  if (!task) {
    return <Screen><TopBar title="Detalhes" onBack={() => navigation.popToTop()} />
      <View style={styles.notFound}><StorageWarning message={storageError} /><Ionicons name="alert-circle-outline" color={colors.muted} size={36} /><Text style={styles.missingText}>{isLoading ? 'Carregando tarefa...' : 'Tarefa não encontrada.'}</Text><ActionButton title="Voltar ao início" onPress={() => navigation.popToTop()} style={{ marginTop: 20 }} /></View>
    </Screen>;
  }

  const date = new Date(task.createdAt);
  const formattedDate = Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleDateString('pt-BR');
  return (
    <Screen>
      <TopBar title="Detalhes da tarefa" subtitle="Informações e gerenciamento" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StorageWarning message={storageError} />
        {notice && !storageError ? <Text accessibilityLiveRegion="polite" style={{ color: colors.success, marginBottom: 16 }}>{notice}</Text> : null}
        <View style={styles.card}>
          <View style={[styles.statusBadge, { backgroundColor: task.completed ? colors.successSoft : colors.warningSoft }]}>
            <Ionicons name={task.completed ? 'checkmark-circle' : 'time-outline'} size={17} color={task.completed ? colors.success : '#C38112'} />
            <Text style={[styles.status, { color: task.completed ? colors.success : '#B47715' }]}>{task.completed ? 'Concluída' : 'Pendente'}</Text>
          </View>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.desc}>{task.description || 'Nenhuma descrição informada para esta tarefa.'}</Text>
          <View style={styles.divider} />
          <DetailRow icon="folder-open-outline" label="Categoria" value={task.category} />
          <DetailRow icon="flag-outline" label="Prioridade" value={task.priority} accent={task.priority === 'Alta' ? colors.danger : task.priority === 'Média' ? colors.warning : colors.success} />
          <DetailRow icon="calendar-outline" label="Criada em" value={formattedDate} />
        </View>
        <View style={styles.buttonGroup}>
          <ActionButton disabled={!canEdit} title={task.completed ? 'Marcar como pendente' : 'Concluir tarefa'} icon={task.completed ? 'refresh-circle-outline' : 'checkmark-circle-outline'} onPress={changeStatus} />
          <ActionButton disabled={!canEdit} title="Editar tarefa" icon="create-outline" variant="outline" onPress={() => navigation.navigate('NovaTarefa', { taskId })} />
          <ActionButton disabled={!canEdit} title="Excluir tarefa" icon="trash-outline" variant="danger" onPress={confirmDelete} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 23, padding: 23, borderWidth: 1, borderColor: colors.line },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', gap: 6, alignItems: 'center', borderRadius: 30, paddingHorizontal: 13, paddingVertical: 8, marginBottom: 19 },
  status: { fontSize: 12, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 31, color: colors.ink, marginBottom: 12 },
  desc: { fontSize: 14, color: colors.subtle, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 25 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  detailIcon: { height: 43, width: 43, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { color: colors.muted, fontSize: 12, marginBottom: 4 },
  detailValue: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  buttonGroup: { gap: 12, marginTop: 22 },
  notFound: { flex: 1, padding: 25, alignItems: 'center', justifyContent: 'center' },
  missingText: { color: colors.subtle, fontSize: 15, marginTop: 12 },
});
