import React, { useEffect, useState } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import http from "../../../../services/http";
import CustomInput from "../../../../components/Inputs/CustomInput";
import colors from "../../../../constants/Colors";
import { FormattedMessage } from "react-intl";
import { MaterialIcons } from "@expo/vector-icons";
import flex from "../../../../asset/style/flex.style";
import { ml, py } from "../../../../asset/style/utilities.style";
import useDebounce from "../../../../hooks/useDebounce";

const ModalInvoiceFormDropdownChooseContact = ({
  name,
  handleChange,
  setIsInnerScrollActive,
  errors,
  values,
  setClientUniqueCountryNumber,
  setValues,
}) => {
  const [dropdownVal, setDropdownVal] = useState(values.chooseContact || "");
  const [dropdownData, setDropdownData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [debouncedFunction] = useDebounce(fetchContacts, 400);

  useEffect(() => {
    if (values?.chooseContact !== "") {
      setDropdownVal(values.chooseContact);
    }
  }, [values.chooseContact]);

  // Fetch contacts based on search input
  async function fetchContacts(val) {
    try {
      const res = await http.get(`/contacts?search=${val.toLowerCase()}`);
      
      if (res?.list?.length) {
        const filtered = res.list.map((item) => ({
          label: {
            name: item?.name,
            address: item?.address,
            uniqueCountryNumber: item.uniqueCountryNumber,
          },
          value: item.id,
        }));
        setDropdownData(filtered);
        setIsSearching(false);
      } else {
        setDropdownData([]);
        setIsSearching(true);
      }
    } catch (error) {
      // Handle error silently
    }
  }

  const handleInputChange = (val) => {
    if (val === "") {
      setIsSearching(false);
      setDropdownData([]);
      setDropdownVal(val);
    } else {
      setDropdownVal(val);
      handleChange(val, "chooseContact");
      debouncedFunction(val);
    }
  };

  const handleSelect = (item) => {
    const label = `${item.label.name} - ${item.label.address}`;
    setDropdownVal(label);
    handleChange(label, "chooseContact");
    setValues((prev) => ({
      ...prev,
      contactName: item.label.name,
    }));
    setClientUniqueCountryNumber(item.label.uniqueCountryNumber);
    setDropdownData([]);
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <>
        <CustomInput
          type="text"
          name={name}
          label="money-tracker.scan.form.chooseContact"
          placeholder="money-tracker.scan.form.chooseContact"
          value={dropdownVal}
          onChange={handleInputChange}
          validationMessage={errors.chooseContact}
        />

        {/* Dropdown Data View */}
        {dropdownData.length > 0 && (
          <View style={styles.dropdownContainer}>
            <ScrollView
              style={{ maxHeight: 200 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true} // Important to allow nested scrolling
            >
              {dropdownData.map((item) => (
                <Pressable key={item.value.toString()} onPress={() => handleSelect(item)}>
                  <View style={[styles.dropdownItem, flex.d_flex_center, flex.flex_start,flex.flex_wrap]}>
                    <Text style={styles.itemText}>{item.label.name}</Text>
                    {item.label?.address && (
                      <View style={styles.itemAddress}>
                        <MaterialIcons
                          name="chevron-right"
                          size={20}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.addressText}>{item.label.address}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* "No Items" Message if Nothing Found */}
        {isSearching && dropdownData.length === 0 && (
          <View style={[styles.noItemsBox, flex.d_flex_center, flex.flex_start]}>
            <Text style={[ml[2]]}>
              <FormattedMessage id="projects.list.noItems" />
            </Text>
          </View>
        )}
      </>
    </KeyboardAvoidingView>
  );
};

export default ModalInvoiceFormDropdownChooseContact;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
  },
  dropdownContainer: {
    marginTop: -25,
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 4,
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
  dropdownItem: {
    borderBottomColor: colors.gray_150,
    borderBottomWidth: 1,
    padding: 10,
  },
  itemText: {
    fontSize: 16,
  },
  itemAddress: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noItemsBox: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray_150,
    zIndex: 10000, // Ensure the "no items" message appears on top
    elevation: 15, // Increase elevation for stronger Android shadow
    minHeight: 40,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginTop: -22,
  },
});
