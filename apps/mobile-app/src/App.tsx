import 'text-encoding-polyfill';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { RootNavigator } from './RootNavigator';

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = require('buffer').Buffer;

export const App = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};
