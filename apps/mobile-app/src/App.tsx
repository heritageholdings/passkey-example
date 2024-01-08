import 'text-encoding-polyfill';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { RootNavigator } from './RootNavigator';
import Toast from 'react-native-toast-message';

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = require('buffer').Buffer;

export const App = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
      <Toast />
    </NavigationContainer>
  );
};
