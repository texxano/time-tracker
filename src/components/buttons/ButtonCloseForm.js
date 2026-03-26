import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FormattedMessage } from "react-intl";
import { modalStyle } from "../../asset/style/components/modalStyle";

export const ButtonCloseForm = ({
  onPress,
  customStyles,
  customStylesText,
  text,
}) => {
  return (
    <TouchableOpacity
      style={[modalStyle.button, modalStyle.buttonClose, customStyles]}
      onPress={onPress}
    >
      <Text style={[modalStyle.textStyle, customStylesText]}>
        <FormattedMessage id={text || "common.button.close"} />
      </Text>
    </TouchableOpacity>
  );
};
