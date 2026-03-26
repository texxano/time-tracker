import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../../../../../../constants/Colors";
import { FormattedMessage } from "react-intl";
import { generateUUID } from "../../../../../../../utils/variousHelpers";
import flex from "../../../../../../../asset/style/flex.style";

export const MkHeaderSubSubRow = ({ subsubrow, isLastIndex }) => {
  return (
    <>
      <View style={[isLastIndex && styles.borderRight, { height: 70 }]}>
        <View
          style={[
            flex.d_flex_center,
            {
              height: 35,
              borderBottomWidth: 1,
              borderColor: colors.gray_400,
            },
          ]}
        >
          <Text
            key={generateUUID(13)}
            style={{ fontWeight: "bold", fontSize: 16 }}
          >
            {subsubrow.name}
          </Text>
        </View>

        <View style={[flex.d_flex_center, { minWidth: 130 }]}>
          {subsubrow.arr.length > 0 &&
            subsubrow.arr.map((subheader, index) => {
              return (
                <View
                  style={[
                    flex.d_flex_center,

                    ,
                    {
                      minWidth: 130,
                      height: 35,
                      alignSelf: "center",
                      backgroundColor: colors.gray_80,
                    },
                    styles.widthCeil_4,
                    index !== subsubrow.arr.length - 1 && styles.borderRight,
                  ]}
                >
                  <Text key={generateUUID(13)} style={[styles.textStyle]}>
                    <FormattedMessage id={subheader} />
                  </Text>
                </View>
              );
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

  widthCeil_4: {
    width: 150.5,
  },
});
