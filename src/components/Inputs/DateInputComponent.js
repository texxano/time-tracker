import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Modal,
} from "react-native";
import { FormattedMessage } from "react-intl";
import DatePicker from "react-native-neat-date-picker";
import FormatDateTime from "../FormatDateTime";
import flex from "../../asset/style/flex.style";
import { modalStyle } from "../../asset/style/components/modalStyle";

export const CustomDateInputComponent = ({
  onChange,
  name,
  value,
  placeholder,
  dateCustomProps,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(null);

  const onConfirm = (date) => {
    setShowDatePicker(false);
    if (date) {
      onChange(date.date.toISOString(), name);
    }
  };

  const handleOpenPicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };
  return (
    <>
      {showDatePicker && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
        >
          <View style={[modalStyle.centeredView, flex.d_flex_center]}>
            <DatePicker
              colorOptions={{ headerColor: "#2196F3" }}
              isVisible={showDatePicker}
              mode={"single"}
              onCancel={() => setShowDatePicker(false)}
              onConfirm={onConfirm}
              minDate={new Date()}
              withoutModal
              modalStyles={[{ zIndex: 999999 }, dateCustomProps.customStyles]}
            />
          </View>
        </Modal>
      )}
      <TouchableOpacity
        onPress={() => handleOpenPicker()}
        style={{
          width: "100%",
          borderColor: "#ccc",
          borderRadius: 4,
          padding: 10,
          borderWidth: 1,
          height: 47,
          marginTop: 3,
        }}
      >
        <Text>
          {value ? (
            <FormatDateTime datevalue={value} type={1} />
          ) : (
            <FormattedMessage id={placeholder} />
          )}
        </Text>
      </TouchableOpacity>
    </>
  );
};
