import React from "react";
import { Modal, View, ActivityIndicator } from "react-native";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { TextMain } from "../Texts";
import { ButtonSm } from "../buttons/ButtonSm";
import flex from "../../asset/style/flex.style";
import { py } from "../../asset/style/utilities.style";
import colors from "../../constants/Colors";

const CustomMessageModal = ({ 
  message, 
  type = "error", // "error", "success", "loading"
  showModal, 
  close,
  onSuccess 
}) => {


  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "loading":
        return null;
      default:
        return "ℹ";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "loading":
        return "#1976D2";
      default:
        return "#2196F3";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#E8F5E8";
      case "error":
        return "#FFEBEE";
      case "loading":
        return "#E3F2FD";
      default:
        return "#E3F2FD";
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={showModal}>
      <View style={[modalStyle.centeredViewSmall, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[modalStyle.modalView, { backgroundColor: getBackgroundColor() }]}>
          <View style={[{ minHeight: 150 }, flex.d_flex_between, py[5]]}>
            {type === "loading" ? (
              <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                <ActivityIndicator size="large" color={getIconColor()} />
                <TextMain 
                  text={message || "Processing..."} 
                  isPlaintext={true}
                  customStyles={{ marginTop: 16, textAlign: "center" }}
                />
              </View>
            ) : (
              <>
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  {getIcon() && (
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: getIconColor(),
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12
                    }}>
                      <TextMain 
                        text={getIcon()} 
                        isPlaintext={true}
                        customStyles={{ 
                          color: "white", 
                          fontSize: 24, 
                          fontWeight: "bold" 
                        }}
                      />
                    </View>
                  )}
                  <TextMain 
                    text={message} 
                    isPlaintext={true}
                    customStyles={{ textAlign: "center" }}
                    numberOfLines={10}
                  />
                </View>

                <ButtonSm
                  customTextStyles={{ color: colors.white }}
                  customStyles={{ marginTop: 16 }}
                  text={type === "success" ? "common.button.ok" : "common.button.close"}
                  handleClick={() => {
                    close();
                    if (type === "success" && onSuccess) {
                      onSuccess();
                    }
                  }}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomMessageModal; 