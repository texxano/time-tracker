import React, { useEffect } from "react";
import { validateForm } from "./ValidateInfo";
import { useDispatch } from "react-redux";
import CustomInput from "../../../../../../../../components/Inputs/CustomInput";
import { modalStyle } from "../../../../../../../../asset/style/components/modalStyle";
import { ButtonCloseForm } from "../../../../../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../../../../../components/buttons/ButtonConfirmForm";
import { SingleInvoiceTaxInfo } from "../SingleInvoiceTaxInfo";
import useForm from "../../../../../../../../hooks/useForm";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import flex from "../../../../../../../../asset/style/flex.style";
import colors from "../../../../../../../../constants/Colors";
import { my, p } from "../../../../../../../../asset/style/utilities.style";
import { TextH3 } from "../../../../../../../../components/Texts";

export const EditInovice = ({ close, invoice, showModal }) => {
  const dispatch = useDispatch();
  const defaultFormValues = {
    isInternal: invoice.isInternal.toString(),
    date: invoice.date.toString(),
    totalPrice: invoice.totalPrice.toString(),
    clientUniqueCountryNumber: invoice.clientUniqueCountryNumber.toString(),
    clientInfo: invoice.clientInfo.toString(),
    canBeDenied: invoice.canBeDenied.toString(),
    cannotBeDenied: invoice.cannotBeDenied.toString(),
    notes: invoice.notes.toString(),
    invoiceNumber: invoice.invoiceNumber.toString(),
  };
  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    defaultFormValues,
    validateForm,
    submitForm
  );
//  console.log(invoice, 'inovice')
//   useEffect(() => {
//     const {
//       canBeDenied,
//       cannotBeDenied,
//       clientInfo,
//       clientUniqueCountryNumber,
//       date,
//       invoiceNumber,
//       totalPrice,
//       notes,
//       isInternal,
//     } = invoice;
//     canBeDenied && setValues((prevState) => ({ ...prevState, canBeDenied }));
//     cannotBeDenied &&
//       setValues((prevState) => ({ ...prevState, cannotBeDenied }));
//     clientInfo && setValues((prevState) => ({ ...prevState, clientInfo }));
//     clientUniqueCountryNumber &&
//       setValues((prevState) => ({ ...prevState, clientUniqueCountryNumber }));
//     date && setValues((prevState) => ({ ...prevState, date }));
//     invoiceNumber &&
//       setValues((prevState) => ({ ...prevState, invoiceNumber }));
//     totalPrice && setValues((prevState) => ({ ...prevState, totalPrice }));
//     notes && setValues((prevState) => ({ ...prevState, notes }));
//     isInternal && setValues((prevState) => ({ ...prevState, isInternal }));
//   }, [invoice]);

  function submitForm() {
    close();

  }
  return (
    <Modal transparent={true} visible={showModal}>
      <View style={[modalStyle.centeredView, flex.d_flex_center]}>
        <View style={[modalStyle.modalView]}>
          <View style={[styles.container, p[3]]}>
            <TextH3 text="money-tracker.edit.invoice" customStyles={[my[10]]} />
            <ScrollView>
              <CustomInput
                type="number"
                name="invoiceNumber"
                label="document.task.collection.drafts.invoices.invoiceNumber"
                placeholder="document.task.collection.drafts.invoices.invoiceNumber"
                value={values.invoiceNumber}
                onChange={handleChange}
                disabled
              />

              <CustomInput
                type="date"
                name="date"
                label="Due.Date.Title"
                placeholder="Due.Date.Title"
                value={values.date}
                onChange={handleChange}
                dateCustomProps={{height:400, customStyles:{left:-42.2}}}
              />
              <CustomInput
                type="number"
                name="totalPrice"
                label="document.task.collection.drafts.invoices.invoiceNumber"
                placeholder="document.task.collection.drafts.invoices.invoiceNumber"
                value={values.totalPrice}
                onChange={handleChange}
                disabled
              />
              <CustomInput
                type="number"
                name="clientUniqueCountryNumber"
                label="document.task.collection.drafts.invoices.uniqueCountryNumber"
                placeholder="document.task.collection.drafts.invoices.uniqueCountryNumber"
                value={values.clientUniqueCountryNumber}
                onChange={handleChange}
                disabled
              />

              <CustomInput
                type="number"
                name="canBeDenied"
                label="document.task.collection.drafts.invoices.canBeDenied"
                placeholder="document.task.collection.drafts.invoices.canBeDenied"
                value={values.canBeDenied}
                onChange={handleChange}
                validationMessage={errors.canBeDenied}
              />

              <CustomInput
                type="number"
                name="notes"
                label="document.task.collection.drafts.invoices.notes"
                placeholder="document.task.collection.drafts.invoices.notes"
                value={values.notes}
                onChange={handleChange}
              />

              <CustomInput
                type="number"
                name="cannotBeDenied"
                label="document.task.collection.drafts.invoices.cannotBeDenied"
                placeholder="document.task.collection.drafts.invoices.cannotBeDenied"
                value={values.cannotBeDenied}
                onChange={handleChange}
                validationMessage={errors.cannotBeDenied}
              />
              {invoice.taxInfoJson && invoice.taxInfoJson !== "null" && (
                <SingleInvoiceTaxInfo taxInfoJson={invoice.taxInfoJson} />
              )}

              <View style={[modalStyle.ModalBottom]}>
                <ButtonCloseForm onPress={close} />
                <ButtonConfirmForm onPress={handleSubmit} />
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: "80%",
    backgroundColor: colors.white,
    borderRadius: 9,
  },
  box: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
});
