import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MoodStartScreen from './src/screens/MoodStartScreen';
import EmotionSelectionScreen from './src/screens/EmotionSelectionScreen';
import PlaceSelectionScreen from './src/screens/PlaceSelectionScreen';
import CommentScreen from './src/screens/CommentScreen';
import MoodHistoryScreen from './src/screens/MoodHistoryScreen';
import GratitudeEntryScreen from './src/screens/GratitudeEntryScreen';
import GratitudeHistoryScreen from './src/screens/GratitudeHistoryScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import LearningPathsScreen from './src/screens/LearningPathsScreen';
import LearningPathDetailScreen from './src/screens/LearningPathDetailScreen';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

const App = () => {
  const { user } = useContext(AuthContext) || {}; // Evita el error si AuthContext no está definido

  useEffect(() => {
    if (user && user.id) {
      // Aquí podrías agregar lógica para redirigir según el rol en el futuro
    }
  }, [user]);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={user && user.id ? 'Dashboard' : 'SignIn'}>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MoodStart" component={MoodStartScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmotionSelection" component={EmotionSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PlaceSelection" component={PlaceSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Comment" component={CommentScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="GratitudeEntry" component={GratitudeEntryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="GratitudeHistory" component={GratitudeHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LearningPaths" component={LearningPathsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LearningPathDetail" component={LearningPathDetailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;