export function validateText(em) {
  const re = /^[A-Za-z]+$/;
  return re.test(em);
}

export function validateEmail(em) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(em);
}

export function validatePassword(p) {
  if (p.length < 8) {
    const errorPassword = "login.form.password.error.min";
    return { status: false, error: errorPassword };
  }
  if (p.search(/^(?=.*[a-z])(?=.*[A-Z])/) === -1) {
    const errorPassword = "login.form.password.error.capitalLetters";
    return { status: false, error: errorPassword };
  }
  if (p.search(/\d/) === -1) {
    const errorPassword = "login.form.password.error.numbers";
    return { status: false, error: errorPassword };
  }
  return { status: true };
}


