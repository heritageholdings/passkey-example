import { RootStackParamList } from './routes';
import { HomeScreen } from './HomeScreen';
import { AuthenticationScreen } from './AuthenticationScreen';
import { RegistrationScreen } from './RegistrationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Authentication">
      <Stack.Screen
        name="Authentication"
        component={AuthenticationScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
    </Stack.Navigator>
  );
};
