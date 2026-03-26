import { gpsTracksTypes } from '../../../type/Tracks/gpsTracks.types';
import { gpsWorkplaceServices } from '../../../../services/Tracks/Gps/gpsWorkplace.services';
import { toast } from 'react-toastify';
import { history } from '../../../../utils/history';

export function createGpsWorkplace(dataBody) {
    return dispatch => {
        dispatch(request(dataBody.name));
        gpsWorkplaceServices.createGpsWorkplace(dataBody)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                        toast.error("Error X")
                    } else {
                        dispatch(success(data.status));
                        toast.success("Successful Save ✓")
                        history.push('/gps/workplaces');
                    }
                }
            )
    }
    function request(data) { return { type: gpsTracksTypes.GPSTRACKS_REQUEST, data } }
    function success(data) { return { type: gpsTracksTypes.GPSTRACKS_SUCCESS, data } }
    function failure(data) { return { type: gpsTracksTypes.GPSTRACKS_FAILURE, data } }
}

export function updateGpsWorkplace(dataBody) {
    return dispatch => {
        dispatch(request(dataBody.name));
        gpsWorkplaceServices.updateGpsWorkplace(dataBody)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                        toast.success("Successful Save ✓")
                        history.push('/gps/workplaces');
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: gpsTracksTypes.GPSTRACKS_REQUEST, data } }
    function success(data) { return { type: gpsTracksTypes.GPSTRACKS_SUCCESS, data } }
    function failure(data) { return { type: gpsTracksTypes.GPSTRACKS_FAILURE, data } }
}

export function deleteGpsWorkplace(id) {
    return dispatch => {
        dispatch(request());
        gpsWorkplaceServices.deleteGpsWorkplace(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                        toast.success("Successful Save ✓")
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: gpsTracksTypes.GPSTRACKS_REQUEST, data } }
    function success(data) { return { type: gpsTracksTypes.GPSTRACKS_SUCCESS, data } }
    function failure(data) { return { type: gpsTracksTypes.GPSTRACKS_FAILURE, data } }
}
