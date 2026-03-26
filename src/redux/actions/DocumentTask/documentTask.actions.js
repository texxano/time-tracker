import { documentTasksTypes } from "../../type/DocumentTask/documentTasks.types";
import { documentTaskServices } from "../../../services/DocumentTask/documentTask.Services";
import { documentTaskBooksServices } from "../../../services/DocumentTask/documentTaskBook.Services";

export function createDocumentTask(payload) {
  return (dispatch) => {
    dispatch(request(payload.name));
    documentTaskServices.createDocumentTask(payload).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function updateDocumentTask(payload) {
  return (dispatch) => {
    dispatch(request(payload.name));
    documentTaskServices.updateDocumentTask(payload).then((data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function completeAllDocumentSubTasks(id, payload) {
  return (dispatch) => {
    dispatch(request(id));
    documentTaskServices
      .completeAllDocumentSubTasks(id, payload)
      .then((data) => {
        if (data.status <= 299) {
          dispatch(success(data.status));
        } else {
          dispatch(failure(data));
        }
      });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function deleteDocumentTask(id) {
  return (dispatch) => {
    dispatch(request(id));
    documentTaskServices.deleteDocumentTask(id).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function moveDocumentTask(payload) {
  return (dispatch) => {
    dispatch(request(payload.documentTaskId));
    documentTaskServices.moveDocumentTask(payload).then((data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function createDocumentTaskBookInvoice(payload) {
  return (dispatch) => {
    dispatch(request(payload.invoiceNumber));
    documentTaskBooksServices
      .createDocumentTaskBookInvoice(payload)
      .then((data) => {
        if (data.status <= 299) {
          dispatch(success(data.status));
        } else {
          dispatch(failure(data));
        }
      });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function resetDocumentTaskBookInvoice() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return { type: documentTasksTypes.DOCUMENT_TASKS_RESET };
  }
}

export function updateDocumentTaskBookInvoice(payload) {
  return (dispatch) => {
    dispatch(request(payload.invoiceNumber));
    documentTaskBooksServices
      .updateDocumentTaskBookInvoice(payload)
      .then((data) => {
        if (data.status <= 299) {
          dispatch(success(data.status));
        } else {
          dispatch(failure(data));
        }
      });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export function deleteDocumentTaskBookInvoice(id) {
  return (dispatch) => {
    dispatch(request(id));

    documentTaskBooksServices.deleteDocumentTaskBookInvoice(id).then((data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data };
  }
  function success(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data };
  }
  function failure(data) {
    return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data };
  }
}

export const documentTaskCount = (count) => ({
  type: documentTasksTypes.DOCUMENT_TASKS_COUNT,
  count: count,
});

export function startIosCamera() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return { type: documentTasksTypes.DOCUMENT__TASK_IOS_CAMERA_START };
  }
}

export function endIosCamera() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return { type: documentTasksTypes.DOCUMENT__TASK_IOS_CAMERA_END };
  }
}
