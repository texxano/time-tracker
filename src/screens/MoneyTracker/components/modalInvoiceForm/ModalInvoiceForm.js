import React, { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import { useDispatch, useSelector } from "react-redux";
import {
  createInvoice,
  MoneyTrackerStartLoading,
  saveInvoicePayload,
} from "../../../../redux/actions/MoneyTracker/moneyTracker.actions";
import ModalInvoiceFormDropdown from "./ModalInvoiceFormDropdown";
import ModalInvoiceFormUploadFile from "./ModalInvoiceFormUploadFile";
import ModalInvoiceFormLineItems from "./lineItems/ModalInvoiceFormLineItems";
import {
  getAllTaxRates,
  transformScannedFields,
} from "./lineItems/helperLineItems";
import useForm from "../../../../hooks/useForm";
import { validateForm } from "./ValidateInfo";
import CustomInput from "../../../../components/Inputs/CustomInput";
import { ButtonCloseForm } from "../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../components/buttons/ButtonConfirmForm";
import { mt, my } from "../../../../asset/style/utilities.style";
import {
  createPayload,
  findContactWithId,
  findContactWithoutId,
} from "./helperModalInvoice";
import ScannerMessage from "./ScannerMessage";
import ModalInvoiceFormDropdownChooseContact from "./ModalInvoiceFormDropdownChooseContact";
import { useIntl } from "react-intl";
import ContactErrorMessage from "./ContactErrorMessage";
import ModalErrorHandler from "../../../../components/Modal/ModalShowMessage";
import ModalMessageWrapper from "../../../../components/Modal/ModalMessageWrapper";
import { TextMain } from "../../../../components/Texts";
import flex from "../../../../asset/style/flex.style";
import SearchableDropdown from "../../../../components/Inputs/SearchabaleDropDown";

const ModalInvoiceForm = ({
  setModal,
  projectId,
  setScannedFormData,
  scannedFormData,
  setInvoiceCreationWay,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const rejected = intl.formatMessage({ id: "money-tracker.scan.rejected" });
  const closeMessage = intl.formatMessage({ id: "common.button.close" });
  const unValidScanError = intl.formatMessage({
    id: "money-tracker.scan.contactError3",
  });
  const [showRejectedMsg, setShowRejectedMsg] = useState(false);
  const state = useSelector((state) => state);
  const moneyTrackerRequest = state.moneyTracker.moneyTrackerRequest;
  const { showScannerSuccessMsg } = useSelector(
    (state) => state.moneyTrackerInvoices
  );
  const mainCurrency = state.currencies.mainCurrency;
  const projectsData = state.getProjectData;
  const [totalPrices, setTotalPrices] = useState({
    total: "",
    totalTax: "",
    totalPriceExcTax: "",
  });

  const [taxInfo, setTaxInfo] = useState([]);
  const [clientUniqueCountryNumber, setClientUniqueCountryNumber] =
    useState("");
  const [isInnerScrollActive, setIsInnerScrollActive] = useState(false);
  const defaultFormValues = {
    chooseProject: "", //if title exist or is not null
    chooseContact: "",
    projectId: "",
    title: "",
    description: "",
    entryDate: "",
    dueDate: "",
    invoiceDate: "",
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
  const [showScannerMsg, setShowScannerMsg] = useState(false);
  const [showContactError, setShowContactError] = useState({
    vendor: "",
    customer: "",
    showError: false,
  });

  const handleLineItems = (data) => {
    const rates = getAllTaxRates(data);
    setLineItemsTaxRates(rates);
    let arr = [];
    data.forEach((el) => {
      const transformedFields = transformScannedFields(el, mainCurrency);

      const isNotEmpty = Object.entries(transformedFields).length > 0;
      if (isNotEmpty) {
        arr.push(transformedFields);
      }
    });

    setLineItems(arr);
  };

  // updating tax rates when user delete an item
  useEffect(() => {
    if (lineItems.length > 0) {
      const rates = getAllTaxRates(lineItems);
      setLineItemsTaxRates(rates);
    }
  }, [lineItems]);

  useEffect(() => {
    if (projectId) {
      setValues((prevState) => ({
        ...prevState,
        chooseProject: projectsData?.title ? projectsData.title : "",
      }));
      setValues((prevState) => ({
        ...prevState,
        projectId: projectsData?.id ? projectsData.id : "",
      }));
    }
  }, [projectId]);

  useEffect(() => {
    if (moneyTrackerRequest) {
      handleCloseModal();
    }
  }, [moneyTrackerRequest]);
  // console.log(scannedFormData, "scannedFormData");
  useEffect(() => {
    if (scannedFormData && scannedFormData.mappedResult) {
      const formData = scannedFormData.mappedResult;
      formData?.invoiceId &&
        formData.invoiceId !== null &&
        setValues((prev) => ({ ...prev, title: formData.invoiceId }));

      formData?.description &&
        formData.description !== null &&
        setValues((prev) => ({ ...prev, description: formData.description }));

      // check if invoice is outgoing or entry
      if (projectId) {
        findContactWithId(
          formData.vendorAddressRecipient,
          formData.customerAddressRecipient,
          setClientUniqueCountryNumber,
          setValues,
        );
      } else {
        findContactWithoutId(
          formData.vendorAddressRecipient,
          formData.customerAddressRecipient,
          setClientUniqueCountryNumber,
          setValues,
      
        );
      }
      setShowScannerMsg(true)
      if (formData?.lineItems && formData?.lineItems.length > 0) {
        handleLineItems(formData.lineItems);
      } else {
        setShowRejectedMsg(true);
        return;
      }

      scannedFormData?.invoiceDocument &&
        scannedFormData.invoiceDocument !== null &&
        setValues((prev) => ({
          ...prev,
          invoiceDocument: scannedFormData.invoiceDocument,
        }));

      formData?.dueDate &&
        formData?.dueDate !== null &&
        setValues((prev) => ({ ...prev, dueDate: formData.dueDate }));

      formData?.invoiceDate &&
        formData?.invoiceDate !== null &&
        setValues((prev) => ({ ...prev, invoiceDate: formData.invoiceDate }));
      let date = new Date();
      setValues((prev) => ({ ...prev, entryDate: date.toISOString() }));
    }
  }, [scannedFormData]);

  const handleCloseModal = () => {
    setModal(false);
    setValues(defaultFormValues);
    setLineItems([]);
    setInvoiceCreationWay("");
    setScannedFormData(null);
  };

  function submitForm() {
    const payload = createPayload(values, lineItems, mainCurrency, totalPrices);
    dispatch(MoneyTrackerStartLoading());
    dispatch(createInvoice(payload));
    const invoiceToBookPayload = {
      ...payload,
      clientUniqueCountryNumber,
      taxInfo,
    };
    dispatch(
      saveInvoicePayload({
        ...invoiceToBookPayload,
        entryDate: values.entryDate,
      })
    );

    handleCloseModal();
  }

  return (
    <View style={{ position: "relative", width: "100%", height: "70%",overflow: 'scroll' }}>
      {scannedFormData && showScannerSuccessMsg && showScannerMsg && (
        <ScannerMessage
          showModal={showScannerMsg}
          close={() => setShowScannerMsg(false)}
        />
      )}

      <ModalMessageWrapper
        showModal={showRejectedMsg}
        close={() => {
          setShowRejectedMsg(false);
          handleCloseModal();
          return;
        }}
      >
        <View style={[flex.d_flex_center, flex.flex_direction_column]}>
          <TextMain
            customStyles={[{ fontWeight: "bold" }, my[2]]}
            isPlaintext
            text={rejected}
          />
          <TextMain isPlaintext text={unValidScanError} />
        </View>
      </ModalMessageWrapper>

      <ContactErrorMessage
        showModal={showContactError.showError}
        close={() => {
          setShowContactError({ vendor: "", customer: "", showError: false });
          handleCloseModal();
          return;
        }}
        showContactError={showContactError}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
              <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEnabled={true}
          // bounces={false}
          // nestedScrollEnabled={true}
          // scrollEnabled={!isInnerScrollActive}
          // onTouchStart={() => setIsInnerScrollActive(false)}
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
                    isDisabled={projectId !== undefined}
                  />
                  <ModalInvoiceFormDropdownChooseContact
                    handleChange={handleChange}
                    name="chooseContact"
                    values={values}
                    errors={errors}
                    setIsInnerScrollActive={setIsInnerScrollActive}
                    setClientUniqueCountryNumber={setClientUniqueCountryNumber}
                    setValues={setValues}
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
                      label="money-tracker.invoice.invoice.date.placeholder"
                      placeholder="money-tracker.invoice.invoice.date.placeholder"
                      name="invoiceDate"
                      value={values.invoiceDate}
                      onChange={handleChange}
                      dateCustomProps={{ height: 200 }}
                      validationMessage={errors.invoiceDate}
                    />
                    <CustomInput
                      type="date"
                      label="Due.Date.Title"
                      placeholder="Due.Date.Title"
                      name="dueDate"
                      value={values.dueDate}
                      onChange={handleChange}
                      dateCustomProps={{ height: 100 }}
                      validationMessage={errors.dueDate}
                    />
                    <CustomInput
                      type="date"
                      label="EntryDate"
                      placeholder="EntryDate"
                      name="entryDate"
                      value={values.entryDate}
                      onChange={handleChange}
                      dateCustomProps={{ height: 200 }}
                      validationMessage={errors.entryDate}
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
 
        </ScrollView>
      </KeyboardAvoidingView>

  

    </View>
  );
};

export default ModalInvoiceForm;
