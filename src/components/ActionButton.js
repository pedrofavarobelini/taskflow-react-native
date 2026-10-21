import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ActionButton({ title, onPress, icon, variant = 'primary', disabled = false, loading = false, style }) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : isDanger ? styles.danger : styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={isOutline ? colors.accent : '#FFFFFF'} /> : icon ? <Ionicons accessible={false} name={icon} size={19} color={isOutline ? colors.accent : '#FFFFFF'} /> : null}
        <Text style={[styles.text, isOutline && styles.outlineText]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.accent },
  outline: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: '#DAD6FF' },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flexShrink: 1 },
  outlineText: { color: colors.accent },
});
