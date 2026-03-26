import React from "react";
import { Modal, View } from "react-native";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { TextMain } from "../Texts";
import { ButtonSm } from "../buttons/ButtonSm";
import flex from "../../asset/style/flex.style";
import { py } from "../../asset/style/utilities.style";
import colors from "../../constants/Colors";

const ModalShowMessage = ({ message, isPlaintext, showModal, close }) => {
  return (
    <>
      <Modal animationType="slide" transparent={true} visible={showModal}>
        <View style={modalStyle.centeredViewSmall}>
          <View style={modalStyle.modalView}>
            <View style={[{ minHeight: 150 }, flex.d_flex_between, py[5]]}>
              <TextMain text={message} isPlaintext={isPlaintext} />

              <ButtonSm
                customTextStyles={{ color: colors.white }}
                text={"common.button.close"}
                handleClick={close}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ModalShowMessage;
