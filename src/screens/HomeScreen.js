import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import ActionButton from '../components/ActionButton';
import SearchField from '../components/SearchField';
import FilterChip from '../components/FilterChip';
import TaskCard from '../components/TaskCard';
import StorageWarning from '../components/StorageWarning';
import { useTasks } from '../context/TasksContext';
import { colors } from '../theme/colors';
const { FILTERS, filterTasks, getTaskStats } = require('../utils/taskUtils.cjs');
const { markStartup } = require('../utils/performance.cjs');

export default function HomeScreen({ navigation }) {
  const { tasks, isLoading, isHydrated, canEdit, storageError, loadError, retryLoad, toggleTask } = useTasks();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTERS.ALL);
  const stats = useMemo(() => getTaskStats(tasks), [tasks]);
  const visibleTasks = useMemo(() => filterTasks(tasks, query, filter), [tasks, query, filter]);
  const openTask = useCallback((taskId) => navigation.navigate('Detalhes', { taskId }), [navigation]);
  const handleToggle = useCallback((id) => { toggleTask(id).catch(() => {}); }, [toggleTask]);
  const renderTask = useCallback(({ item }) => <TaskCard task={item} onPress={openTask} onToggle={handleToggle} disabled={!canEdit} />, [openTask, handleToggle, canEdit]);

  return (
    <Screen onLayout={() => markStartup('primeiro layout da tela inicial')}>
      <FlatList data={isHydrated ? visibleTasks : []} renderItem={renderTask} keyExtractor={(task) => task.id}
        initialNumToRender={8} windowSize={7} keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        ListHeaderComponent={<>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SEU ESPAÇO DE PRODUTIVIDADE</Text>
            <Text style={styles.heading}>Olá, bem-vindo 👋</Text>
            <Text style={styles.subheading}>Organize seu dia, uma tarefa de cada vez.</Text>
          </View>
          <View style={styles.logo}><Text style={styles.logoText}>TF</Text></View>
        </View>
        <StorageWarning message={storageError} onRetry={loadError && !isLoading ? retryLoad : undefined} />
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>SEU PROGRESSO</Text>
              <Text style={styles.heroTitle}>{loadError ? 'Vamos recuperar suas tarefas.' : !isHydrated ? 'Seu espaço está pronto.' : 'Continue no seu ritmo.'}</Text>
              <Text style={styles.heroSubtitle}>{loadError ? 'Use Tentar novamente para carregar a lista.' : !isHydrated ? 'Preparando os dados salvos...' : `${stats.done} de ${stats.total} tarefas concluídas`}</Text>
            </View>
            <View style={styles.percentageCircle}><Text style={styles.percentage}>{!isHydrated ? '—' : `${stats.percentage}%`}</Text></View>
          </View>
          <View style={styles.track}><View style={[styles.bar, { width: `${!isHydrated ? 0 : stats.percentage}%` }]} /></View>
          <View style={styles.heroBottom}>
            <View style={styles.heroStat}><Ionicons name="checkmark-circle" size={17} color="#B5F1DB" /><Text style={styles.heroStatText}>{!isHydrated ? '—' : stats.done} concluídas</Text></View>
            <View style={styles.heroStat}><Ionicons name="time-outline" size={17} color="#CEC9FF" /><Text style={styles.heroStatText}>{!isHydrated ? '—' : stats.pending} pendentes</Text></View>
          </View>
        </View>

        <View style={styles.actions}>
          <ActionButton title="Nova tarefa" icon="add-circle-outline" disabled={!canEdit} onPress={() => navigation.navigate('NovaTarefa')} style={{ flex: 1 }} />
          <Pressable disabled={!isHydrated} style={[styles.statsButton, !isHydrated && styles.disabledButton]} onPress={() => navigation.navigate('Estatisticas')} accessibilityRole="button" accessibilityLabel="Ver estatísticas">
            <Ionicons name="stats-chart" size={20} color={colors.accent} />
          </Pressable>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Minhas tarefas</Text>
          <Text style={styles.count}>{!isHydrated ? 'Preparando...' : `${tasks.length} no total`}</Text>
        </View>
        <SearchField value={query} onChangeText={setQuery} editable={isHydrated} />
        <View style={styles.filters}>
          <FilterChip label="Todas" selected={filter === FILTERS.ALL} disabled={!isHydrated} onPress={() => isHydrated && setFilter(FILTERS.ALL)} />
          <FilterChip label="Pendentes" selected={filter === FILTERS.PENDING} disabled={!isHydrated} onPress={() => isHydrated && setFilter(FILTERS.PENDING)} />
          <FilterChip label="Concluídas" selected={filter === FILTERS.DONE} disabled={!isHydrated} onPress={() => isHydrated && setFilter(FILTERS.DONE)} />
        </View>
        {isLoading ? (
          <View style={styles.loadingSection} accessibilityLiveRegion="polite">
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.loadingTitle}>Carregando suas tarefas salvas</Text>
                <Text style={styles.loadingText}>A lista aparecerá assim que o armazenamento local responder.</Text>
              </View>
            </View>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '66%' }]} />
          </View>
        ) : null}
        </>}
        ListEmptyComponent={isHydrated ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="file-tray-outline" size={28} color={colors.accent} /></View>
            <Text style={styles.emptyTitle}>Nenhuma tarefa encontrada</Text>
            <Text style={styles.emptyText}>Tente outro filtro ou crie uma nova tarefa.</Text>
          </View>
        ) : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 25, paddingBottom: 45 },
  loadingSection: { borderRadius: 18, borderWidth: 1, borderColor: colors.line,
    backgroundColor: '#FFFFFF', padding: 20, marginBottom: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  loadingTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  loadingText: { color: colors.subtle, fontSize: 12, lineHeight: 17 },
  skeletonLine: { height: 12, borderRadius: 8, backgroundColor: colors.line,
    marginBottom: 10, width: '95%' },
  disabledButton: { opacity: 0.45 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  eyebrow: { color: colors.accent, fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginBottom: 9 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.6 },
  subheading: { fontSize: 13, color: colors.subtle, marginTop: 8, maxWidth: 280 },
  logo: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  logoText: { color: colors.accent, fontSize: 17, fontWeight: '900' },
  hero: { backgroundColor: colors.navy, padding: 22, borderRadius: 24, marginBottom: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', color: '#BDB8F2', letterSpacing: 1.1, marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 7 },
  heroSubtitle: { color: '#C7CCE1', fontSize: 13 },
  percentageCircle: { borderColor: '#7771C5', borderWidth: 3, borderRadius: 50, height: 70, width: 70, alignItems: 'center', justifyContent: 'center' },
  percentage: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  track: { height: 8, borderRadius: 5, backgroundColor: '#42466B', overflow: 'hidden', marginTop: 25 },
  bar: { height: '100%', borderRadius: 5, backgroundColor: '#ACAAFF' },
  heroBottom: { marginTop: 17, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStatText: { color: '#E4E6F1', fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  statsButton: { height: 52, width: 54, backgroundColor: colors.accentSoft, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DFDAFF' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 21, color: colors.ink, fontWeight: '800' },
  count: { fontSize: 12, color: colors.muted },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 16, marginBottom: 18 },
  empty: { padding: 30, alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FFFFFF', marginTop: 5 },
  emptyIcon: { width: 58, height: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft, marginBottom: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  emptyText: { fontSize: 12, color: colors.subtle, marginTop: 7, textAlign: 'center', lineHeight: 19 },
});

