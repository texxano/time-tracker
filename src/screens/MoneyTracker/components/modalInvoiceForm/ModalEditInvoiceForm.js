import React, { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import { useDispatch, useSelector } from "react-redux";
import { updateInvoice } from "../../../../redux/actions/MoneyTracker/moneyTracker.actions";
import ModalInvoiceFormDropdown from "./ModalInvoiceFormDropdown";
import ModalInvoiceFormUploadFile from "./ModalInvoiceFormUploadFile";
import ModalInvoiceFormLineItems from "./lineItems/ModalInvoiceFormLineItems";
import { getAllTaxRates } from "./lineItems/helperLineItems";
import useForm from "../../../../hooks/useForm";
import { validateForm } from "./ValidateInfo";
import CustomInput from "../../../../components/Inputs/CustomInput";
import { ButtonCloseForm } from "../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../components/buttons/ButtonConfirmForm";
import { mt } from "../../../../asset/style/utilities.style";
import {
  createPayload,
  handleEditFormLineItems,
  handleEditValues,
} from "./helperModalInvoice";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ModalEditInvoiceForm = ({ setModal, data, modal }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const mainCurrency = state.currencies.mainCurrency;
  const moneyTrackerRequest = state.moneyTracker.moneyTrackerRequest;
  const [totalPrices, setTotalPrices] = useState({
    total: "",
    totalTax: "",
    totalPriceExcTax: "",
  });
    const [taxInfo, setTaxInfo] = useState([])

  const [isInnerScrollActive, setIsInnerScrollActive] = useState(false);
  const defaultFormValues = {
    chooseProject: data?.projectTitle && data.projectTitle !== null ? data.projectTitle : "",
    projectId: "",
    title: "",
    description: "",
    dueDate: data?.dueDate | "",
    entryDate:"",
    invoiceType: 0,
    invoiceDocument: {},
  };

  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    defaultFormValues,
    validateForm,
    submitForm
  );
  const [lineItems, setLineItems] = useState([]);
  const [lineItemsTaxRates, setLineItemsTaxRates] = useState([]);

  const handleLineItemsEdit = (data) => {
    const rates = getAllTaxRates(data);
    setLineItemsTaxRates(rates);
    const transformedData = handleEditFormLineItems(data);
    setLineItems(transformedData);
  };

  useEffect(() => {
    if (data) {
      handleLineItemsEdit(data.lineItems);
      handleEditValues(data, setValues);
    }
  }, [data]);

    useEffect(() => {
      if (moneyTrackerRequest) {
        handleCloseModal();
      }
    }, [moneyTrackerRequest]);

  const handleCloseModal = () => {
    setModal(false);
    setValues(defaultFormValues);
    setLineItems([]);
  };

  function submitForm() {
    const payload = createPayload(values, lineItems, mainCurrency, totalPrices);
    dispatch(updateInvoice({ ...payload, id: data.id }));
    handleCloseModal();
  }

  return (
    <View style={{ position: "relative", width: "100%", height: "80%" }}>
      <GestureHandlerRootView>
        <ScrollView
          keyboardShouldPersistTaps="always"
          bounces={false}
          nestedScrollEnabled={true}
          scrollEnabled={!isInnerScrollActive}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <View
                  style={[
                    modalStyle.modalInput,
                    modalStyle.paddingBottom60,
                    { padding: 17 },
                  ]}
                >
                  <ModalInvoiceFormDropdown
                    handleChange={handleChange}
                    name="chooseProject"
                    values={values}
                    errors={errors}
                    setIsInnerScrollActive={setIsInnerScrollActive}
                  />

                  <CustomInput
                    type="text"
                    name="title"
                    label="projects.form.title.placeholder"
                    placeholder="projects.form.title.placeholder"
                    value={values.title}
                    validationMessage={errors.title}
                    onChange={handleChange}
                  />
                  <CustomInput
                    type="text"
                    label="projects.form.description.placeholder"
                    placeholder="projects.form.description.placeholder"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                  />

                  <ModalInvoiceFormUploadFile
                    invoiceDocument={values.invoiceDocument}
                    setValues={setValues}
                  />
                  <CustomInput
                    type="radio"
                    customWrapperStyles={[{ height: 35 }, mt[2]]}
                    name="invoiceType"
                    data={[
                      { msg: "money-tracker.scan.form.outgoing", value: 0 },
                      { msg: "money-tracker.scan.form.entry", value: 1 },
                    ]}
                    value={values.invoiceType}
                    onChange={handleChange}
                  />
                  <View>
                    <CustomInput
                      type="date"
                      label="Due.Date.Title"
                      placeholder="Due.Date.Title"
                      name="dueDate"
                      value={values.dueDate}
                      onChange={handleChange}
                      dateCustomProps="test"
                    />
                    <ModalInvoiceFormLineItems
                      lineItems={lineItems}
                      setLineItems={setLineItems}
                      lineItemsTaxRates={lineItemsTaxRates}
                      setLineItemsTaxRates={setLineItemsTaxRates}
                      currencyCode={values.currencyCode}
                      setIsInnerScrollActive={setIsInnerScrollActive}
                      totalPrices={totalPrices}
                      setTotalPrices={setTotalPrices}
                      setTaxInfo={setTaxInfo}
                    />
                  </View>
                </View>
                <View style={[modalStyle.ModalBottom]}>
                  <ButtonCloseForm onPress={handleCloseModal} />
                  <ButtonConfirmForm onPress={handleSubmit} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </ScrollView>
      </GestureHandlerRootView>
    </View>
  );
};

export default ModalEditInvoiceForm;
