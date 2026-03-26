import { userAuthTypes } from '../../type/Authentication/userAuth.types';

export function userDataReducers(state = {}, action) {
  switch (action.type) {
    case userAuthTypes.USER_DATA_SUCCESS:
      return {
        firstName: action.data.firstName,
        lastName: action.data.lastName,
        email: action.data.email,
        id: action.data.id,
        isAdministrator: action.data.isAdministrator,
        isTeamLead: action.data.isTeamLead,
        team: action.data.team,
        phoneNumber: action.data.phoneNumber,
        language: action.data.language,
        countryCode: action.data.countryCode,
        timeZoneId: action.data.timeZoneId,
        color: action.data.color,
        enableTracking: action.data.enableTracking,
        allowMobileTimeTracking: action.data.allowMobileTimeTracking,
        apiRelease: action.data.apiRelease,
      };
    default:
      return state
  }
}
export function userDataRoleReducers(state = {}, action) {
  switch (action.type) {
    case userAuthTypes.USER_DATA_ROLE_SUCCESS:
      return {
        rootId: action.data.rootId,
        userId: action.data.id,
        isOwnerForRoot: action.data.isOwnerForRoot,
        isEditorForRoot: action.data.isEditorForRoot,
        isSupport: action.data.isSupport,
        teamId: action.data.teamId,
        isAdministrator: action.data.isAdministrator,
        
      };
    default:
      return state
  }
}
export function userDataModuleReducers(state = {}, action) {
  switch (action.type) {
    case userAuthTypes.USER_DATA_MODULE_SUCCESS:
      return {
        vacationEnabled: action.data.vacationEnabled,
        vacationIsSupervisor: action.data.vacationIsSupervisor,
        timeTrackerEnabled: action.data.timeTrackerEnabled,
        timeTrackerIsSupervisor: action.data.timeTrackerIsSupervisor,
        shotgunEnabled: action.data.shotgunEnabled,
        shotgunIsSupervisor: action.data.shotgunIsSupervisor,
        gpsEnabled: action.data.gpsEnabled,
        gpsIsSupervisor: action.data.gpsIsSupervisor,
        documentEnabled: action.data.documentEnabled,
        documentIsSupervisor: action.data.documentIsSupervisor,
        openAiEnabled: action.data.openAiEnabled,
        openAiIsSupervisor: action.data.openAiIsSupervisor,
        calendarmEnabled: action.data.calendarmEnabled,
        calendarmIsSupervisor: action.data.calendarmIsSupervisor,
        moneyTrackerEnabled: action.data.moneyTrackerEnabled,
        moneyTrackerIsSupervisor: action.data.moneyTrackerIsSupervisor,
        documentTaskEnabled: action.data.documentTaskEnabled,
        documentTaskIsSupervisor: action.data.documentTaskIsSupervisor,
      };
    case userAuthTypes.USER_DATA_MODULE_FAILURE:
      return {};
    case userAuthTypes.LOGOUT:
      return {};
    default:
      return state
  }
}
