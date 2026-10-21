import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
export default function StorageWarning({ message, onRetry }) {
  if (!message) return null;
  return <View style={styles.warning} accessibilityLiveRegion="polite"><Ionicons accessible={false} name="warning-outline" size={18} color={colors.danger} /><View style={{ flex: 1 }}><Text style={styles.text}>{message}</Text>{onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: colors.danger, fontWeight: '700' }}>Tentar novamente</Text></Pressable> : null}</View></View>;
}
const styles = StyleSheet.create({
  warning: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, backgroundColor: colors.dangerSoft, marginBottom: 15 },
  text: { color: colors.danger, fontSize: 14, lineHeight: 21 },
});
