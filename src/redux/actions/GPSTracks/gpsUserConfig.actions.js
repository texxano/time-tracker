import { gpsTracksTypes } from '../../type/GPSTracks/gpsTracks.types';
import {gpsUserConfigServices } from '../../../services/GPSTracks/gpsUserConfig.services';

export function gpsUserConfig(payload) {
    return dispatch => {
        gpsUserConfigServices.gpskUserConfig(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                    }
                }
            )
    }
    function success(data) { return { type: gpsTracksTypes.GPSTRACKS_SUCCESS, data } }
    function failure(data) { return { type: gpsTracksTypes.GPSTRACKS_FAILURE, data } }
}
