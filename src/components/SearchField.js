import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SearchField({ value, onChangeText, editable = true }) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search-outline" size={20} color={colors.muted} />
      <TextInput
        style={styles.input}
        placeholder="Buscar tarefas..."
        placeholderTextColor={colors.muted}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Buscar tarefas"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1,
    borderColor: colors.line, borderRadius: 16, backgroundColor: colors.card,
    paddingHorizontal: 16, minHeight: 54 },
  input: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 12 },
});
