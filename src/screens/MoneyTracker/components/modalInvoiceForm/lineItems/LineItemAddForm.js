import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { mx, p } from "../../../../../asset/style/utilities.style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { modalStyle } from "../../../../../asset/style/components/modalStyle";
import {
  calculatePriceInclTax,
  calculateTotalPrice,
  calculateTotalTax,
  convertTaxRate,
  createLineItemPayload,
} from "./helperLineItems";
import {
  currenciesLabel,
  taxRates,
} from "../../../../../constants/VariousConstants";
import { validateForm } from "./ValidateInfo";
import CustomInput from "../../../../../components/Inputs/CustomInput";
import { ButtonCloseForm } from "../../../../../components/buttons/ButtonCloseForm";
import { ButtonConfirmForm } from "../../../../../components/buttons/ButtonConfirmForm";
import useForm from "../../../../../hooks/useForm";
import { useSelector } from "react-redux";
import { MKTaxRates } from "../../../../../constants/countrytaxes";

export const LineItemAddForm = ({
  setShowItemForm,
  addLineItem,
}) => {
  const state = useSelector((state) => state);
  const mainCurrency = state.currencies.mainCurrency;
  const defaultFormValues = {
    field_productCode: "",
    field_description: "",
    field_quantity: "",
    field_unitPrice: "",
    field_currencyCode: mainCurrency,
    field_totalTax: "",
    field_totalPriceInclTax: undefined,
    field_totalPriceExcTax: undefined,
    field_taxRate: null,
  };
  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    defaultFormValues,
    validateForm,
    submitForm
  );

  const [currenciesData, setCurrenciesData] = useState(currenciesLabel);
  const [taxRateData, setTaxRateData] = useState([]);

  useEffect(() => {
   
    if(mainCurrency === "MKD"){

      const newArr = MKTaxRates.map((el) => ({
        label: el,
        value: parseFloat(el).toFixed(2),
      }));
      setTaxRateData(newArr);
    }else {
      const newArr = taxRates.map((el) => ({
        label: el,
        value: parseFloat(el).toFixed(2),
      }));
      setTaxRateData(newArr);
    }
  }, [mainCurrency]);

  function submitForm() {
    const payload = createLineItemPayload(values);
    addLineItem(payload);
    handleCloseForm();
  }

  const handleCloseForm = () => {
    setValues(defaultFormValues);
    setShowItemForm(false);
  };

  useEffect(() => {
    if (
      values.field_quantity !== "" &&
      values.field_taxRate !== "" &&
      values.field_unitPrice !== "" &&
      values.field_taxRate !== null
    ) {
      const priceInclTax = calculatePriceInclTax(
        Number(values.field_unitPrice),
        convertTaxRate(values.field_taxRate),
        values.field_quantity
      );
      setValues((prevState) => ({
        ...prevState,
        field_totalPriceInclTax: priceInclTax.toString(),
      }));

      const totalPrice = calculateTotalPrice(
        Number(values.field_unitPrice),
        values.field_quantity
      );

      setValues((prevState) => ({
        ...prevState,
        field_totalPriceExcTax: totalPrice.toString(),
      }));
      const totalTax = calculateTotalTax(
        Number(values.field_unitPrice),
        convertTaxRate(values.field_taxRate),
        values.field_quantity
      );
      setValues((prevState) => ({
        ...prevState,
        field_totalTax: totalTax.toString(),
      }));
    }
  }, [
    values.field_quantity,
    values.field_taxRate,
    values.field_unitPrice,
    values.field_taxRate,
  ]);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowItemForm(false)}
        style={[
          p[1],
          mx[1],

          {
            alignSelf: "flex-end",
          },
        ]}
      >
        <MaterialCommunityIcons name="close" size={20} color="#6c757d" />
      </TouchableOpacity>

      <CustomInput
        type="text"
        name="field_productCode"
        label="money-tracker.scan.form.lineItems.productCode"
        placeholder="money-tracker.scan.form.lineItems.productCode"
        value={values.field_productCode}
        onChange={handleChange}
        optional="optional"
      />
      <CustomInput
        type="text"
        name="field_description"
        label="projects.form.description.placeholder"
        placeholder="projects.form.description.placeholder"
        value={values.field_description}
        validationMessage={errors.field_description}
        onChange={handleChange}
      />
      <CustomInput
        type="number"
        name="field_quantity"
        label="money-tracker.scan.form.lineItems.quantity"
        placeholder="money-tracker.scan.form.lineItems.quantity"
        value={values.field_quantity}
        validationMessage={errors.field_quantity}
        onChange={handleChange}
      />
      <CustomInput
        type="number"
        name="field_unitPrice"
        label="money-tracker.scan.form.lineItems.unitPrice"
        placeholder="money-tracker.scan.form.lineItems.unitPrice"
        value={values.field_unitPrice}
        validationMessage={errors.field_unitPrice}
        onChange={handleChange}
      />

      <CustomInput
        type="dropdown"
        name="field_taxRate"
        label="money-tracker.scan.form.lineItems.taxRate"
        placeholder="money-tracker.scan.form.lineItems.taxRate"
        value={values.field_taxRate}
        data={taxRateData}

        onChange={handleChange}
        validationMessage={errors.field_taxRate}
      />
      <CustomInput
        type="dropdown"
        name="field_currencyCode"
        label="money-tracker.scan.form.lineItems.currency"
        placeholder="money-tracker.scan.form.lineItems.currency"
        data={currenciesData}
        setData={setCurrenciesData}
        value={values.field_currencyCode}
        onChange={handleChange}
        validationMessage={errors.field_currencyCode}
        disabled
      />

      <CustomInput
        type="text"
        name="field_totalTax"
        label="money-tracker.scan.form.lineItems.totalTax"
        placeholder="money-tracker.scan.form.lineItems.totalTax"
        value={values.field_totalTax}
        onChange={handleChange}
        disabled
      />

      <CustomInput
        type="numeric"
        name="field_totalPriceInclTax"
        label="money-tracker.scan.form.lineItems.totalPriceInclTax"
        placeholder="money-tracker.scan.form.lineItems.totalPriceInclTax"
        value={values.field_totalPriceInclTax}
        onChange={handleChange}
        disabled
      />

      <CustomInput
        type="numeric"
        name="field_totalPriceExcTax"
        label="money-tracker.scan.form.lineItems.totalPriceExcTax"
        placeholder="money-tracker.scan.form.lineItems.totalPriceExcTax"
        value={values.field_totalPriceExcTax}
        onChange={handleChange}
        disabled
      />

      <View style={[modalStyle.ModalBottom]}>
        <ButtonCloseForm onPress={handleCloseForm} />
        <ButtonConfirmForm onPress={handleSubmit} />
      </View>
    </View>
  );
};
