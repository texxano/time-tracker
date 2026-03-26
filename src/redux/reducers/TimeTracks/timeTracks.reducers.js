import { timeTracksTypes } from '../../type/TimeTracks/timeTracks.types'

export function timeTracksReducer(state = {}, action) {
    switch (action.type) {
        case timeTracksTypes.TIMETRACKS_REQUEST:
            return {
                timeTracksRequest: "timeTracksRequest",
            };
        case timeTracksTypes.TIMETRACKS_SUCCESS:
            return {
                data: action.data,
            };
        case timeTracksTypes.TIMETRACKS_FAILURE:
            return {
                data: action.data,
            };
        default:
            return state;
    }
};

export function isTimeTracksReducer(state = {}, action) {
    switch (action.type) {
        case timeTracksTypes.IS_TIMETRACKS_SUCCESS:
            return {
                isTracking: action.isTracking,
            };
        default:
            return state;
    }
};
export function isChargingPerHourReducer(state = {}, action) {
    switch (action.type) {
        case timeTracksTypes.IS_CHARGING_PER_HOUR_SUCCESS:
            return {
                isTracking: action.isTracking,
            };
        default:
            return state;
    }
};
