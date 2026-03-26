import { vacationTypes } from "../../type/Vacation/vacation.types";
import { vacationRequestsServices } from "../../../services/Vacation/vacationRequests.services";

export function requestsVacationDays(payload) {
  return (dispatch) => {
    dispatch(request(payload.requestedFrom));
    try {
      vacationRequestsServices.requestsVacationDays(payload).then((data) => {
        if (data.status) {
          dispatch(failure(data));
        } else {
          dispatch(success(data));
        }
      });
    } catch (error) {
      console.log("error requestsVacationDays", error);
      dispatch(failure(error));
    }

  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}

export function requestsVacationHours(payload) {
  return (dispatch) => {
    dispatch(request(payload.requestedFrom));
    try {
      vacationRequestsServices.requestsVacationHours(payload).then((data) => {
        if (data.status) {
          dispatch(failure(data));
        } else {
          dispatch(success(data));
        }
      });
    } catch (error) {
      console.log("error requestsVacationHours", error);
      dispatch(failure(error));
    }
  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}

export function requestsVacationSick(payload) {
  return (dispatch) => {
    dispatch(request(payload.requestedFrom));
    vacationRequestsServices.requestsVacationSick(payload).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}

export function approveRequestVacation(payload) {
  return (dispatch) => {
    dispatch(request(payload.id));
    vacationRequestsServices.approveRequestVacation(payload).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}
export function denyRequestVacation(payload) {
  return (dispatch) => {
    dispatch(request(payload.id));
    vacationRequestsServices.denyRequestVacation(payload).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}
export function cancelRequestVacation(id) {
  return async (dispatch) => {
    dispatch(request(id));
    const data_1 = await vacationRequestsServices.cancelRequestVacation(id);
    if (data_1.status) {
      dispatch(failure(data_1));
      return Promise.reject(data_1);
    } else {
      dispatch(success(data_1));
    }
  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}

export function checkAvailability(payload) {
  return (dispatch) => {
    dispatch(request(payload.RequestedFrom));
    vacationRequestsServices.checkAvailability(payload).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function request(data) {
    return { type: vacationTypes.VACATION_REQUEST, data };
  }
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}

export function closeSickLeave(dataBody) {
  return (dispatch) => {
    vacationRequestsServices.closeSickLeave(dataBody).then((data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        dispatch(success(data));
      }
    });
  };
  function success(data) {
    return { type: vacationTypes.VACATION_SUCCESS, data };
  }
  function failure(data) {
    return { type: vacationTypes.VACATION_FAILURE, data };
  }
}
