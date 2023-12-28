import { Button, Text, View } from 'react-native';
import { registerPasskey } from '../../common/passkey/register';
import { Effect, Exit } from 'effect';
import { authenticatePasskey } from '../../common/passkey/authenticate';

export const HomeScreen: React.FC = () => {
  return (
    <View>
      <Text>HomeScreen</Text>
      <Button
        title={'Register'}
        onPress={async () => {
          const operationResults = await Effect.runPromiseExit(
            registerPasskey('asd@asd.it')
          );

          Exit.match(operationResults, {
            onFailure: (e) => console.error(e),
            onSuccess: (response) => console.log('Success: ', response),
          });
        }}
      ></Button>

      <Button
        title={'Authenticate'}
        onPress={async () => {
          const operationResults = await Effect.runPromiseExit(
            authenticatePasskey('asd@asd.it')
          );

          Exit.match(operationResults, {
            onFailure: (e) => console.error(e),
            onSuccess: (response) => console.log('Success: ', response),
          });
        }}
      ></Button>
    </View>
  );
};
