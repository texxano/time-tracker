import React from "react";
import { Text } from "react-native";
import styles from "./text-h2.style";
import { FormattedMessage } from "react-intl";

export const TextH2 = ({ text, customStyles, isPlaintext }) => (
  <Text style={[styles.text, customStyles]}>
  {isPlaintext ? text : <FormattedMessage id={text} />}
</Text>
);
