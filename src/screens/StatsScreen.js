import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TopBar from '../components/TopBar';
import ActionButton from '../components/ActionButton';
import StorageWarning from '../components/StorageWarning';
import { useTasks } from '../context/TasksContext';
import { colors } from '../theme/colors';
const { getTaskStats, getCategoryStats } = require('../utils/taskUtils.cjs');

function Metric({ number, label, color, icon }) {
  return <View style={styles.metric}>
    <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}><Ionicons name={icon} color={color} size={19} /></View>
    <Text style={styles.metricNumber}>{number}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>;
}

export default function StatsScreen({ navigation }) {
  const { tasks, isHydrated, storageError } = useTasks();
  const stats = useMemo(() => getTaskStats(tasks), [tasks]);
  const categories = useMemo(() => getCategoryStats(tasks), [tasks]);

  if (!isHydrated) return <Screen><TopBar title="Meu desempenho" onBack={() => navigation.goBack()} /><StorageWarning message={storageError} /><Text style={{ margin: 24 }}>Aguardando as tarefas salvas...</Text></Screen>;

  return (
    <Screen>
      <TopBar title="Meu desempenho" subtitle="Acompanhe a evolução das suas tarefas" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Ionicons name="trophy-outline" color="#F7DAA2" size={33} />
          <Text style={styles.bannerTitle}>Cada tarefa conta!</Text>
          <Text style={styles.bannerDesc}>Você já finalizou {stats.done} {stats.done === 1 ? 'tarefa' : 'tarefas'}. Continue avançando.</Text>
        </View>
        <View style={styles.metrics}>
          <Metric number={stats.total} label="Total" icon="layers-outline" color={colors.accent} />
          <Metric number={stats.done} label="Concluídas" icon="checkmark-done-outline" color={colors.success} />
          <Metric number={stats.pending} label="Pendentes" icon="time-outline" color={colors.warning} />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Taxa de conclusão</Text>
            <Text style={styles.highlight}>{stats.percentage}%</Text>
          </View>
          <View style={styles.track}><View style={[styles.bar, { width: `${stats.percentage}%` }]} /></View>
          <Text style={styles.caption}>{stats.done} de {stats.total} tarefas finalizadas</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por categoria</Text>
          {categories.map((group) => <View key={group.name} style={styles.category}>
            <View style={styles.categoryRow}><Text style={styles.categoryName}>{group.name}</Text><Text style={styles.categoryTotal}>{group.done}/{group.total}</Text></View>
            <View style={styles.categoryTrack}><View style={[styles.categoryBar, { width: `${group.percentage}%` }]} /></View>
          </View>)}
        </View>
        <ActionButton title="Voltar às tarefas" icon="arrow-back-outline" onPress={() => navigation.navigate('Inicio')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 45 },
  banner: { backgroundColor: colors.navy, borderRadius: 22, padding: 23, gap: 10, marginBottom: 18 },
  bannerTitle: { fontWeight: '800', color: '#FFFFFF', fontSize: 21 },
  bannerDesc: { color: '#CBCFE3', fontSize: 13, lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 9, marginBottom: 18 },
  metric: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line, paddingVertical: 19, alignItems: 'center', borderRadius: 17 },
  metricIcon: { width: 37, height: 37, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metricNumber: { fontSize: 22, color: colors.ink, fontWeight: '800' },
  metricLabel: { marginTop: 4, fontSize: 11, color: colors.subtle },
  section: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line, borderRadius: 19, padding: 19, marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 16, marginBottom: 18 },
  highlight: { color: colors.accent, fontWeight: '800', fontSize: 19 },
  track: { backgroundColor: colors.accentSoft, height: 10, borderRadius: 6, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.accent, borderRadius: 6 },
  caption: { fontSize: 12, color: colors.subtle, marginTop: 11 },
  category: { marginBottom: 17 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryName: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  categoryTotal: { color: colors.subtle, fontSize: 12 },
  categoryTrack: { height: 8, backgroundColor: colors.accentSoft, borderRadius: 5, overflow: 'hidden' },
  categoryBar: { height: '100%', backgroundColor: colors.accent, borderRadius: 5 },
});
