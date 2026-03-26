import { reportsTypes } from '../../type/Reports/reports.types'

export function reportsReducer(state = {}, action) {
    switch (action.type) {
        case reportsTypes.REPORTS_REQUEST:
            return {
                data: action.data,
            };
        case reportsTypes.REPORTS_SUCCESS:
            return {
                data: action.data,
            };
        case reportsTypes.REPORTS_FAILURE:
            return {
                datefailure: action.data,
            };
        default:
            return state;
    }
};