import { RootStackParamList } from './routes';
import { HomeScreen } from './HomeScreen';
import { AuthenticationScreen } from './AuthenticationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAtomValue } from 'jotai';
import { jwtAtom } from '../common/state/jwt';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const authenticated = useAtomValue(jwtAtom);

  return (
    <Stack.Navigator
      initialRouteName="Authentication"
      screenOptions={{
        headerShown: false,
      }}
    >
      {authenticated ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen name="Authentication" component={AuthenticationScreen} />
      )}
    </Stack.Navigator>
  );
};
