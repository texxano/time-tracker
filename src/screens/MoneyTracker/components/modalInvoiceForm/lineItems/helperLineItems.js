import { checkValOrReturnNum, checkValOrReturnStr } from "../../../../../utils/variousHelpers";

export const getAllTaxRates = (arr) => {
  let taxRates = [];
  arr.forEach((el) => {
    if (
      el.taxRate !== null &&
      el.taxRate !== undefined &&
      el.taxRate !== "" &&
      typeof el.taxRate === "string"
    ) {
      //
      const taxRateStr = reTransformTaxRate(el.taxRate);
      if (taxRateStr !== null && !taxRates.includes(taxRateStr)) {
        taxRates.push(taxRateStr);
      }
    }
  });
  return taxRates;
};

const validateField = (field) => {
  return field !== null && field !== undefined && field !== "";
};

const checkCurrency = (scannedCurr, mainCurr) => {

    return scannedCurr === mainCurr
}

export const transformScannedFields = (el, mainCurrency) => {
  let payload = {};
  // element must include unitPrice, amount , taxRat
  if (
    validateField(el?.unitPrice?.code) &&
    checkCurrency(el.unitPrice.code, mainCurrency) &&
    el?.unitPrice?.amount &&
    !isNaN(parseFloat(el.unitPrice.amount)) &&
    validateField(el.unitPrice.amount) &&
    el?.taxRate &&
    !isNaN(parseFloat(el.taxRate)) &&
    validateField(el.taxRate) &&
    typeof el.quantity === "number"
  ) {
    // add amount
    const num = parseFloat(el.unitPrice.amount).toFixed(2);
    payload.unitPrice = num;
    // add quantity
    payload.quantity = el.quantity;
    // add taxRate and transform value to  e.g 10,00
    const transformedTaxRate = reTransformTaxRate(el.taxRate);
    payload.taxRate = transformedTaxRate;
    if (el?.description && validateField(el.description)) {
      //description
      payload.description = el.description;
    } else {
      payload.description = "not scanned";
    }
    //productCode
    if (el.productCode && validateField(el.productCode)) {
      payload.productCode = el.productCode;
    } else {
      payload.productCode = "not scanned";
    }
    //currency
    if (
      el.unitPrice?.code &&
      el.unitPrice?.code !== null &&
      el.unitPrice?.code !== undefined &&
      el.unitPrice?.code !== ""
    ) {
      payload.currencyCode = el.unitPrice.code;
    } else {
      payload.currencyCode = mainCurrency;
    }
    // total tax
    payload.totalTax = calculateTotalTax(
      el.unitPrice.amount,
      convertTaxRate(transformedTaxRate),
      el.quantity
    );
    //totalPriceInclTax
    payload.totalPriceInclTax = calculatePriceInclTax(
      el.unitPrice.amount,
      convertTaxRate(transformedTaxRate),
      el.quantity
    );

    // totalPriceExcTax
    payload.totalPriceExcTax = calculateTotalPrice(
      el.unitPrice.amount,
      el.quantity
    );

  }

  return payload;
};

export const reTransformTaxRate = (el) => {
  const taxStr = parseFloat(el);
  return `${taxStr},00`;
};

// get number from tax rate
export const convertTaxRate = (taxRate) => {
  let num;
  if (typeof taxRate === "number") {
    num = taxRate;
  }
  if (typeof taxRate === "string") {
    if (taxRate.includes(",")) {
      const findInx = taxRate.indexOf(",");
      const final = taxRate.substring(0, findInx);
      num = Number(final);
    }
    if (taxRate.includes(".")) {
      const findInx = taxRate.indexOf(".");
      const final = taxRate.substring(0, findInx);
      num = Number(final);
    }
  }
  return num;
};

export const calculatePriceInclTax = (unitPrice, taxRate, quantity) => {
  const totalTax = calculateTotalTax(unitPrice, taxRate, quantity);
  const totalPrice = calculateTotalPrice(unitPrice, quantity);
  const totalPriceInclTax = parseFloat(totalPrice) + parseFloat(totalTax);
  let rounded = parseFloat(totalPriceInclTax).toFixed(2);
  return rounded;
};

export const calculateTotalPrice = (unitPrice, quantity) => {
  const totalPrice = Number(unitPrice) * Number(quantity);
  let rounded = parseFloat(totalPrice).toFixed(2);
  return rounded;
};

export const calculateTotalTax = (unitPrice, taxRate, quantity) => {
  const totalTax =
    (Number(unitPrice) / 100) * Number(taxRate) * Number(quantity);
  // Round to nearest whole number
  let rounded = Math.round(totalTax);
  return rounded.toFixed(2);
};

