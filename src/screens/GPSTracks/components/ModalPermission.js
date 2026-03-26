import React from "react";
import {
  Text,
  Modal,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Box } from "native-base";
import { FormattedMessage } from "react-intl";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { my, p } from "../../../asset/style/utilities.style";
import colors from "../../../constants/Colors";

const ModalPermission = ({ modalVisible, setModalVisible, handleConfirm }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Box style={modalStyle.centeredView}>
          <Box style={modalStyle.modalView}>
            <Box style={modalStyle.modalViewTitle}>
              <Text style={modalStyle.modalTitle}>
                <FormattedMessage
                  id="permission.modal.title"
                  defaultMessage="Permission Required"
                />
              </Text>
            </Box>

            <Box style={[modalStyle.modalInput, p[4]]}>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                <FormattedMessage
                  id="permission.modal.message"
                  defaultMessage="Texxano collects location data to enable tracking even when the app is closed or not in use. This data helps provide accurate task monitoring and real-time updates."
                />
              </Text>

              {Platform.OS === "android" && (
                <Text style={[{ fontWeight: "bold", paddingTop: 10, backgroundColor:colors.success_80, borderRadius:9 },p[2], my[8]]}>
                  <FormattedMessage id="permission.modal.androidInstructions" />
                </Text>
              )}

              {Platform.OS === "android" && (
                <TouchableOpacity
                  style={[modalStyle.button, modalStyle.buttonAdd, my[8]]}
                  onPress={() => handleConfirm()}
                >
                  <Text style={modalStyle.textStyle}>
                    <FormattedMessage id="Request.Permissions.from.Here" />
                  </Text>
                </TouchableOpacity>
              )}
            </Box>

            <Box style={modalStyle.ModalBottom}>
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={modalStyle.textStyle}>
                  <FormattedMessage
                    id="common.button.close"
                    defaultMessage="Close"
                  />
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalPermission;
