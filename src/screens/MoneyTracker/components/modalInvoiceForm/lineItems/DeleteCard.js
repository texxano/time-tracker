import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { mb, p } from "../../../../../asset/style/utilities.style";
import { modalStyle } from "../../../../../asset/style/components/modalStyle";
import flex from "../../../../../asset/style/flex.style";

const DeleteCard = ({
  color,
  setShowDeleteCard,
  name,
  index,
  handleDeleteProduct,
}) => {
  const intl = useIntl();
  const msg = intl.formatMessage({
    id: "document.task.delete.modal.description.this",
  });
  const subMsg = msg.lastIndexOf(" ");
  const final = msg.substring(0, subMsg);

  const msgProduct = intl.formatMessage({
    id: "money-tracker.scan.form.lineItems.productCode",
  });
  const subMsgProduct = msgProduct.lastIndexOf(" ");
  const finalProduct = msgProduct.substring(0, subMsgProduct);
  return (
    <View
      style={[
        styles.container,
        flex.d_flex_center,
        flex.flex_direction_column,
        p[2],
        { backgroundColor: color },
      ]}
    >
      <View style={[mb[5]]}>
        <Text
          style={[mb[2], { alignSelf: "center", fontSize: 12 }]}
        >{`${final} ${finalProduct.toLowerCase()}:`}</Text>
        <Text
          style={[{ alignSelf: "center", fontWeight: "bold", fontSize: 16 }]}
        >
          {` ${name || ""}`}
        </Text>
      </View>
      <View style={[flex.d_flex_center]}>
        <TouchableOpacity
          style={[modalStyle.button, modalStyle.buttonClose, { width: "40%" }]}
          onPress={() => setShowDeleteCard(false)}
        >
          <Text style={modalStyle.textStyle}>
            <FormattedMessage id="common.button.close" />
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[modalStyle.button, modalStyle.buttonDelete, { width: "40%" }]}
          onPress={() => {
            setShowDeleteCard(false);
            handleDeleteProduct(index);
          }}
        >
          <Text style={modalStyle.textStyle}>
            <FormattedMessage id="common.button.delete" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeleteCard;

const styles = StyleSheet.create({
  container: {
    height: 250,
  },
  label: { fontSize: 12, fontWeight: "bold", width: "50%" },
  text: { fontSize: 12, width: "50%", marginLeft: 3 },
});
