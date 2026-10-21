import '@expo/metro-runtime';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TasksProvider } from './src/context/TasksContext';
import HomeScreen from './src/screens/HomeScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import StatsScreen from './src/screens/StatsScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const { markStartup } = require('./src/utils/performance.cjs');

export default function App() {
  return (
    <SafeAreaProvider>
      <TasksProvider>
        <NavigationContainer onReady={() => markStartup('navegação pronta')}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="Inicio" component={HomeScreen} />
            <Stack.Screen name="NovaTarefa" component={TaskFormScreen} />
            <Stack.Screen name="Detalhes" component={TaskDetailScreen} />
            <Stack.Screen name="Estatisticas" component={StatsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TasksProvider>
    </SafeAreaProvider>
  );
}
