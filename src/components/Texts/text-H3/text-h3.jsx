import React from 'react';
import { Text } from 'react-native';
import styles from './text-h3.style';
import { FormattedMessage } from 'react-intl';


export const TextH3 = ({
  text,
  customStyles,
  isPlaintext
}) => <Text style={[styles.text, customStyles]}>
{isPlaintext ? text : <FormattedMessage id={text} />}
</Text>;
