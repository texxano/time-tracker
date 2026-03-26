import { moneyTrackerTypes } from "../../type/MoneyTracker/moneyTracker.types";
import { moneyTrackerServices } from "../../../services/MoneyTracker/moneyTracker.Services";

export function createInvoice(payload) {
  return (dispatch) => {

    dispatch(request());
    moneyTrackerServices.createInvoice(payload).then((data) => {
      if (data.status) {
        
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request() {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST};
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export function updateInvoice(payload) {
  return (dispatch) => {
    dispatch(request(payload.name));
    moneyTrackerServices.updateInvoice(payload).then((data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST, data };
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export function deleteInvoice(id) {
  return (dispatch) => {
    dispatch(request(id));
    moneyTrackerServices.deleteInvoice(id).then((data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST, data };
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export const moneyTrackerCount = (count) => ({
  type: moneyTrackerTypes.MONEYTRACKER_COUNT,
  count: count,
});

export function createPayment(payload) {
  return (dispatch) => {
    dispatch(request(payload.name));
    moneyTrackerServices.createPayment(payload).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST, data };
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export function deletePayment(id) {
  return (dispatch) => {
    dispatch(request(id));
    moneyTrackerServices.deletePayment(id).then((data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST, data };
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export function createInvoiceDocument(payload) {
  return (dispatch) => {
    dispatch(request(payload.name));
    moneyTrackerServices.createInvoiceDocument(payload).then((data) => {
      try {
        if (data.status) {
          dispatch(failure(data));
        } else {
          dispatch(success(data));
        }
      } catch (error) {
        console.log(error, "error");
      }
    });
  };
  function request(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST, data };
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export function createInvoiceOcr(payload) {
  return (dispatch) => {
    dispatch(request(payload.name));
    moneyTrackerServices.createInvoiceOcr(payload).then((data) => {
      try {
        if (data.status) {
          dispatch(failure(data));
        } else {
          dispatch(success(data));
        }
      } catch (error) {
        console.log(error, "error");
      }
    });
  };
  function request(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_REQUEST, data };
  }
  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data };
  }
  function failure(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data };
  }
}

export function saveMainCurrency(payload) {
  return (dispatch) => {
    dispatch(success(payload));
  };

  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SAVE_MAIN_CURRENCY, data };
  }
}
export function showSuccessScannerMsg(payload) {
  return (dispatch) => {
    dispatch(success(payload));
  };

  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_SHOW_SUCCESS_SCANNER_MSG, data };
  }
}


export function MoneyTrackerStartLoading() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return {
      type: moneyTrackerTypes.MONEYTRACKER_IS_LOADING_START,
    };
  }
}
export function MoneyTrackerEndLoading() {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return {
      type: moneyTrackerTypes.MONEYTRACKER_IS_LOADING_END,
    };
  }
}

export function saveInvoicePayload(payload) {
  return (dispatch) => {
    dispatch(success(payload));
  };

  function success(data) {
    return { type: moneyTrackerTypes.MONEYTRACKER_INVOICES_SAVE_PAYLOAD, data };
  }
}


export function clearMoneyTrackerData(payload) {
  return (dispatch) => {
    dispatch(success());
  };

  function success() {
    return { type: moneyTrackerTypes.MONEYTRACKER_CLEAR_DATA };
  }
}
