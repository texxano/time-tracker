export const validateForm = (values) => {
  let errors = {};
  const {  bookId } = values;

  if (!bookId) {
    errors.bookId = "common.required";
  }
  return errors;
};
