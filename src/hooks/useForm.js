import { useEffect, useState, useCallback } from "react";

const useForm = (form, validate, callback) => {
  const [values, setValues] = useState(form);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length === 0 && isSubmitting) {
      callback();
    }
  }, [errors]);

  const handleChange = useCallback((value, name) => {
    setValues((prevState) => {
      return { ...prevState, [name]: value };
    });
  }, []);
  const handleSubmit = () => {
    setErrors(validate(values));
    setIsSubmitting(true);
  };

  return { values, handleChange, handleSubmit, errors, setValues };
};

export default useForm;
