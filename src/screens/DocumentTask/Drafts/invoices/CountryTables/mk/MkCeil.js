import React from "react";
import { StyleSheet, Text, View } from "react-native";
import flex from "../../../../../../asset/style/flex.style";
import { px } from "../../../../../../asset/style/utilities.style";
import colors from "../../../../../../constants/Colors";


const MkCeil = ({ customStyle, text }) => {
  return (
    <View
      style={[
        flex.d_flex_center,
        flex.flex_start,
        px[2],
        styles.borderRight,
        customStyle,
      ]}
    >
      <Text
        style={[
          {
            fontWeight: "600",
          },
        ]}
      >
        {text ? text.toString() : ""}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  borderRight: {
    borderRightWidth: 1,
    borderColor: colors.gray_400,
  },
});

export default MkCeil;
