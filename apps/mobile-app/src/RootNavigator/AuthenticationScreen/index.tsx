import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { Effect, Exit } from 'effect';
import { registerPasskey } from '../../common/passkey/register';
import { useSetAtom } from 'jotai';
import { jwtAtom } from '../../common/state/jwt';
import { authenticatePasskey } from '../../common/passkey/authenticate';
import Toast from 'react-native-toast-message';
import { Button } from '../../common/components/Button';

const styles = StyleSheet.create({
  input: {
    height: 48,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: '#6a6a6a',
  },
  center: { alignSelf: 'center' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});

export const AuthenticationScreen: React.FC = () => {
  const [email, setEmail] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const setJwt = useSetAtom(jwtAtom);
  const buttonDisabled = email.length === 0 && !loading;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, styles.center]}>Passkey Example</Text>
      </View>
      <View style={{ flex: 3 }}>
        <TextInput
          style={styles.input}
          placeholder={'Insert the email'}
          onChangeText={setEmail}
          value={email}
        />
        <Button
          title={'Register'}
          disabled={buttonDisabled}
          onPress={async () => {
            setLoading(true);
            const operationResults = await Effect.runPromiseExit(
              registerPasskey(email)
            );

            Exit.match(operationResults, {
              onFailure: (e) => {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: `An error occurred, see the console for more details.`,
                });
                console.error(e);
              },
              onSuccess: (response) => setJwt(response.token),
            });
            setLoading(false);
          }}
        />
        <Text style={styles.center}>or</Text>
        <Button
          title={'Login'}
          onPress={async () => {
            setLoading(true);
            const operationResults = await Effect.runPromiseExit(
              authenticatePasskey()
            );

            Exit.match(operationResults, {
              onFailure: (e) => {
                console.error(e);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: `An error occurred, see the console for more details.`,
                });
              },
              onSuccess: (response) => setJwt(response.token),
            });
            setLoading(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};
