import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { TextMain } from "../Texts";
import { ButtonSm } from "../buttons/ButtonSm";
import flex from "../../asset/style/flex.style";
import { py } from "../../asset/style/utilities.style";
import colors from "../../constants/Colors";

interface ModalQRCheckinProps {
  showModal: boolean;
  onConfirm: () => void;
  isCheckout?: boolean;
  firstName?: string;
  lastName?: string;
  errorMode?: boolean;
}

const ModalQRCheckin: React.FC<ModalQRCheckinProps> = ({ 
  showModal, 
  onConfirm, 
  isCheckout = false,
  firstName,
  lastName,
  errorMode = false
}) => {
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={showModal}
      onRequestClose={onConfirm}
      statusBarTranslucent={true}
    >
      <View style={[modalStyle.centeredViewSmall, { 
        zIndex: 99999, 
        elevation: 99999
      }]}>
        <View style={modalStyle.modalView}>
          <View style={[{ minHeight: 180 }, flex.d_flex_between, py[5]]}>
            <View style={styles.contentContainer}>
              {fullName && !errorMode && (
                <TextMain 
                  text={fullName} 
                  isPlaintext={true}
                  numberOfLines={2}
                  customStyles={styles.nameText} 
                />
              )}
              
              <TextMain 
                text={errorMode ? "qr.error.notInLocation" : (isCheckout ? "common.goodbye" : "common.welcome.work")} 
                isPlaintext={false}
                numberOfLines={errorMode ? 3 : 1}
                customStyles={errorMode ? styles.errorText : styles.messageText} 
              />
            </View>

            <ButtonSm
              customStyles={{}}
              customTextStyles={{ color: colors.white }}
              text={"common.button.close"}
              isPlainText={false}
              handleClick={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 10,
  
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.black,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.black,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.error_100,
  },
});

export default ModalQRCheckin;
