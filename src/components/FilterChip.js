import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function FilterChip({ label, selected, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && { opacity: 0.75 }]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 18, minHeight: 48, justifyContent: 'center', borderRadius: 13,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line },
  selected: { backgroundColor: colors.ink, borderColor: colors.ink },
  label: { color: colors.subtle, fontWeight: '600', fontSize: 13 },
  selectedLabel: { color: '#FFFFFF' },
});
