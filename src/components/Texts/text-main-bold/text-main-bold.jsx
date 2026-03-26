import React from "react";
import { Text } from "react-native";
import styles from "./text-main-bold.style";
import colors from "../../../constants/Colors";
import { FormattedMessage } from "react-intl";

export const TextMainBold = ({ text, isPlaintext }) => {
  const customStyles = {
    color: colors.black,
  };
  return (
    <Text style={[styles.text, customStyles]}>
      {isPlaintext ? text : <FormattedMessage id={text} />}
    </Text>
  );
};
