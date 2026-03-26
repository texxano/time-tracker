import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../../../../../../constants/Colors";
import { generateUUID } from "../../../../../../../utils/variousHelpers";
import { FormattedMessage } from "react-intl";
import flex from "../../../../../../../asset/style/flex.style";
import { MkHeaderSubSubRow } from "./MkHeaderSubSubRow";
import { p } from "../../../../../../../asset/style/utilities.style";

export const MkHeadeSubRows = ({ subrow }) => {
  return (
    <>
      <View style={[styles.borderRight]}>
        <View style={[flex.d_flex_center, p[3], { height: 50 }]}>
          <Text key={generateUUID(43)} style={[styles.textStyle]}>
            <FormattedMessage id={subrow.name} />
          </Text>
        </View>

        <View
          style={[
            { height: 70, backgroundColor: colors.gray_70 },
            flex.d_flex_center,
          ]}
        >
          {subrow.arr.length > 0 &&
            subrow.arr.map((subheader, index) => {
              if (typeof subheader === "object") {
                return (
                  <MkHeaderSubSubRow
                    subsubrow={subheader}
                    isLastIndex={index !== subrow.arr.length - 1}
                  />
                );
              } else {
                return (
                  <View
                    style={[
                      { height: 70, backgroundColor: colors.gray_80 },
                      p[3],
                      flex.d_flex_center,
                      styles.widthCeil_3,
                      index !== subrow.arr.length - 1 && styles.borderRight,
                    ]}
                  >
                    <Text
                      key={generateUUID(10)}
                      style={[{ fontWeight: "bold", fontSize: 13 }]}
                    >
                      <FormattedMessage id={subheader} />
                    </Text>
                  </View>
                );
              }
            })}
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: colors.gray_100,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_400,
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: colors.gray_600,
  },
  textStyle: { fontSize: 16, fontWeight: "bold" },
  widthCeil_1: {
    width: 180,
  },

  widthCeil_3: {
    width: 150,
  },
});