//// LINE ITEMS VALUES HELPER FUNCTIONS

export const countTaxValues = (arr, lineItemsTaxRates) => {
  let rows = [];
  let totalPrice = 0;
  let totalTax = 0;
  let totalPriceExcTax = 0;

  lineItemsTaxRates.forEach((taxRate) => {
    const taxRateValues = arr.filter((item) => item.taxRate === taxRate);
    let totalRateTax = 0;
    let totalRatePriceInclTax = 0;
    let totalRatePriceExcTax = 0;

    taxRateValues.forEach((val) => {
      totalRateTax += Number(val.totalTax);
      totalRatePriceInclTax += Number(val.totalPriceInclTax);
      totalRatePriceExcTax += Number(val.totalPriceExcTax);
      totalPrice += Number(val.totalPriceInclTax);
      totalTax += Number(val.totalTax);
      totalPriceExcTax += Number(val.totalPriceExcTax);
    });
    const row = [
      taxRate,
      parseFloat(totalRateTax).toFixed(2),
      parseFloat(totalRatePriceExcTax).toFixed(2),
      parseFloat(totalRatePriceInclTax).toFixed(2),
      arr[0].currencyCode,
    ];
    rows.push(row);
  });

  const finalTotalPrice = parseFloat(totalPrice).toFixed(2);
  const finalTotalTax = parseFloat(totalTax).toFixed(2);
  const finalTotalPriceExcTax = parseFloat(totalPriceExcTax).toFixed(2);
  return {
    rows,
    total: finalTotalPrice,
    totalTax: finalTotalTax,
    totalPriceExcTax: finalTotalPriceExcTax,
  };
};

export const createLineItemPayload = (values) => {
  const {
    field_productCode,
    field_description,
    field_quantity,
    field_unitPrice,
    field_currencyCode,
    field_totalTax,
    field_totalPriceInclTax,
    field_totalPriceExcTax,
    field_taxRate,
  } = values;
  const taxRate = convertTaxRate(field_taxRate);
  const payload = {
    description: field_description,
    quantity: Number(field_quantity),
    unitPrice: field_unitPrice,
    currencyCode: field_currencyCode,
    totalTax: field_totalTax,
    totalPriceInclTax: field_totalPriceInclTax,
    totalPriceExcTax:field_totalPriceExcTax,
    taxRate: `${taxRate},00`,
  };
  if (field_productCode) {
    payload.productCode = field_productCode;
  }

  return payload;
};

export const addValuesToInputs = (item, setValues) => {
  const {
    productCode,
    description,
    quantity,
    unitPrice,
    currencyCode,
    totalTax,
    totalPriceInclTax,
    totalPriceExcTax,
    taxRate,
  } = item;

  productCode &&
    setValues((prevState) => ({
      ...prevState,
      field_productCode: checkValOrReturnStr(productCode),
    }));
  description &&
    setValues((prevState) => ({
      ...prevState,
      field_description: checkValOrReturnStr(description),
    }));
  quantity &&
    setValues((prevState) => ({
      ...prevState,
      field_quantity: checkValOrReturnNum(quantity).toString(),
    }));
  unitPrice &&
    setValues((prevState) => ({
      ...prevState,
      field_unitPrice: checkValOrReturnStr(unitPrice),
    }));
  currencyCode &&
    setValues((prevState) => ({
      ...prevState,
      field_currencyCode: checkValOrReturnStr(currencyCode),
    }));
  totalTax &&
    setValues((prevState) => ({
      ...prevState,
      field_totalTax: checkValOrReturnStr(totalTax),
    }));
  totalPriceInclTax &&
    setValues((prevState) => ({
      ...prevState,
      field_totalPriceInclTax: checkValOrReturnStr(totalPriceInclTax),
    }));
  totalPriceExcTax &&
    setValues((prevState) => ({
      ...prevState,
      field_totalPriceExcTax: checkValOrReturnStr(totalPriceExcTax),
    }));

  taxRate &&
    setValues((prevState) => ({
      ...prevState,
      field_taxRate: checkValOrReturnStr(taxRate),
    }));
};

export const addTaxInfoPayload = (rows) => {
  let taxInfoPayload = [];
  rows.length > 0 &&
    rows.forEach((row) => {
      let obj = {};
      row.forEach((el, index) => {
        if (index === 0) {
          obj.taxRate = el;
        }
        if (index === 1) {
          obj.tax = Number(el).toFixed(2);
        }
        if (index === 2) {
          obj.base = Number(el).toFixed(2);
        }
      });
      taxInfoPayload.push(obj);
    });
  return taxInfoPayload;
};
