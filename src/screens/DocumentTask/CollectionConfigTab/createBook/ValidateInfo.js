export const validateForm = (values) => {
  let errors = {};
  const {  name, bookType } = values;

  if (!name.trim()) {
    errors.name = "common.required";
  }
  if (!bookType.trim()) {
    errors.bookType = "common.required";
  }
  return errors;
};
