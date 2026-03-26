import React from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";

import { deletePayment } from "../../../redux/actions/MoneyTracker/moneyTracker.actions";
// Components
import FormatDateTime from "../../../components/FormatDateTime";
import ModalDelete from "../../../components/Modal/ModalDelete";

const ItemPayment = ({ data }) => {
  const dispatch = useDispatch();
  const handleDeletedById = (id) => {
    dispatch(deletePayment(id));
  };
  return (
    <View style={styles.boxItem}>
      <View key={data?.id}>
        <Text style={styles.text}>{data?.description}</Text>
        <Text style={styles.text}>
          <FormattedMessage id="money-tracker.invoice.paid" />:{" "}
          {data?.paidAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          {data?.currencyCode}
        </Text>
        <Text style={styles.text}>
          <FormatDateTime datevalue={data?.paidOn} type={2} />
        </Text>
      </View>
      <>
        <ModalDelete
          id={data.id}
          description={"money-tracker.delete.payment.description.this"}
          checkTokenExpModal={(e) => console.log("first", e)}
          deleted={handleDeletedById}
          type={0}
        />
      </>
    </View>
  );
};
const styles = StyleSheet.create({
  boxItem: {
    borderLeftColor: "#17a2b8",
    borderColor: "#17a2b8",
    borderLeftWidth: 8,
    borderWidth: 1,
    borderRadius: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,

    backgroundColor: "#fff",

    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
export default ItemPayment;
