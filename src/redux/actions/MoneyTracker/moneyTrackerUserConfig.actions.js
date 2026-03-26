import { moneyTrackerTypes } from '../../type/MoneyTracker/moneyTracker.types';
import { moneyTrackerUserConfigServices } from '../../../services/MoneyTracker/moneyTrackerUserConfig.services';

export function moneyTrackerUserConfig(payload) {
    return dispatch => {
        moneyTrackerUserConfigServices.moneyTrackerUserConfig(payload)
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
    function success(data) { return { type: moneyTrackerTypes.MONEYTRACKER_SUCCESS, data } }
    function failure(data) { return { type: moneyTrackerTypes.MONEYTRACKER_FAILURE, data } }
}
