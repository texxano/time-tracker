import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { FormattedMessage } from "react-intl";
import { Ionicons } from "@expo/vector-icons";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import colors from "../../../../constants/Colors";
import { ml, mr } from "../../../../asset/style/utilities.style";

const ContactsDefault = ({
  data,
  showEdit,
  showDelete,
  showModal,
  closeModal,
}) => {
  return (
    <>
      {showModal && (
        <View
          style={[
            {
              width: "90%",
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 99999,
              backgroundColor: colors.gray_60,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.gray_150,
              minHeight: 40,
              maxHeight: 200,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 3,
            },
          ]}
        >
          <View style={modalStyle.modalEditUserClose}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 14,
                color: colors.gray_400,
              }}
            >
              {data.name}
            </Text>
            <TouchableOpacity style={[mr[2]]} onPress={closeModal}>
              <Ionicons name="close" size={24} color={colors.gray_400} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[modalStyle.modalTitleEditView]}
            onPress={showEdit}
          >
            <Text style={modalStyle.modalMoreTitlekUser}>
              <FormattedMessage id="common.button.edit" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyle.modalTitleEditView]}
            onPress={showDelete}
          >
            <Text style={modalStyle.modalMoreTitlekUser}>
              <FormattedMessage id="common.button.delete" />
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default ContactsDefault;
