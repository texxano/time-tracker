/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import flex from "../../../../asset/style/flex.style";
import colors from "../../../../constants/Colors";
import { ml, mt, px, py } from "../../../../asset/style/utilities.style";
import { Checkbox } from "native-base";
import { NavigationService } from "../../../../navigator";
import { check } from "../../../../utils/statusUser";
import { useDispatch } from "react-redux";
import { showSuccessScannerMsg } from "../../../../redux/actions/MoneyTracker/moneyTracker.actions";

const ScannerMessage = ({ showModal, close }) => {
  const [checkVal, setCheckVal] = useState(false);
  const dispatch = useDispatch();

  const handleCLose = () => {
    dispatch(showSuccessScannerMsg(!checkVal));
    close();
  };

  return (
    <>
      <Modal transparent={true} visible={showModal}>
        <View style={[modalStyle.centeredView]}>
          <View style={styles.container}>
            <View style={styles.card}>
              <AntDesign
                name="checkcircle"
                size={50}
                color={colors.success_100}
              />
              <Text style={styles.title}>
                <FormattedMessage id="common.text.success" />
              </Text>
              <Text style={styles.message}>
                <FormattedMessage id="money-tracker.scan.successMsg" />
              </Text>

              <TouchableOpacity
                style={[styles.button, flex.d_flex_center]}
                onPress={handleCLose}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
              <View style={[flex.d_flex_center, flex.flex_between, mt[5]]}>
                <Checkbox
                  onChange={() => setCheckVal(!checkVal)}
                  value={checkVal}
                />
                <Text style={[ml[2], { fontSize: 11 }]}>
                  <FormattedMessage id="money-tracker.dontShowMessage" />
                </Text>
              </View>
              <View style={[flex.flex_start, mt[5], { width: "100%" }]}>
                <TouchableOpacity
                  style={[
                    flex.d_flex_center,
                    flex.flex_between,
                    px[2],
                    py[1],
                    {
                      backgroundColor: colors.warning_200,
                      borderRadius: 6,
                      width: 150,
                    },
                  ]}
                  onPress={() => {
                    NavigationService.navigate("Dashboard", {
                      navigateRefresh: check(),
                    });
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color="white" />
                  <Text style={styles.buttonText1}>
                    <FormattedMessage id="money-tracker.scan.form.goBack" /> (
                    <FormattedMessage id="dashboard.title" /> )
                  </Text>
                </TouchableOpacity>
              </View>
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
export default ScannerMessage;
