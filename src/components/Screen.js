import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export default function Screen({ children, style, onLayout }) {
  return <SafeAreaView onLayout={onLayout} edges={['top', 'bottom', 'left', 'right']} style={[{ flex: 1, backgroundColor: colors.background, width: '100%', maxWidth: 760, alignSelf: 'center' }, style]}>{children}</SafeAreaView>;
}
