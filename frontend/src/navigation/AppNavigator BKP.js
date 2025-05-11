import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="EmotionSelection" component={EmotionSelectionScreen} />
        <Stack.Screen name="PlaceSelection" component={PlaceSelectionScreen} />
        <Stack.Screen name="Comment" component={CommentScreen} />
        <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} />
        <Stack.Screen name="LearningPaths" component={LearningPathsScreen} />
        <Stack.Screen name="LearningPathDetail" component={LearningPathDetailScreen} />
        <Stack.Screen name="GratitudeEntry" component={GratitudeEntryScreen} />
        <Stack.Screen name="GratitudeHistory" component={GratitudeHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;