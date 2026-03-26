import { teamsTypes } from '../../type/UsersTeams/teams.types'

export function teamsReducer(state = {}, action) {
    switch (action.type) {
        case teamsTypes.TEAMS_REQUEST:
            return {
                teamsRequest: 'teamsRequest'
            };
        case teamsTypes.TEAMS_SUCCESS:
            return {
                data: action.data
            };
        case teamsTypes.TEAMS_FAILURE:
            return {
                data: action.data,
                title: action.data.title,
            };
        default:
            return state;
    }
};
