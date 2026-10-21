import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function TopBar({ title, subtitle, onBack }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Ionicons name="arrow-back" size={20} color={colors.ink} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  back: { height: 48, width: 48, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  subtitle: { color: colors.subtle, fontSize: 12, marginTop: 4 },
});
