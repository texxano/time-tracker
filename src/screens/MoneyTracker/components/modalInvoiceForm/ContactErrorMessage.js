/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import flex from "../../../../asset/style/flex.style";
import colors from "../../../../constants/Colors";
import { mb, my } from "../../../../asset/style/utilities.style";

const ContactErrorMessage = ({ showModal, close, showContactError }) => {
  const handleCLose = () => {
    close();
  };

  return (
    <>
      <Modal transparent={true} visible={showModal}>
        <View style={[modalStyle.centeredView]}>
          <View style={styles.container}>
            <View style={styles.card}>
              <AntDesign name="warning" size={50} color={colors.error_100} />
              <Text style={styles.title}>
                <FormattedMessage id="money-tracker.scan.rejected" />
              </Text>
              <Text style={styles.message}>
                <FormattedMessage id="money-tracker.scan.contactError1" />
              </Text>

              <Text
                style={[
                  {
                    color: colors.error_100,
                    fontSize: 18,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    textAlign: "center",
                  },
                  my[5],
                ]}
              >
                {showContactError.vendor}
              </Text>
              <Text
                style={[
                  {
                    color: colors.error_100,
                    fontSize: 18,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    textAlign: "center",
                  },
                  mb[2],
                ]}
              >
                {showContactError.customer}
              </Text>
              <Text style={[styles.message, my[2]]}>
                <FormattedMessage id="money-tracker.scan.contactError2" />
              </Text>

              <TouchableOpacity
                style={[styles.button, flex.d_flex_center]}
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
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: colors.gray_400,
    textAlign: "center",
  },
  button: {
    minWidth: 100,
    backgroundColor: colors.warning_100,
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
export default ContactErrorMessage;
