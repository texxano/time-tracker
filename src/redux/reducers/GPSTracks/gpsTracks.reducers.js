import { gpsTracksTypes } from '../../type/GPSTracks/gpsTracks.types'

export function gpsTracksReducer(state = {}, action) {
    switch (action.type) {
        case gpsTracksTypes.GPSTRACKS_REQUEST:
            return {
                gpsTracksRequest: "gpsTracksRequest",
            };
        case gpsTracksTypes.GPSTRACKS_SUCCESS:
            return {
                data: action.data,
            };
        case gpsTracksTypes.GPSTRACKS_FAILURE:
            return {
                data: action.data,
            };
        default:
            return state;
    }
};
