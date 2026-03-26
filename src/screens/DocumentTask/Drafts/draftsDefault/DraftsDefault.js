import React from "react";
import { StyleSheet, View } from "react-native";
import InvoiceButton from "./InvoiceButton";
import colors from "../../../../constants/Colors";
import { TextH2 } from "../../../../components/Texts";
import { mb, my } from "../../../../asset/style/utilities.style";

const DraftsDefault = ({ setLocationActive }) => {
  return (
    <View style={styles.container}>
      <View style={[my[3], mb[5]]}>
        <TextH2 text="document.task.collection.drafts.invoices.unfinishedTasks" />
      </View>
      <InvoiceButton setLocationActive={setLocationActive} />
    </View>
  );
};

export default DraftsDefault;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    backgroundColor: colors.gray_70,
  },
});
