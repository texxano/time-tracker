/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import colors from "../../../../constants/Colors";
import flex from "../../../../asset/style/flex.style";

const ModalHandleScannerApisMsg = ({ showModal, close, type }) => {
  const handleCLose = () => {
    close();
  };

  return (
    <>
      <Modal transparent={true} visible={showModal}>
        <View style={[modalStyle.centeredView]}>
          <View style={styles.container}>
            <View style={styles.card}>
              <AntDesign
                name={type === "success" ? "checkcircle" : "closecircle"}
                size={50}
                color={
                  type === "success" ? colors.success_100 : colors.error_100
                }
              />
              <Text style={styles.title}>
                <FormattedMessage id="common.text.success" />
              </Text>
              {type === "success" ? (
                <Text style={styles.message}>
                  <FormattedMessage id="money-tracker.scan.successApisMsg" />
                </Text>
              ) : (
                <Text style={styles.message}>
                  <FormattedMessage id="money-tracker.scan.ErrorApisMsg" />
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  flex.d_flex_center,
                  type === "error" && { backgroundColor: colors.error_100 },
                ]}
                onPress={handleCLose}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    padding: 20,
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5, // For Android shadow
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.gray_500,
    marginTop: 10,
  },
  message: {
    fontSize: 16,
    color: colors.gray_400,
    textAlign: "center",
    marginVertical: 15,
  },
  button: {
    minWidth: 100,
    backgroundColor: colors.success_100,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonText1: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 11,
  },
});
export default ModalHandleScannerApisMsg;
