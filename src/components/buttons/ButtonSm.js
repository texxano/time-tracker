import React from "react";
import { TouchableOpacity } from "react-native";
import colors from "../../constants/Colors";
import { mt, p } from "../../asset/style/utilities.style";
import { TextMainSmallBold } from "../Texts";
import flex from "../../asset/style/flex.style";

export const ButtonSm = ({ customStyles, customTextStyles, handleClick, isPlainText, text }) => {
  return (
    <TouchableOpacity
      style={[
        { borderRadius: 8, backgroundColor: colors.success_100, width:80 },
        p[2],
        mt[1],
        flex.d_flex_center,
        customStyles,
      ]}
      onPress={handleClick}
    >
      <TextMainSmallBold
        customStyles={[customTextStyles]}
        text={text}
        isPlainText={isPlainText}
      />
    </TouchableOpacity>
  );
};
