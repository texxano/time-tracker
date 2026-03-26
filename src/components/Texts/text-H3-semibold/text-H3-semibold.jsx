import React from 'react';
import { Text } from 'react-native';
import styles from './text-H3-semibold.style';
export const TextH3SemiBold = ({
  text,

  customStyles,
}) => <Text style={[styles.text, customStyles]}>{text}</Text>;
