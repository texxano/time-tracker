import React from 'react';
import { Text } from 'react-native';
import styles from './main-small-bold.style';
import { FormattedMessage } from 'react-intl';


export const TextMainSmallBold = ({
  text,
  customStyles,
  isPlaintext
}) =>  <Text style={[styles.text, customStyles]}>
{isPlaintext ? text : <FormattedMessage id={text} />}
</Text>
