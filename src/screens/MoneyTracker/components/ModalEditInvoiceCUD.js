/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from "react-native";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import flex from "../../../asset/style/flex.style";
import ModalEditInvoiceForm from "./modalInvoiceForm/ModalEditInvoiceForm";

const ModalEditInvoiceCUD = ({ modal, setModal, data }) => {
  return (
    <>
      <Modal transparent={true} visible={modal}>
        <View style={[modalStyle.centeredView, flex.d_flex_center]}>
          <View style={[modalStyle.modalView]}>
            <View
              style={[
                modalStyle.modalViewTitle,
                flex.d_flex_center,
                flex.flex_between,
              ]}
            >
              <Text style={[modalStyle.modalTitle]}>
                <FormattedMessage id="money-tracker.edit.invoice" />;
              </Text>
            </View>

            <ModalEditInvoiceForm
              data={data}
              modal={modal}
              setModal={setModal}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ModalEditInvoiceCUD;

const styles = StyleSheet.create({
  btn: {
    width: 200,
    height: 60,
    borderWidth: 1,
    borderRadius: 8,
  },
});
