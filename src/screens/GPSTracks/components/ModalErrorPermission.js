import React from "react";

import {
  Text,
  Modal,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Box } from "native-base";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { p } from "../../../asset/style/utilities.style";

const ModalErrorPermission = ({ modalVisible, setModalVisible, message }) => {
  return (
    <>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box style={modalStyle.centeredView}>
            <Box style={modalStyle.modalView}>
              <Box style={modalStyle.modalViewTitle}>
                <Text style={modalStyle.modalTitle}>Permission</Text>
              </Box>
              <Box style={[modalStyle.modalInput, p[4]]}>
                <Text style={{ fontSize: 16 }}>{message}</Text>
              </Box>
              <Box style={modalStyle.ModalBottom}>
                <TouchableOpacity
                  style={[modalStyle.button, modalStyle.buttonAdd]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={modalStyle.textStyle}>OK</Text>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default ModalErrorPermission;
