import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
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

export const Button: React.FC<ButtonProps> = ({ title, disabled, onPress }) => (
  <TouchableOpacity
    style={[styles.button, disabled ? styles.buttonDisabled : null]}
    disabled={disabled}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);
