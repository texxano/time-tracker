import { documentTasksTypes } from "../../type/DocumentTask/documentTasks.types";

const INITIAL_STATE = {
  draftsCounter: 0,
  draftsInvoice: {
    counter: 0,
  },
};

export function documentTaskDraftsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case documentTasksTypes.DOCUMENT__TASK_DRAFTS_INVOICE_INCREMENT:
      return {
        ...state,
        draftsCounter: state.draftsCounter + 1,
        draftsInvoice: {
          ...state.draftsInvoice,
          counter: state.draftsInvoice.counter + 1,
        },
      };

    case documentTasksTypes.DOCUMENT__TASK_DRAFTS_INVOICE_DECREMENT:
      return {
        ...state,
        draftsCounter: state.draftsCounter === 0 ? 0 : state.draftsCounter - 1,
        draftsInvoice: {
          ...state.draftsInvoice,
          counter:
            state.draftsInvoice.counter === 0
              ? 0
              : state.draftsInvoice.counter - 1,
        },
      };

    default:
      return state;
  }
}
