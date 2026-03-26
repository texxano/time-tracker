import { validateEmail } from "../../../../utils/validate";

export const validateForm = (values) => {
  const { name, address, email, phoneNumber, contactType, uniqueCountryNumber } = values;
  let errors = {};
  if (!name.trim()) {
    errors.name = "common.required";
  }
  if (!address.trim()) {
    errors.address = "common.required";
  }
  if (!email.trim()) {
    errors.email = "common.required";
  }
  if (email.trim() && !validateEmail(email)) {
    errors.email = "login.form.username.error.email";
  }
  if (!phoneNumber.trim()) {
    errors.phoneNumber = "common.required";
  }
  if (!contactType.trim()) {
    errors.contactType = "common.required";
  }
  if (contactType == "0" && !uniqueCountryNumber.trim()) {
    errors.uniqueCountryNumber = "common.required";
  }

  return errors;
};
