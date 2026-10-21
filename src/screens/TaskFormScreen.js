import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TopBar from '../components/TopBar';
import ActionButton from '../components/ActionButton';
import FilterChip from '../components/FilterChip';
import StorageWarning from '../components/StorageWarning';
import { useTasks } from '../context/TasksContext';
import { colors } from '../theme/colors';
const { CATEGORIES, PRIORITIES } = require('../utils/taskUtils.cjs');

export default function TaskFormScreen({ navigation, route }) {
  const taskId = route.params?.taskId;
  const { tasks, canEdit, storageError, addTask, updateTask } = useTasks();
  const current = taskId ? tasks.find((task) => task.id === taskId) : null;
  const isEditing = Boolean(taskId);
  const [title, setTitle] = useState(current?.title || '');
  const [description, setDescription] = useState(current?.description || '');
  const [category, setCategory] = useState(current?.category || 'Estudos');
  const [priority, setPriority] = useState(current?.priority || 'Média');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveLock = useRef(false);
  const active = useRef(true);
  const descriptionInput = useRef(null);
  const initializedId = useRef(current?.id);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    if (current && initializedId.current !== current.id) {
      setTitle(current.title); setDescription(current.description);
      setCategory(current.category); setPriority(current.priority);
      initializedId.current = current.id;
    }
  }, [current]);

  async function handleSave() {
    if (!canEdit || saveLock.current) return;
    saveLock.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      const payload = { title, description, category, priority };
      if (isEditing && current) {
        await updateTask(taskId, payload);
        if (active.current) navigation.popTo('Detalhes', { taskId, notice: 'Alterações salvas com sucesso.' });
      } else if (!isEditing) {
        const newId = await addTask(payload);
        if (active.current) navigation.replace('Detalhes', { taskId: newId, notice: 'Tarefa criada com sucesso.' });
      } else {
        setError('Esta tarefa não existe mais.');
      }
    } catch (saveError) {
      if (active.current) setError(saveError.message || 'Não foi possível salvar a tarefa.');
    } finally {
      saveLock.current = false;
      if (active.current) setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <TopBar title={isEditing ? 'Editar tarefa' : 'Nova tarefa'} subtitle={isEditing ? 'Atualize os dados da atividade' : 'Planeje seu próximo passo'} onBack={() => !saveLock.current && navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <StorageWarning message={storageError} />
          <View style={styles.intro}>
            <View style={styles.introIcon}><Ionicons name="create-outline" size={26} color={colors.accent} /></View>
            <Text style={styles.introTitle}>Transforme planos em ação</Text>
            <Text style={styles.introSubtitle}>Adicione os detalhes para manter tudo organizado.</Text>
          </View>

          <Text style={styles.label}>Título da tarefa <Text style={{ color: colors.danger }}>*</Text></Text>
          <TextInput
            style={styles.input} placeholder="Ex.: Estudar para a prova"
            placeholderTextColor={colors.muted} value={title}
            onChangeText={(text) => { setTitle(text); setError(''); }} maxLength={70}
            accessibilityLabel="Título da tarefa" returnKeyType="next"
            editable={canEdit && !isSubmitting} onSubmitEditing={() => descriptionInput.current?.focus()} submitBehavior="submit"
          />
          <Text style={styles.counter}>{title.length}/70</Text>

          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]} multiline textAlignVertical="top"
            placeholder="Anote informações importantes..." placeholderTextColor={colors.muted}
            value={description} onChangeText={setDescription} maxLength={500}
            accessibilityLabel="Descrição da tarefa"
            ref={descriptionInput} editable={canEdit && !isSubmitting}
          />
          <Text style={styles.counter}>{description.length}/500</Text>

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chips}>{CATEGORIES.map((name) => <FilterChip key={name} label={name} selected={category === name} disabled={!canEdit} onPress={() => setCategory(name)} />)}</View>

          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.chips}>{PRIORITIES.map((name) => <FilterChip key={name} label={name} selected={priority === name} disabled={!canEdit} onPress={() => setPriority(name)} />)}</View>

          {error ? <View style={styles.error}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
          <ActionButton title={isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar tarefa'} disabled={!canEdit} loading={isSubmitting} icon="checkmark-circle-outline" onPress={handleSave} style={{ marginTop: 16 }} />
          <Text style={styles.footnote}>As tarefas são armazenadas localmente no dispositivo.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 50 },
  intro: { padding: 22, borderRadius: 22, backgroundColor: colors.accentSoft, marginBottom: 26 },
  introIcon: { width: 47, height: 47, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  introTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  introSubtitle: { fontSize: 13, color: colors.subtle, marginTop: 7, lineHeight: 19 },
  label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  input: { borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FFFFFF', color: colors.ink, fontSize: 15, paddingHorizontal: 15, minHeight: 54, marginBottom: 4 },
  textArea: { height: 110, paddingTop: 15 },
  counter: { color: colors.muted, textAlign: 'right', fontSize: 11, marginBottom: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 25 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: colors.dangerSoft, borderRadius: 12 },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  footnote: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 17 },
});
