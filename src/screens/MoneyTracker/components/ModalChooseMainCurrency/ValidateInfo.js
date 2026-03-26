export const validateForm = (values) => {
  const {  currencyCode } = values;
  let errors = {};
  if (!currencyCode) {
    errors.currencyCode = "common.required";
  }

  return errors;
};
