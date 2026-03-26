import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import http from "../../../../services/http";
import { p } from "../../../../asset/style/utilities.style";
import CustomInput from "../../../../components/Inputs/CustomInput";
import colors from "../../../../constants/Colors";
import flex from "../../../../asset/style/flex.style";
import { FormattedMessage } from "react-intl";
import useDebounce from "../../../../hooks/useDebounce";

const ModalInvoiceFormDropdown = ({
  name,
  handleChange,
  setIsInnerScrollActive,
  errors,
  values,
  isDisabled,
}) => {
  const [dropdownData, setDropdownData] = useState([]);
  const [dropdownVal, setDropdownVal] = useState(values.chooseProject);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedFunction] = useDebounce(handleProjectSearch, 400);

  useEffect(() => {
    if (values?.chooseProject !== "") {
      setDropdownVal(values.chooseProject);
    }
  }, [values.chooseProject]);

  async function handleProjectSearch(val) {
    setDropdownVal(val);
    if (val === "") {
      setIsSearching(false);
    }
    try {
      const res = await http.get(
        `/projects/globalsearch?searchType=0&search=${val.toLowerCase()}`
      );
      if (res && res.list) {
        const newArr = res.list.map((item) => ({
          label: item.project,
          value: item.projectId,
        }));
        if (newArr.length === 0 && val !== "") {
          setIsSearching(true);
        }
        setDropdownData(newArr);
      }
    } catch (error) {
      // console.log(error);
    }
  }

  const handleInputChange = (val) => {
    setDropdownVal(val);
    handleChange(val, "chooseProject");
    debouncedFunction(val);
  };

  const handleSelect = (val) => {
    setDropdownVal(val.label);
    handleChange(val.value, "projectId");
    handleChange(val.label, "chooseProject");
    setDropdownData([]);
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <CustomInput
        type="text"
        name={name}
        label="money-tracker.scan.form.chooseProject"
        placeholder="money-tracker.scan.form.chooseProject"
        value={dropdownVal}
        onChange={handleInputChange}
        // onfocus={() => setIsSearching(true)}
        validationMessage={errors.chooseProject}
        disabled={isDisabled}
      />
      {dropdownData?.length > 0 && (
                  <View style={styles.dropdownContainer}>
        <ScrollView
        style={{ maxHeight: 200 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
          
          // onTouchStart={() => setIsInnerScrollActive(true)}
          // onTouchEnd={() => setIsInnerScrollActive(false)}
          // onScrollEndDrag={() => setIsInnerScrollActive(false)}
         
        >
          {dropdownData.map((item) => (
            <Pressable
              key={item.value.toString()}
              onPress={() => handleSelect(item)}
              style={[styles.dropdownItem, flex.d_flex_center, flex.flex_start,flex.flex_wrap]}
            >
              <Text style={[styles.dropdownTextStyle, p[2]]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
           </View>
      )}
      {isSearching && dropdownData.length === 0 && (
        <View
        style={[styles.noItemsBox, flex.d_flex_center, flex.flex_start]}
        >
          <Text>
            <FormattedMessage id="projects.list.noItems" />
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default ModalInvoiceFormDropdown;

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
