import React from "react";
import { Text } from "react-native";
import styles from "./text-main.style";
import { FormattedMessage } from "react-intl";

export const TextMain = ({ text, customStyles, isPlaintext, numberOfLines }) => (
  <Text style={[styles.text, customStyles ]} numberOfLines={numberOfLines || 1}>
    {isPlaintext ? text : <FormattedMessage id={text} />}
  </Text>
);
