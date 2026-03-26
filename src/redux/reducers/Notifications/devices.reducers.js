import { devicesTypes } from '../../type/Notifications/devices.types'

export function devicesReducer(state = {}, action) {
    switch (action.type) {
        case devicesTypes.DEVICES_REQUEST:
            return {
                data: action.data
            };
        case devicesTypes.DEVICES_UPDATE_REQUEST:
            return {
                dataDevice: action.data
            };
        case devicesTypes.DEVICES_SUCCESS:
            return {
                data: action.data
            };
        case devicesTypes.DEVICES_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};

export function deviceIDReducer(state = {}, action) {
    switch (action.type) {

        case devicesTypes.DEVICES_SUCCESS_ID:
            return {
                idDevice: action.data.id
            };
        default:
            return state;
    }
};