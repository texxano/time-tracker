import { moneyTrackerTypes } from "../../type/MoneyTracker/moneyTracker.types";

export function moneyTrackerReducer(state = {}, action) {
  switch (action.type) {
    case moneyTrackerTypes.MONEYTRACKER_REQUEST:
      return {
        moneyTrackerRequest: "moneyTrackerRequest",
      };
    case moneyTrackerTypes.MONEYTRACKER_SUCCESS:
      return {
        data: action.data,
      };
    case moneyTrackerTypes.MONEYTRACKER_FAILURE:
      return {
        datefailure: action.data,
      };
    case moneyTrackerTypes.MONEYTRACKER_CLEAR_DATA:
      return state;
    default:
      return state;
  }
}
export function moneyTrackerCountReducer(state = {}, action) {
  switch (action.type) {
    case moneyTrackerTypes.MONEYTRACKER_COUNT:
      return {
        count: action.count,
      };
    default:
      return state;
  }
}

const initialCurrencyState = {
  mainCurrency:"MKD"
}

export function mainCurrencyReducer(state = initialCurrencyState, action) {
  switch (action.type) {
    case moneyTrackerTypes.MONEYTRACKER_SAVE_MAIN_CURRENCY:
      return {
        ...state,
        mainCurrency: action.data,
      };
    default:
      return state;
  }
}
export function moneyTrackerInvoicesReducer(state = {
  showScannerSuccessMsg:true,
  moneyTrackerIsloading:false
}, action) {
  switch (action.type) {
    case moneyTrackerTypes.MONEYTRACKER_IS_LOADING_START:
      return {
        ...state,
        moneyTrackerIsloading: true,
      };
      case moneyTrackerTypes.MONEYTRACKER_IS_LOADING_END:
        return {
          ...state,
          moneyTrackerIsloading: false,
        };
    case moneyTrackerTypes.MONEYTRACKER_INVOICES_PRICE:
      return {
        ...state,
        prices: action.data,
      };
      case moneyTrackerTypes.MONEYTRACKER_SHOW_SUCCESS_SCANNER_MSG:
        return {
          ...state,
          showScannerSuccessMsg: action.data,
        };
        case moneyTrackerTypes.MONEYTRACKER_INVOICES_SAVE_PAYLOAD:
          return {
            ...state,
            createdInvoicePayload: action.data,
          };
    default:
      return state;
  }
}
