import { documentTasksTypes } from "../../type/DocumentTask/documentTasks.types";

export function incrementUnfinishedInvoices() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return { type: documentTasksTypes.DOCUMENT__TASK_DRAFTS_INVOICE_INCREMENT };
  }
}

export function decrementUnfinishedInvoices() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return { type: documentTasksTypes.DOCUMENT__TASK_DRAFTS_INVOICE_DECREMENT };
  }
}
