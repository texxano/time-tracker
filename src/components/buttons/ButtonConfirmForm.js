import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FormattedMessage } from "react-intl";
import { modalStyle } from "../../asset/style/components/modalStyle";

export const ButtonConfirmForm = ({
  onPress,
  customStyles,
  customStylesText,
  text,
}) => {
  return (
    <TouchableOpacity
      style={[modalStyle.button, modalStyle.buttonAdd, customStyles]}
      onPress={onPress}
    >
      <Text style={[modalStyle.textStyle, customStylesText]}>
        <FormattedMessage id={text || "common.button.confirm"} />
      </Text>
    </TouchableOpacity>
  );
};
