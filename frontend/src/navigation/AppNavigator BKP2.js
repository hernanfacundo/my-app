import React from 'react';
import { NavigationContainer, View, Text } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import LearningPathsScreen from '../screens/LearningPathsScreen';
import LearningPathDetailScreen from '../screens/LearningPathDetailScreen';
import SignInScreen from '../screens/SignInScreen';
import MoodHistoryScreen from '../screens/MoodHistoryScreen';
import EmotionSelectionScreen from '../screens/EmotionSelectionScreen';
import GratitudeEntryScreen from '../screens/GratitudeEntryScreen';
import GratitudeHistoryScreen from '../screens/GratitudeHistoryScreen';

const Stack = createNativeStackNavigator();

// Verificar que las pantallas estén definidas
const screens = [
  { name: 'SignIn', component: SignInScreen },
  { name: 'Dashboard', component: DashboardScreen },
  { name: 'LearningPaths', component: LearningPathsScreen },
  { name: 'LearningPathDetail', component: LearningPathDetailScreen },
  { name: 'MoodHistory', component: MoodHistoryScreen },
  { name: 'EmotionSelection', component: EmotionSelectionScreen },
  { name: 'GratitudeEntry', component: GratitudeEntryScreen },
  { name: 'GratitudeHistory', component: GratitudeHistoryScreen },
];

const validScreens = screens.filter(({ component, name }) => {
  if (!component) {
    console.warn(`Pantalla "${name}" no está definida. Verifica la importación o exportación del componente.`);
    return false;
  }
  return true;
});

const AppNavigator = () => {
  if (validScreens.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: No se encontraron pantallas válidas. Revisa las importaciones en AppNavigator.js</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        {validScreens.map(({ name, component }) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;