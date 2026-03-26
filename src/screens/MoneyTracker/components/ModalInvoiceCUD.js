/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

// Redux
import { modalStyle } from "../../../asset/style/components/modalStyle";
import ModalInvoiceOcrScanner from "./ModalInvoiceOcrScanner";
import flex from "../../../asset/style/flex.style";
import { mb, mr, p } from "../../../asset/style/utilities.style";
import { AntDesign } from "@expo/vector-icons";
import ModalInvoiceForm from "./modalInvoiceForm/ModalInvoiceForm";

const ModalInvoiceCUD = ({ modal, setModal, projectId, data }) => {
  const [invoiceCreationWay, setInvoiceCreationWay] = useState("");
  const [scannedFormData, setScannedFormData] = useState();

  return (
    <>
      <Modal transparent={true} visible={modal}   animationType="slide">
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
                <FormattedMessage id="money-tracker.create.invoice" />
              </Text>

              {invoiceCreationWay === "" && (
                <TouchableOpacity
                  onPress={() => setModal(false)}
                  style={[mr[4]]}
                >
                  <AntDesign name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              )}
              {invoiceCreationWay !== "" && (
                <TouchableOpacity
                  onPress={() => {
                    setInvoiceCreationWay("");
                    setScannedFormData(null);
                  }}
                  style={[mr[4]]}
                >
                  <AntDesign name="back" size={24} color="#6c757d" />
                </TouchableOpacity>
              )}
            </View>
            {invoiceCreationWay === "" && (
              <View
                style={[
                  { height: 300 },
                  flex.d_flex_center,
                  flex.flex_direction_column,
                ]}
              >
                <TouchableOpacity
                  onPress={() => setInvoiceCreationWay("manually")}
                  style={[mb[6], p[2], styles.btn, flex.d_flex_center]}
                >
                  <Text style={{textAlign:'center'}}>
                    <FormattedMessage id="money-tracker.enter.manually" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setInvoiceCreationWay("scan")}
                  style={[mb[2], p[2], styles.btn, flex.d_flex_center]}
                >
                  <Text>
                    <FormattedMessage id="money-tracker.scan.invoice" />
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {invoiceCreationWay === "manually" && (
              <ModalInvoiceForm
                data={data}
                scannedFormData={scannedFormData}
                setScannedFormData={setScannedFormData}
                modal={modal}
                setModal={setModal}
                projectId={projectId}
                setInvoiceCreationWay={setInvoiceCreationWay}
              />
            )}

            {invoiceCreationWay === "scan" && (
              <ModalInvoiceOcrScanner
                setInvoiceCreationWay={setInvoiceCreationWay}
                setScannedFormData={setScannedFormData}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ModalInvoiceCUD;

const styles = StyleSheet.create({
  btn: {
    width: 200,
    height: 60,
    borderWidth: 1,
    borderRadius: 8,
  },
});
