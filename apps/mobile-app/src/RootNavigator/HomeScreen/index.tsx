import { Button, Text, View } from 'react-native';
import { RegisterPasskey } from '../../common/passkey/register';
import { Effect, Exit } from 'effect';

export const HomeScreen: React.FC = () => {
  return (
    <View>
      <Text>HomeScreen</Text>
      <Button
        title={'Request AuthOptions'}
        onPress={async () => {
          const operationResults = await Effect.runPromiseExit(
            RegisterPasskey('asd@asd.it')
          );

          Exit.match(operationResults, {
            onFailure: (e) => console.log(e),
            onSuccess: (credentialCreationOptions) =>
              console.log(credentialCreationOptions),
          });
        }}
      ></Button>
    </View>
  );
};
