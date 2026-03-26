

export const validateForm = (values) => {
  const { field_quantity, field_unitPrice, field_currencyCode, field_taxRate, field_description } = values;
  let errors = {};

  if (!field_description.trim()) {
    errors.field_description = "common.required";
  }
  if (!field_quantity.trim()) {
    errors.field_quantity = "common.required";
  }else if (isNaN(field_quantity)){
    errors.field_quantity = "mustBe.Number"
  }else if (Number(field_quantity) <= 0){
     errors.field_quantity = "mustBeGreater.Zero"
  }
  else if (field_quantity.length > 1 && field_quantity.charAt(0) === "0"){
    errors.field_quantity = "mustBe.Number"
 }


  if (!field_unitPrice.trim()) {
    errors.field_unitPrice = "common.required";
  }else if (isNaN(field_unitPrice)){
    errors.field_unitPrice = "mustBe.Number"
  }else if (Number(field_unitPrice) <= 0){
     errors.field_unitPrice = "mustBeGreater.Zero"
  } else if (field_unitPrice.length > 1 && field_unitPrice.charAt(0) === "0"){
    errors.field_quantity = "mustBe.Number"
 }


  if (!field_currencyCode) {
    errors.field_currencyCode = "common.required";
  }
  if (!field_taxRate) {
    errors.field_taxRate = "common.required";
  }

  return errors;
};
