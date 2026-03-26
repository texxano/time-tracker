import React from 'react';
import { Text } from 'react-native';
import styles from './text-h3-regular.style';
import colors from '../../../constants/Colors';

export const TextH3Regular = ({
  text,
  color,
}) => {
  const customStyles = {
    color: color || colors.gray_600,
  };
  return <Text style={[styles.text, customStyles]}>{text}</Text>;
};
