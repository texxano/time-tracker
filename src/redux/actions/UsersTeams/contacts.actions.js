import { contactServices } from '../../../services/UsersTeams/contact.services';
import { contactTypes } from '../../type/UsersTeams/contact.types';


export function createContact(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        contactServices.createContact(payload)
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
    function request(data) { return { type: contactTypes.CONTACT_REQUEST, data } }
    function success(data) { return { type: contactTypes.CONTACT_SUCCESS, data } }
    function failure(data) { return { type: contactTypes.CONTACT_FAILURE, data } }
}
export function updateContact(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        contactServices.updateContact(payload)
            .then(
                data => {
                    try {
                        if (data.status) {
                            dispatch(failure(data));
                        } else {
                           
                        }
                    } catch (error) {
                        console.log(error)
                        dispatch(success(data));
                    }
                  
                }
            )
    }
    function request(data) { return { type: contactTypes.CONTACT_REQUEST, data } }
    function success(data) { return { type: contactTypes.CONTACT_SUCCESS, data } }
    function failure(data) { return { type: contactTypes.CONTACT_FAILURE, data } }
}
export function deleteContact(id) {
    return dispatch => {
        dispatch(request(id));
        contactServices.deleteContact(id)
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
    function request(data) { return { type: contactTypes.CONTACT_REQUEST, data } }
    function success(data) { return { type: contactTypes.CONTACT_SUCCESS, data } }
    function failure(data) { return { type: contactTypes.CONTACT_FAILURE, data } }
}