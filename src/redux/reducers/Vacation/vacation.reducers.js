import { vacationTypes } from "../../type/Vacation/vacation.types";

const initialState = {
  data: null,
  datefailure: null,
  lastActionType: null,
};

export function vacationsReducer(state = initialState, action) {
  switch (action.type) {
    case vacationTypes.VACATION_REQUEST:
      return {
        ...state,
        data: action.data,
        datefailure: null,
        lastActionType: vacationTypes.VACATION_REQUEST,
      };
    case vacationTypes.VACATION_SUCCESS:
      return {
        ...state,
        data: action.data,
        datefailure: null,
        lastActionType: vacationTypes.VACATION_SUCCESS,
      };
    case vacationTypes.VACATION_FAILURE:
      return {
        ...state,
        datefailure: action.data,
        lastActionType: vacationTypes.VACATION_FAILURE,
      };
    default:
      return state;
  }
}