import { contactTypes } from "../../type/UsersTeams/contact.types";


export function contactReducer(state = {}, action) {
    switch (action.type) {
        case contactTypes.CONTACT_REQUEST:
            return {
                contactRequest: 'contactRequest'
            };
        case contactTypes.CONTACT_SUCCESS:
            return {
                data: action.data
            };
        case contactTypes.CONTACT_FAILURE:
            return {
                data: action.data,
                title: action.data.title,
            };
        default:
            return state;
    }
};
