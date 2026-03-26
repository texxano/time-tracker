export const validateForm = (values) => {
  const { title, entryDate, dueDate,chooseProject,chooseContact, invoiceDate } = values;
  let errors = {};
  if (!title.trim()) {
    errors.title = "money-tracker.invoice.title.error.required";
  }
  if (!chooseProject.trim()) {
    errors.chooseProject = "common.required";
  }
  if (!chooseContact.trim()) {
    errors.chooseContact = "common.required";
  }
  if (!entryDate.trim()) {
    errors.entryDate = "common.required";
  }
  if (!dueDate.trim()) {
    errors.dueDate = "common.required";
  }
  if (!invoiceDate.trim()) {
    errors.dueDate = "common.required";
  }


  return errors;
};
