import React from 'react';
import { NavigationContainer, View, Text } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EmotionSelectionScreen from '../screens/EmotionSelectionScreen';
import PlaceSelectionScreen from '../screens/PlaceSelectionScreen';
import CommentScreen from '../screens/CommentScreen';
import MoodHistoryScreen from '../screens/MoodHistoryScreen';
import LearningPathsScreen from '../screens/LearningPathsScreen';
import LearningPathDetailScreen from '../screens/LearningPathDetailScreen';
import GratitudeEntryScreen from '../screens/GratitudeEntryScreen';
import GratitudeHistoryScreen from '../screens/GratitudeHistoryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ClassListScreen from '../screens/ClassListScreen';
import JoinClassScreen from '../screens/JoinClassScreen';
import CreateClassScreen from '../screens/CreateClassScreen';
import BadgesScreen from '../screens/BadgesScreen';
// Importaciones de cápsulas de autocuidado
import CapsulasBienestarScreen from '../screens/CapsulasBienestarScreen';
import CapsulaDetalleScreen from '../screens/CapsulaDetalleScreen';
import CapsulasGuardadasScreen from '../screens/CapsulasGuardadasScreen';

const Stack = createNativeStackNavigator();

// Verificar que las pantallas estén definidas
const screens = [
  { name: 'SignIn', component: SignInScreen },
  { name: 'SignUp', component: SignUpScreen },
  { name: 'Dashboard', component: DashboardScreen },
  { name: 'EmotionSelection', component: EmotionSelectionScreen },
  { name: 'PlaceSelection', component: PlaceSelectionScreen },
  { name: 'Comment', component: CommentScreen },
  { name: 'MoodHistory', component: MoodHistoryScreen },
  { name: 'LearningPaths', component: LearningPathsScreen },
  { name: 'LearningPathDetail', component: LearningPathDetailScreen },
  { name: 'GratitudeEntry', component: GratitudeEntryScreen },
  { name: 'GratitudeHistory', component: GratitudeHistoryScreen },
  { name: 'Chatbot', component: ChatbotScreen },
  { name: 'ClassList', component: ClassListScreen },
  { name: 'JoinClass', component: JoinClassScreen },
  { name: 'CreateClass', component: CreateClassScreen },
  { name: 'Badges', component: BadgesScreen },
  // Pantallas de cápsulas de autocuidado
  { name: 'CapsulasBienestar', component: CapsulasBienestarScreen },
  { name: 'CapsulaDetalle', component: CapsulaDetalleScreen },
  { name: 'CapsulasGuardadas', component: CapsulasGuardadasScreen },
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
      <Stack.Navigator 
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false, // Ocultar header por defecto
        }}
      >
        {validScreens.map(({ name, component }) => (
          <Stack.Screen 
            key={name} 
            name={name} 
            component={component}
            options={{
              headerShown: false,
            }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;