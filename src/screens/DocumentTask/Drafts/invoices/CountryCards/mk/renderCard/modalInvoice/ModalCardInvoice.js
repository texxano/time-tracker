import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import flex from "../../../../../../../../asset/style/flex.style";
import { modalStyle } from "../../../../../../../../asset/style/components/modalStyle";
import { ButtonCloseForm } from "../../../../../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../../../../../components/buttons/ButtonConfirmForm";
import { useDispatch, useSelector } from "react-redux"; 
import http from "../../../../../../../../services/http";
import Pagination from "../../../../../../../../components/Pagination";
import { FormattedMessage } from "react-intl";
import colors from "../../../../../../../../constants/Colors";
import {
  TextH3,
} from "../../../../../../../../components/Texts";
import {
  mb,
  ml,
  mt,
  my,
  p,
} from "../../../../../../../../asset/style/utilities.style";
import { parseTaxInfo } from "../../../../helper";
import { updateDocumentTaskBookInvoice } from "../../../../../../../../redux/actions/DocumentTask/documentTask.actions";
import CustomInput from "../../../../../../../../components/Inputs/CustomInput";
import useForm from "../../../../../../../../hooks/useForm";
import { validateForm } from "../editForm/ValidateInfo";
import { checkValOrReturnNum, checkValOrReturnStr } from "../../../../../../../../utils/variousHelpers";

export const ModalCardInvoice = ({ showModal, invoice, close }) => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();

  const defaultFormValues = {
    canBeDenied: checkValOrReturnNum(invoice?.canBeDenied) !== 0 ?  invoice.canBeDenied.toString() :"",
    cannotBeDenied: checkValOrReturnNum(invoice?.cannotBeDenied) !== 0 ?  invoice.cannotBeDenied.toString() :"",
    notes: checkValOrReturnStr(invoice?.notes),
    bookId: "",
  };
  const { values, handleChange, handleSubmit, setValues, errors } = useForm(
    defaultFormValues,
    validateForm,
    submitForm
  );

  const [dataResponse, setDataResponse] = useState([]);
  const [dataLength, setDataLength] = useState(false);

  useEffect(() => {
    const getData = async () => {
      http.get(`/doctask/books/invoices`).then((data) => {
        const newArr = data.list?.map((el) => ({
          label: el.name,
          value: el.id,
          color: el.color,
        }));

        setDataResponse(newArr);
        setDataLength(data.list.length === 0);
      });
    };
    getData();  
  }, []);
  function submitForm() {
    let payload = { ...invoice };
    delete payload.taxInfoJson;
    delete payload.invoiceFileId;
    const parsedArr = parseTaxInfo(invoice.taxInfoJson);
    payload.taxInfoJson = parsedArr;
    payload.bookId = values.bookId;
    payload.canBeDenied = Number(values.canBeDenied);
    payload.cannotBeDenied = Number(values.cannotBeDenied);
    payload.notes = values.notes
    dispatch(updateDocumentTaskBookInvoice(payload));
    close();
  }

  return (
    <Modal transparent={true} visible={showModal}>
      <View
        style={[
          modalStyle.centeredView,
          flex.d_flex_center,
          flex.flex_direction_column,
        ]}
      >
        <View style={[modalStyle.modalView]}>
          <ScrollView
            bounces={false}
            scrollEnabled
            style={[{ borderRadius:8,overflow: 'visible' }]}
            contentContainerStyle={[
              styles.container,
              // p[3],

              flex.d_flex_center,
              flex.flex_direction_column,
              {  width: "100%", overflow: 'visible' }
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                  <View style={[flex.d_flex_center, flex.flex_start, my[3]]}>
                    <TextH3 text="common.button.save" />
                    <TextH3 text="invoice.tab.title" customStyles={[ml[3]]} />
                  </View>
                  <View style={[mb[15], mt[8]]}>
                    <View style={[my[2], { zIndex: 10, overflow: 'visible' }]}>
                      <CustomInput
                        type="dropdown"
                        label="select.book"
                        name="bookId"
                        placeholder="select.book"
                        data={dataResponse}
                        value={values.bookId}
                        onChange={handleChange}
                        validationMessage={errors.bookId}
                        dropdownProps={{ directionBottom: "bottom" }}
                      />
                    </View>
                    <CustomInput
                      type="number"
                      name="canBeDenied"
                      label="document.task.collection.drafts.invoices.canBeDenied"
                      placeholder="document.task.collection.drafts.invoices.canBeDenied"
                      value={values.canBeDenied}
                      onChange={handleChange}
                    />
                    <CustomInput
                      type="number"
                      name="cannotBeDenied"
                      label="document.task.collection.drafts.invoices.cannotBeDenied"
                      placeholder="document.task.collection.drafts.invoices.cannotBeDenied"
                      value={values.cannotBeDenied}
                      onChange={handleChange}
                    />
                    <CustomInput
                      type="textarea"
                      name="notes"
                      label="document.task.collection.drafts.invoices.notes"
                      placeholder="document.task.collection.drafts.invoices.notes"
                      value={values.notes}
                      onChange={handleChange}
                    />
                  </View>
                  {dataLength ? (
                    <Text style={{ paddingTop: 10 }}>
                      <FormattedMessage id="document.task.collection.noItems" />
                    </Text>
                  ) : (
                    <></>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </ScrollView>
          <View
            style={[
              modalStyle.ModalBottom,
              { position: "absolute", bottom: 0 },
            ]}
          >
            <ButtonCloseForm onPress={close} />
            <ButtonConfirmForm onPress={handleSubmit} />
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
    backgroundColor: colors.white,
    borderRadius: 9,
    paddingBottom: 170,
  },
  box: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
});
