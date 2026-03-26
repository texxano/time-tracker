import { timeTracksTypes } from '../../type/TimeTracks/timeTracks.types';
import { timeTracksServices } from '../../../services/TimeTracks/timeTracks.services';
import * as SharedTrackingState from '../../../utils/sharedTrackingState';

export function startTimeTrack() {
    return dispatch => {
        // Guard: skip if already tracking (prevents duplicate START from QR when geofence already fired)
        if (SharedTrackingState.isWorkActuallyStarted() || SharedTrackingState.isStartInProgress()) {
            console.log('⚠️ SKIPPING QR START - Already tracking or START in progress');
            return;
        }
        
        // Acquire lock to prevent concurrent START calls
        if (!SharedTrackingState.acquireStartLock()) {
            console.log('⚠️ SKIPPING QR START - Lock acquisition failed');
            return;
        }
        
        timeTracksServices.startTimeTrack()
            .then(
                data => {
                    if (data.status) {
                        SharedTrackingState.releaseStartLock();
                        dispatch(failure(data));
                    } else {
                        // Sync shared tracking state
                        SharedTrackingState.markWorkStarted(
                            data.id || data.data?.id || `qr-${Date.now()}`,
                            data.start || data.data?.start || new Date().toISOString(),
                            data.companyLocationId || null
                        );
                        dispatch(success(data));
                        dispatch(isTracking(data.isTracking))
                    }
                }
            )
            .catch(error => {
                SharedTrackingState.releaseStartLock();
                console.log('❌ QR START failed:', error);
            });
    }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}


export function stopTimeTrack() {
    return dispatch => {
        // Guard: skip if not actually tracking
        if (!SharedTrackingState.isWorkActuallyStarted()) {
            console.log('⚠️ SKIPPING QR STOP - Not currently tracking');
            return;
        }
        
        timeTracksServices.stopTimeTrack()
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                        if (data.title) {
                        }
                    } else {
                        // Sync shared tracking state
                        SharedTrackingState.markWorkStopped();
                        dispatch(success(data));
                        dispatch(isTracking(false))
                    }
                }
            )
            .catch(error => {
                console.log('❌ QR STOP failed:', error);
                // If server says not authorized (track doesn't exist), clear local state
                const errorMessage = error?.message || error?.toString() || "";
                if (errorMessage.includes("Not.Authorized") || 
                    errorMessage.includes("401") ||
                    errorMessage.includes("403")) {
                    console.log('🧹 Clearing stale local tracking state');
                    SharedTrackingState.markWorkStopped();
                    dispatch(isTracking(false));
                }
            });
    }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export function startTimeTrackForProject(payload) {
    return dispatch => {
        // Guard: skip if already tracking
        if (SharedTrackingState.isWorkActuallyStarted() || SharedTrackingState.isStartInProgress()) {
            console.log('⚠️ SKIPPING START FOR PROJECT - Already tracking');
            return;
        }
        
        if (!SharedTrackingState.acquireStartLock()) {
            console.log('⚠️ SKIPPING START FOR PROJECT - Lock acquisition failed');
            return;
        }
        
        timeTracksServices.startTimeTrackForProject(payload)
            .then(
                data => {
                    if (data.status) {
                        SharedTrackingState.releaseStartLock();
                        dispatch(failure(data));
                    } else {
                        // Sync shared tracking state
                        SharedTrackingState.markWorkStarted(
                            data.id || data.data?.id || `proj-${Date.now()}`,
                            data.start || data.data?.start || new Date().toISOString(),
                            data.companyLocationId || null
                        );
                        dispatch(success(data));
                        dispatch(isTracking(data.isTracking))
                    }
                }
            )
            .catch(error => {
                SharedTrackingState.releaseStartLock();
                console.log('❌ START FOR PROJECT failed:', error);
            });
    }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export function createManualTimeTrack(payload) {
    return dispatch => {
        timeTracksServices.createManualTimeTrack(payload)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                        if (data.title) {
                        }
                    }
                }
            )
    }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}
export function updateTimeTrack(payload) {
    return dispatch => {
        timeTracksServices.updateTimeTrack(payload)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                        if (data.title) {
                        }
                    }
                }
            )
    }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}
export function deleteAllTimeTrack() {
    return dispatch => {
        dispatch(request());
        timeTracksServices.deleteAllTimeTrack()
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));

                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: timeTracksTypes.TIMETRACKS_REQUEST, data } }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}
export function deleteByIdTimeTrack(id) {
    return dispatch => {
        dispatch(request(id));
        timeTracksServices.deleteByIdTimeTrack(id,)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));

                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: timeTracksTypes.TIMETRACKS_REQUEST, data } }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export const isTracking = isTracking => ({ type: timeTracksTypes.IS_TIMETRACKS_SUCCESS, isTracking });
export const isChargingPerHour = isTracking => ({ type: timeTracksTypes.IS_CHARGING_PER_HOUR_SUCCESS, isTracking });

export function cloneTimeTrack(payload) {
    return dispatch => {
        timeTracksServices.cloneTimeTrack(payload)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                        if (data.title) {
                        }
                    }
                }
            )
    }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}
