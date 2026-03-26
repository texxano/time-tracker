import React, { useState } from "react";
import { Modal, Text, View } from "react-native";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import { currenciesLabel } from "../../../../constants/VariousConstants";
import CustomInput from "../../../../components/Inputs/CustomInput";
import { ButtonCloseForm } from "../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../components/buttons/ButtonConfirmForm";
import { validateForm } from "./ValidateInfo";
import { useDispatch } from "react-redux";
import useForm from "../../../../hooks/useForm";
import { FormattedMessage } from "react-intl";
import { m, my } from "../../../../asset/style/utilities.style";
import { saveMainCurrency } from "../../../../redux/actions/MoneyTracker/moneyTracker.actions";

const ModalChooseMainCurrency = ({
  showModal,
  close,
}) => {
  const [currenciesData] = useState(currenciesLabel);
  const dispatch = useDispatch();
  const defaultFormValues = {
    currencyCode: "",
  };
  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    defaultFormValues,
    validateForm,
    submitForm
  );
  const handleCloseModal = () => {
    setValues(defaultFormValues);
    close();
  };

  function submitForm() {
    dispatch(saveMainCurrency(values.currencyCode));
    handleCloseModal();

  }
  return (
    <Modal transparent={true} visible={showModal}>
      <View style={[modalStyle.centeredView]}>
        <View style={[modalStyle.modalView]}>
          <Text style={[modalStyle.modalTitle]}>
            <FormattedMessage id="money-tracker.choose.main.currency" />
          </Text>
          <Text style={[modalStyle.modalTitle, { fontSize: 12 }]}>
            <FormattedMessage id="money-tracker.choose.main.currency.description" />
          </Text>
          <View style={[m[3], my[4]]}>
            <CustomInput
              type="dropdown"
              label="Select.Currencies"
              name="currencyCode"
              placeholder="Select.Currencies"
              data={currenciesData}
              value={values.currencyCode}
              onChange={handleChange}
              validationMessage={errors.currencyCode}
              dropdownProps={{ directionBottom: "bottom" }}
            />
          </View>
          <View style={modalStyle.ModalBottom}>
            <ButtonCloseForm onPress={handleCloseModal} />
            <ButtonConfirmForm onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalChooseMainCurrency;
