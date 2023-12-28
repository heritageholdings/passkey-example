import {
  Text,
  TextInput,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { Effect, Exit } from 'effect';
import { registerPasskey } from '../../common/passkey/register';

const styles = StyleSheet.create({
  input: {
    height: 48,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: '#6a6a6a',
  },
  button: {
    backgroundColor: '#2E5EB8',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    margin: 12,
  },
  buttonDisabled: {
    backgroundColor: '#6a6a6a',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

type ButtonProps = { title: string } & Pick<
  React.ComponentProps<typeof TouchableOpacity>,
  'disabled' | 'onPress'
>;

const Button: React.FC<ButtonProps> = ({ title, disabled, onPress }) => (
  <TouchableOpacity
    style={[styles.button, disabled ? styles.buttonDisabled : null]}
    disabled={disabled}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const handleRegisterPasskey = async (email: string) => {
  const operationResults = await Effect.runPromiseExit(registerPasskey(email));

  Exit.match(operationResults, {
    onFailure: (e) => console.error(e),
    onSuccess: (response) => console.log('Success: ', response),
  });
};

export const AuthenticationScreen: React.FC = () => {
  const [email, setEmail] = React.useState<string>('');
  const buttonDisabled = email.length === 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} />
      <View style={{ flex: 3 }}>
        <TextInput
          style={styles.input}
          placeholder={'Insert the email'}
          onChangeText={setEmail}
          value={email}
        />
        <Button title={'Login'} disabled={buttonDisabled} />
        <Text style={{ alignSelf: 'center' }}>or</Text>
        <Button
          title={'Register'}
          disabled={buttonDisabled}
          onPress={() => handleRegisterPasskey(email)}
        />
      </View>
    </SafeAreaView>
  );
};
