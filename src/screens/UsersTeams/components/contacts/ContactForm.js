import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import { Box } from "native-base";
import { useDispatch } from "react-redux";
import {
  createContact,
  updateContact,
} from "../../../../redux/actions/UsersTeams/contacts.actions";
import useForm from "../../../../hooks/useForm";
import { validateForm } from "./validateInfo";
import CustomInput from "../../../../components/Inputs/CustomInput";
import { ButtonCloseForm } from "../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../components/buttons/ButtonConfirmForm";

const ContactForm = ({ data, editMode, showModal, closeModal }) => {
  const intl = useIntl();
  const company = intl.formatMessage({ id: "users.contacts.company" });
  const person = intl.formatMessage({ id: "users.contacts.person" });
  const dispatch = useDispatch();
  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    {
      contactType: "",
      name: "",
      address: "",
      email: "",
      phoneNumber: "",
      uniqueCountryNumber: "",
    },
    validateForm,
    submitForm
  );

  const [dropdownData] = useState([
    {
      label: company,
      value: "0",
    },
    {
      label: person,
      value: "1",
    },
  ]);

  useEffect(() => {
    if (editMode && data) {
      data.name &&
        setValues((prevState) => ({ ...prevState, name: data.name }));
      data.address &&
        setValues((prevState) => ({ ...prevState, address: data.address }));
      data.type !== undefined &&
        setValues((prevState) => ({
          ...prevState,
          contactType: data.type.toString(),
        }));
      data.email &&
        setValues((prevState) => ({ ...prevState, email: data.email }));
      data.phoneNumber &&
        setValues((prevState) => ({
          ...prevState,
          phoneNumber: data.phoneNumber,
        }));
      data.uniqueCountryNumber &&
        setValues((prevState) => ({
          ...prevState,
          uniqueCountryNumber: data.uniqueCountryNumber,
        }));
    }
  }, [editMode, data]);

  function submitForm() {
    const payload = {
      type: Number(values.contactType),
      name: values.name,
      address: values.address,
      email: values.email,
      phoneNumber: values.phoneNumber,
      uniqueCountryNumber: values.uniqueCountryNumber,
    };
    if (editMode) {
      dispatch(updateContact({ ...payload, id: data.id }));
      closeModal();
    } else {
      dispatch(createContact(payload));
      closeModal();
    }
  }
  const addText = intl.formatMessage({ id: "common.button.add" });
  // useEffect(() => {
  //   closeModal()
  // }, [])

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={showModal}
        presentationStyle="fullScreen"
        onRequestClose={closeModal} // also helps Android back button
      >
        <View style={[modalStyle.centeredView]}>
          <View style={modalStyle.modalView}>
            <View style={modalStyle.modalViewTitle}>
              <Text style={modalStyle.modalTitle}>
                {editMode ? (
                  <FormattedMessage id="users.edit.title" />
                ) : (
                  addText
                )}
              </Text>
            </View>
            <View style={{ position: "relative", width: "100%" }}>
              <ScrollView  keyboardShouldPersistTaps="handled">
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  style={{ flex: 1 }}
                >
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                      <Box
                        style={[
                          modalStyle.modalInput,
                          { paddingHorizontal: 17, position: "relative" },
                        ]}
                      >
                        <CustomInput
                          type="dropdown"
                          label="comments.select"
                          name="contactType"
                          placeholder="comments.select"
                          data={dropdownData}
                          value={values.contactType}
                          onChange={handleChange}
                          dropdownProps={{ directionBottom: "bottom" }}
                          validationMessage={errors.contactType}
                          customWrapperStyles={{ zIndex: 99999 }}
                        />

                        <CustomInput
                          type="text"
                          label="Time.Shift.form.name.placeholder"
                          name="name"
                          value={values.name}
                          validationMessage={errors.name}
                          onChange={handleChange}
                        />

                        <CustomInput
                          type="text"
                          label="projects.form.address.placeholder"
                          name="address"
                          value={values.address}
                          validationMessage={errors.address}
                          onChange={handleChange}
                        />
                        <CustomInput
                          type="text"
                          label="projects.form.users.email.placeholder"
                          name="email"
                          value={values.email}
                          validationMessage={errors.email}
                          onChange={handleChange}
                        />
                        <CustomInput
                          type="number"
                          label="projects.form.users.phoneNumber.placeholder"
                          name="phoneNumber"
                          value={values.phoneNumber}
                          validationMessage={errors.phoneNumber}
                          onChange={handleChange}
                        />

                        {values.contactType === "0" && (
                          <CustomInput
                            type="number"
                            name="uniqueCountryNumber"
                            label="unique.country.number"
                            value={values.uniqueCountryNumber}
                            validationMessage={errors.uniqueCountryNumber}
                            onChange={handleChange}
                          />
                        )}
                      </Box>
                      <Box style={modalStyle.ModalBottom}>
                        <ButtonCloseForm onPress={closeModal} />
                        <ButtonConfirmForm onPress={handleSubmit} />
                      </Box>
                    </View>
                  </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ContactForm;
