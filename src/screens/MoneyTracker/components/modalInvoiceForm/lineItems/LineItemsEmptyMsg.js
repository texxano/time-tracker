import React from "react";
import { View, Text } from "react-native";
import { FormattedMessage } from "react-intl";
import flex from "../../../../../asset/style/flex.style";

const LineItemsEmptyMsg = () => {
  return (
    <View
      style={[
        flex.d_flex_center,
        { borderWidth: 1, borderColor: "#ebf0f3", height: 100 },
      ]}
    >
      <Text>
        <FormattedMessage id="document.task.collection.noItems" />
      </Text>
    </View>
  );
};

export default LineItemsEmptyMsg;
