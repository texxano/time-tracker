import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import flex from "../../../../../asset/style/flex.style";
import { ml, p } from "../../../../../asset/style/utilities.style";
import { FormattedMessage } from "react-intl";

const LineItemsCollapsible = ({
  title,
  itemsLength,
  children,
  setShowAddForm,

}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    itemsLength.length > 0 && setExpanded(true);
  }, [itemsLength]);
  return (
    <View style={[styles.container]}>
      <View style={[flex.d_flex_center, flex.flex_between]}>
        <View style={[flex.d_flex_center, flex.flex_start]}>
          <Text style={styles.headerText}>{title}</Text>
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={[
              flex.d_flex_center,
              ml[4],
              p[1],
              { backgroundColor: "#2196F3", borderRadius: 6 },
            ]}
          >
            <MaterialCommunityIcons name="plus" size={18} color="white" />
            <Text style={{ fontSize: 12, color: "#fff" }}>
              <FormattedMessage id="common.button.add" />
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setExpanded((prev) => !prev)}
          style={[styles.header, flex.d_flex_center, flex.flex_between]}
        >
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6c757d"
          />
        </TouchableOpacity>
      </View>
      {expanded && <View>{children}</View>}
    </View>
  );
};

export default LineItemsCollapsible;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  header: {
    position: "relative",

    padding: 15,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 16,
  },
  content: {
    backgroundColor: "#fff",
  },
});
