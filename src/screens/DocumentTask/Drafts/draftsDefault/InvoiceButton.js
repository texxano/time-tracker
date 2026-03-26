import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextH2, TextH3 } from "../../../../components/Texts";
import { mb, my, p, px, py } from "../../../../asset/style/utilities.style";
import { useSelector } from "react-redux";
import flex from "../../../../asset/style/flex.style";
import colors from "../../../../constants/Colors";
import { AntDesign } from "@expo/vector-icons";

const InvoiceButton = ({ setLocationActive }) => {
  const { draftsInvoice } = useSelector((state) => state.documentTaskDrafts);
  return (
    <View>

        <TouchableOpacity
          style={[
            styles.unfinished,
            py[2],
            px[4],
            flex.d_flex_center,
            flex.flex_between,
          ]}
          onPress={() => setLocationActive("1")}
        >
          <TextH3
            customStyles={{ color: colors.gray_400, fontWeight: "600" }}
            text="invoice.tab.title"
          />

          <AntDesign size={18} name="arrowright"  color={colors.gray_400}/>
       
        </TouchableOpacity>

    </View>
  );
};

export default InvoiceButton;

const styles = StyleSheet.create({
  finished: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success_100,
    backgroundColor: colors.success_70,
  },
  unfinished: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray_100,
    backgroundColor: colors.white,
  },
});
