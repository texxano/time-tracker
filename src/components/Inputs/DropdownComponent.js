import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Platform,
} from "react-native";
import colors from "../../constants/Colors";
import { useIntl } from "react-intl";
import { mr, p, px } from "../../asset/style/utilities.style";
import { Ionicons } from "@expo/vector-icons";
import flex from "../../asset/style/flex.style";
import { checkValOrReturnStr, generateUUID } from "../../utils/variousHelpers";

const DropdownComponent = ({
  name,
  disabled,
  value,
  onChange,
  items,
  placeholder,
  dropdownProps,
}) => {
  const intl = useIntl();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (val) => {
    onChange(val.value, name);
    setIsDropdownOpen(false);
    setShowModal(false);
  };

  const handleOpenDropdown = () => {
    if (Platform.OS === 'ios') {
      setShowModal(true);
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const renderVal = () => {
    let str = "";

    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      items.length > 0
    ) {
      const inx = items.findIndex(
        (el) => el.value.toString() === value.toString()
      );
      if (inx !== -1) {
        const checkValue = checkValOrReturnStr(items[inx]?.label);
        str = checkValue.toString();
      } else {
        str = "";
      }
    } else {
      str = placeholder
        ? intl.formatMessage({ id: placeholder })
        : "";
    }

    return (
      <Text numberOfLines={1} style={[styles.dropdownTextStyle, p[2]]}>
        {str}
      </Text>
    );
  };

  return (
    <View style={{ position: "relative", overflow: "visible" }}>
      <TouchableOpacity
        onPress={handleOpenDropdown}
        style={[
          styles.input,
          flex.d_flex_center,
          flex.flex_between,
          px[1],
          { backgroundColor: disabled ? colors.gray_80 : colors.white },
        ]}
        disabled={disabled}
      >
        {renderVal()}
        <Ionicons
          name={isDropdownOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.gray_400}
        />
      </TouchableOpacity>

      {isDropdownOpen && items.length > 0 && (
        <View
          style={[
            styles.shadowWrapper,
            dropdownProps?.directionBottom === "bottom"
              ? styles.containerBottomPosition
              : styles.containerTopPosition,
          ]}
        >
          <View style={styles.dropDownContainer}>
            <ScrollView
              scrollEnabled
              nestedScrollEnabled
              keyboardShouldPersistTaps="always"
            >
              {items.map((item, index) => {
                const isSelected = value === item.value;
                return (
                  <TouchableOpacity
                    key={isSelected ? generateUUID(12) : item.value.toString()}
                    onPress={() => handleSelect(item, index)}
                    style={[
                      styles.dropdownItem,
                      flex.d_flex_center,
                      flex.flex_between,
                    ]}
                  >
                    <Text style={[styles.dropdownTextStyle, p[2]]}>
                      {checkValOrReturnStr(item?.label)}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.gray_400}
                        style={mr[1]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {isDropdownOpen && items.length === 0 && (
        <View
          style={[
            styles.dropDownContainer,
            flex.d_flex_center,
            styles.emptyContainer,
            {
              top:
                dropdownProps?.directionBottom === "bottom"
                  ? 47
                  : -67,
            },
          ]}
        >
          <Text>
            {intl.formatMessage({
              id: "money-tracker.scan.form.nothingToShow",
            })}
          </Text>
        </View>
      )}

      {/* iOS Modal for dropdown selection */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showModal}
          transparent={true}
          animationType="slide"
          presentationStyle="overFullScreen"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {placeholder ? intl.formatMessage({ id: placeholder }) : "Select Option"}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalList}>
                {items.map((item, index) => {
                  const isSelected = value === item.value;
                  return (
                    <TouchableOpacity
                      key={isSelected ? generateUUID(12) : item.value.toString()}
                      onPress={() => handleSelect(item, index)}
                      style={[
                        styles.modalItem,
                        flex.d_flex_center,
                        flex.flex_between,
                        isSelected && styles.selectedModalItem
                      ]}
                    >
                      <Text style={[styles.modalItemText, isSelected && styles.selectedModalItemText]}>
                        {checkValOrReturnStr(item?.label)}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#007AFF"
                          style={mr[1]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  input: {
    height: 42,
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: colors.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray_100,
  },
  dropdownTextStyle: {
    fontSize: 12,
    width: "70%",
  },
  shadowWrapper: {
    position: "absolute",
    width: "100%",
    zIndex: 9999,
    backgroundColor: "#fff",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Android
    elevation: 8,
  },
  dropDownContainer: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray_100,
    overflow: "hidden",
  },
  dropdownItem: {
    borderBottomWidth: 1,
    borderColor: colors.gray_80,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  containerBottomPosition: {
    top: 47,
  },
  containerTopPosition: {
    top: -150,
  },
  emptyContainer: {
    backgroundColor: colors.gray_80,
    position: "absolute",
    borderRadius: 4,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedModalItem: {
    backgroundColor: '#f8f9ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedModalItemText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
