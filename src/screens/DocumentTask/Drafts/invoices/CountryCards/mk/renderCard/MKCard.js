import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { dateFormat } from "../../../../../../../utils/dateFormat";
import CardSlot from "./CardSlot";
import colors from "../../../../../../../constants/Colors";
import {
  mb,
  p,
  px,
  py,
} from "../../../../../../../asset/style/utilities.style";
import { AntDesign, Feather } from "@expo/vector-icons";
import { TextMain } from "../../../../../../../components/Texts";
import flex from "../../../../../../../asset/style/flex.style";
import { ModalCardInvoice } from "./modalInvoice/ModalCardInvoice";
import { useOutsideClick } from "../../../../../../../hooks/usePutsideClick";

export const MkCard = ({ item, handlePress, viewMode }) => {
  const [showEditButtons, setShowEditButtons] = useState(false);
  const [showSaveBookForm, setShowSaveBookForm] = useState(false);
  const {
    clientInfo,
    clientUniqueCountryNumber,
    date,
    invoiceNumber,
    totalPrice,
  } = item;

  return (
    <View style={{ position: "relative" }}>
      {showSaveBookForm && (
        <ModalCardInvoice
          invoice={item}
          showEditButtons={showSaveBookForm}
          close={() => setShowSaveBookForm(false)}
        />
      )}
      {showEditButtons && (
        <View style={[styles.saveModal, py[3]]}>
          <TouchableOpacity
            style={[
              flex.d_flex_center,
              flex.flex_between,
              px[2],
              { height: 35, backgroundColor: colors.success_100 },
            ]}
            onPress={() => {
              setShowSaveBookForm(true);
              setShowEditButtons(false);
            }}
          >
            <TextMain
              text="common.button.save"
              customStyles={{ color: colors.white }}
            />
            <AntDesign name="save" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
      {item ? (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          style={[styles.card, mb[4]]}
        >
          <CardSlot
            label={"document.task.collection.drafts.invoices.invoiceNumber"}
            text={invoiceNumber || "/"}
          />
          <CardSlot
            label={"document.task.collection.drafts.invoices.contact"}
            text={clientInfo || "/"}
          />
          <CardSlot
            label={
              "document.task.collection.drafts.invoices.uniqueCountryNumber"
            }
            text={clientUniqueCountryNumber || "/"}
          />
          <CardSlot
            label={"document.task.collection.drafts.invoices.totalPrice"}
            text={parseFloat(totalPrice).toFixed(2) || "/"}
          />
          <CardSlot label={"Date"} text={dateFormat(date) || "/"} />
          {!viewMode && (
            <TouchableOpacity
              onPress={() => setShowEditButtons(!showEditButtons)}
              style={[{ position: "absolute", right: 0, top: 4 }]}
            >
              <Feather name="more-vertical" size={24} color={colors.gray_400} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ) : null}
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
  saveModal: {
    width: 100,
    height: 70,
    backgroundColor: colors.gray_70,
    borderRadius: 8,
    position: "absolute",
    top: 0,
    right: 20,
    zIndex: 99999,
    elevation: 5,
  },
  card: {
    position: "relative",
    height: 170,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 25,

    // Box shadow for iOS
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Box shadow for Android
    elevation: 5,
  },
});
