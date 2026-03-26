import React from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { documentTaskBooksServices } from "../../../../services/DocumentTask/documentTaskBook.Services";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import useForm from "../../../../hooks/useForm";
import { validateForm } from "./ValidateInfo";
import CustomInput from "../../../../components/Inputs/CustomInput";
import { ButtonCloseForm } from "../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../components/buttons/ButtonConfirmForm";
import { m, my, px } from "../../../../asset/style/utilities.style";

import { AntDesign } from "@expo/vector-icons";
import flex from "../../../../asset/style/flex.style";
import colors from "../../../../constants/Colors";

const colorsCircles = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F1C40F",
  "#9B59B6",
  "#E74C3C",
  "#1ABC9C",
  "#2980B9",
  "#8E44AD",
  "#34495E",
];

const CreateBookForm = ({ close, showModal, setReloadApi }) => {
  const defaultFormValues = {
    name: "",
    bookType: "",
    color: "",
    entryPrefix: "",
    entrySuffix: "",
    startingNumber: 0,
  };
  const dropdownData = [
    { label: "Book with DMs", value: "dmc" },
    { label: "book for invoices", value: "invoices" },
  ];
  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    defaultFormValues,
    validateForm,
    submitForm
  );

  function submitForm() {
    try {
      const payload = {
        name: values.name,
      };
      if (values.bookType === "invoice") {
        values.entryPrefix ? (payload.entryPrefix = values.entryPrefix) : "/";
        values.entrySuffix ? (payload.entrySuffix = values.entrySuffix) : "/";
        values.color ? (payload.color = values.color) : colors[0];
        documentTaskBooksServices
          .createDocumentTaskInvoiceBook(payload)
          .then(() => {
            setReloadApi(new Date());
            setValues(defaultFormValues);
            close();
          });
      } else {
        values.color ? (payload.color = values.color) : colors[0];
        documentTaskBooksServices.createDocumentTaskBook(payload).then(() => {
          setReloadApi(new Date());
          setValues(defaultFormValues);
          close();
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      style={{ height: 500 }}
    >
      <View style={modalStyle.centeredView}>
        <View style={modalStyle.modalView}>
          <View style={modalStyle.modalViewTitle}>
            <Text style={modalStyle.modalTitle}>
              <FormattedMessage id="document.task.collection.create" />
            </Text>
          </View>
          <View
            style={[
              modalStyle.modalInput,
              modalStyle.paddingBottom60,
              { paddingHorizontal: 17 },
            ]}
          >
            <View style={[my[2]]}>
              <CustomInput
                type="dropdown"
                label="select.book"
                name="bookType"
                placeholder="select.book"
                data={dropdownData}
                value={values.bookType}
                onChange={handleChange}
                validationMessage={errors.bookType}
                dropdownProps={{ directionBottom: "bottom" }}
              />
            </View>
            <CustomInput
              type="text"
              name="name"
              label="Time.Shift.form.name.placeholder"
              placeholder="Time.Shift.form.name.placeholder"
              value={values.name}
              onChange={handleChange}
              validationMessage={errors.name}
            />
            {values.bookType === "invoices" && (
              <View>
                <View
                  style={[
                    flex.d_flex_center,
                    flex.flex_alignself,
                    { width: "50%" },
                  ]}
                >
                  <CustomInput
                    type="number"
                    name="startingNumber"
                    label="startingNumber"
                    placeholder="archive.sign.collection.name"
                    value={values.startingNumber}
                    onChange={handleChange}
                  />
                </View>
                <View
                  style={[
                    flex.d_flex_center,
                    flex.space_evenly,
                    { width: "100%" },
                  ]}
                >
                  <View
                    style={[
                      flex.d_flex_center,
                      flex.flex_between,
                      { width: "40%" },
                    ]}
                  >
                    <CustomInput
                      type="text"
                      name="entryPrefix"
                      label="prefix"
                      placeholder="prefix"
                      value={values.entryPrefix}
                      onChange={handleChange}
                    />
                  </View>

                  <View
                    style={[
                      flex.d_flex_center,
                      flex.flex_between,
                      { width: "40%" },
                    ]}
                  >
                    <CustomInput
                      type="text"
                      name="entrySuffix"
                      label="suffix"
                      placeholder="suffix"
                      value={values.entrySuffix}
                      onChange={handleChange}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
          <View
            style={[
              flex.d_flex_center,
              flex.flex_wrap,
              px[3],
              { width: "100%" },
            ]}
          >
            {colorsCircles.map((el, inx) => {
              return (
                <View key={el} style={{ position: "relative" }}>
                  <TouchableOpacity
                    onPress={() => handleChange(el, "color")}
                    style={[
                      m[2],
                      {
                        width: 46,
                        height: 46,
                        borderRadius: 50,
                        backgroundColor: el,
                      },
                      values.color === el && {
                        shadowOpacity: 0.8,
                        opacity: 0.8,
                      },
                    ]}
                  />
                  {values.color === el && (
                    <AntDesign
                      name="check"
                      size={20}
                      color={colors.success_100}
                      style={[
                        {
                          position: "absolute",
                          backgroundColor: colors.white,
                          borderRadius: 50,
                          top: 18,
                          left: 18,
                          padding: 3,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <View style={[modalStyle.ModalBottom]}>
            <ButtonCloseForm
              onPress={() => {
                close();
                setValues(defaultFormValues);
              }}
            />
            <ButtonConfirmForm onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  box: {
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default CreateBookForm;
