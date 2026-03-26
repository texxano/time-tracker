import React from 'react';
import { Text } from 'react-native';
import { styles } from './custom-text.style';


function CustomText({ text, customStyles }) {
  return <Text style={[styles.text, customStyles]}>{text}</Text>;
}

export default CustomText;
