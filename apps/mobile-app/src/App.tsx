import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { RootNavigator } from './RootNavigator';

export const App = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};
