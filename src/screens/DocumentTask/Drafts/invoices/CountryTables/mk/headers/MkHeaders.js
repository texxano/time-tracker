import React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { generateUUID } from "../../../../../../../utils/variousHelpers";
import colors from "../../../../../../../constants/Colors";
import { p } from "../../../../../../../asset/style/utilities.style";
import flex from "../../../../../../../asset/style/flex.style";
import { headerContent } from "./constants";
import { MkHeadeSubRows } from "./MkHeadeSubRows";

const MkHeaders = () => {
  return (
    <View style={[styles.row]}>
      {headerContent.map((header, index) => {
        if (typeof header === "object") {
          return <MkHeadeSubRows subrow={header} />;
        } else {
          return (
            <View
              key={generateUUID(14)}
              style={[
                p[3],
                styles.borderRight,
                flex.d_flex_center,
                { height: 120 },
                index === 0 && styles.widthCeil_1,
                index === 1 && styles.widthCeil_2,
                index === 4 && styles.widthCeil_3,
                index === 5 && styles.widthCeil_3,
                index === 6 && styles.widthCeil_3,
              ]}
            >
              <Text style={[{ fontWeight: "bold", fontSize: 16 }]}>
                <FormattedMessage id={header} />
              </Text>
            </View>
          );
        }
      })}
    </View>
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
  widthCeil_2: {
    width: 150,
  },
  widthCeil_3: {
    width: 150,
  },
  widthCeil_4: {
    width: 150.5,
  },
});

export default MkHeaders;
