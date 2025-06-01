// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Contexto de autenticación
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Tutorial Wrapper
import TutorialWrapper from './src/components/TutorialWrapper';

// Pantallas públicas
import SignInScreen    from './src/screens/SignInScreen';
import SignUpScreen    from './src/screens/SignUpScreen';

// Pantalla principal
import DashboardScreen from './src/screens/DashboardScreen';
import DirectivoDashboard from './src/screens/DirectivoDashboard';
import AnalisisDetallado from './src/screens/AnalisisDetallado';
import AnalisisPorCurso from './src/screens/AnalisisPorCurso';

// Funcionalidades de clases
import ClassListScreen from './src/screens/ClassListScreen';
import JoinClassScreen from './src/screens/JoinClassScreen';
import ClassSummaryScreen from './src/screens/ClassSummaryScreen';

// Mood & Gratitud
import EmotionSelection from './src/screens/EmotionSelectionScreen';
import PlaceSelection from './src/screens/PlaceSelectionScreen';
import CommentScreen from './src/screens/CommentScreen';
import MoodHistory      from './src/screens/MoodHistoryScreen';
import GratitudeEntry   from './src/screens/GratitudeEntryScreen';
import GratitudeHistory from './src/screens/GratitudeHistoryScreen';

// Rutas de aprendizaje
import LearningPaths      from './src/screens/LearningPathsScreen';
import LearningPathDetail from './src/screens/LearningPathDetailScreen';

// Chatbot
import ChatbotScreen from './src/screens/ChatbotScreen';
import CreateClassScreen from './src/screens/CreateClassScreen';

// Insignias
import BadgesScreen from './src/screens/BadgesScreen';

// Cápsulas de autocuidado para docentes
import CapsulasBienestarScreen from './src/screens/CapsulasBienestarScreen';
import CapsulaDetalleScreen from './src/screens/CapsulaDetalleScreen';
import CapsulasGuardadasScreen from './src/screens/CapsulasGuardadasScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // o un componente de carga
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          // Stack de autenticación
          <>
            <Stack.Screen 
              name="SignIn" 
              component={SignInScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen} 
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Stack principal envuelto en TutorialWrapper
          <Stack.Screen 
            name="AuthenticatedApp" 
            options={{ headerShown: false }}
          >
            {() => (
              <TutorialWrapper>
                <Stack.Navigator
                  screenOptions={{ headerShown: false }}
                  initialRouteName="Dashboard"
                >
                  <Stack.Screen 
                    name="Dashboard" 
                    component={user?.role === 'directivo' ? DirectivoDashboard : DashboardScreen} 
                    options={{ headerShown: false }}
                  />

                  {/* Análisis detallado para directivos */}
                  <Stack.Screen name="AnalisisDetallado" component={AnalisisDetallado} />
                  
                  {/* Análisis por curso para directivos */}
                  <Stack.Screen name="AnalisisPorCurso" component={AnalisisPorCurso} />

                  {/* Clases */}
                  <Stack.Screen name="ClassList" component={ClassListScreen} />
                  <Stack.Screen name="JoinClass" component={JoinClassScreen} />
                  <Stack.Screen name="CreateClass" component={CreateClassScreen} />
                  <Stack.Screen name="ClassSummary" component={ClassSummaryScreen} />

                  {/* Estados de ánimo */}
                  <Stack.Screen name="EmotionSelection" component={EmotionSelection} />
                  <Stack.Screen name="PlaceSelection" component={PlaceSelection} />
                  <Stack.Screen name="Comment" component={CommentScreen} />
                  <Stack.Screen name="MoodHistory" component={MoodHistory} />

                  {/* Gratitud */}
                  <Stack.Screen name="GratitudeEntry" component={GratitudeEntry} />
                  <Stack.Screen name="GratitudeHistory" component={GratitudeHistory} />

                  {/* Rutas de aprendizaje */}
                  <Stack.Screen name="LearningPaths" component={LearningPaths} />
                  <Stack.Screen name="LearningPathDetail" component={LearningPathDetail} />

                  {/* Chatbot */}
                  <Stack.Screen name="Chatbot" component={ChatbotScreen} />
                  
                  {/* Insignias */}
                  <Stack.Screen name="Badges" component={BadgesScreen} />
                  
                  {/* Cápsulas de autocuidado para docentes */}
                  <Stack.Screen name="CapsulasBienestar" component={CapsulasBienestarScreen} />
                  <Stack.Screen name="CapsulaDetalle" component={CapsulaDetalleScreen} />
                  <Stack.Screen name="CapsulasGuardadas" component={CapsulasGuardadasScreen} />
                </Stack.Navigator>
              </TutorialWrapper>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// App solo se encarga de envolver con AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}