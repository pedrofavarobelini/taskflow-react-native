import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const priorityColors = { Alta: colors.danger, Média: colors.warning, Baixa: colors.success };

function TaskCard({ task, onPress, onToggle, disabled = false }) {
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="checkbox" disabled={disabled}
        accessibilityLabel={`Marcar ${task.title} como ${task.completed ? 'pendente' : 'concluída'}`}
        accessibilityState={{ checked: task.completed, disabled }}
        onPress={() => onToggle(task.id)} style={styles.checkTarget}>
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed ? <Ionicons accessible={false} name="checkmark" size={16} color="#FFFFFF" /> : null}
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes: ${task.title}`}
        onPress={() => onPress(task.id)} style={({ pressed }) => [styles.body, pressed && { opacity: 0.75 }]}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.category}>{task.category}</Text>
            <View style={[styles.dot, { backgroundColor: priorityColors[task.priority] }]} />
            <Text style={styles.category}>{task.priority}</Text>
            <Text style={styles.category}>{task.completed ? 'Concluída' : 'Pendente'}</Text>
          </View>
        </View>
        <Ionicons accessible={false} name="chevron-forward" size={19} color={colors.muted} />
      </Pressable>
    </View>
  );
}

export default memo(TaskCard);
const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1,
    borderColor: colors.line, borderRadius: 18, backgroundColor: colors.card,
    paddingHorizontal: 8, paddingVertical: 10, marginBottom: 12 },
  checkTarget: { minHeight: 48, width: 48, alignItems: 'center', justifyContent: 'center' },
  checkbox: { height: 24, width: 24, borderWidth: 2, borderColor: colors.subtle,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  body: { flex: 1, minHeight: 48, paddingVertical: 8, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 9 },
  titleDone: { textDecorationLine: 'line-through', color: colors.muted },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  category: { fontSize: 12, color: colors.subtle },
});
