import { combineReducers } from 'redux';
import { authentication, requestRefreshToken, rememberLogin } from './Authentication/userAuth.reducers';
import { userToken } from './Authentication/userToken.reducers'
import { userDataReducers, userDataRoleReducers, userDataModuleReducers } from './Authentication/userData.reducers'
import { forgotPasswordReducers } from './Authentication/forgotPassword.reducers'
import { translationReducer } from './Translations/translations.reducers';
import { getProjectDataReducer, projectReducer, idRootProjectReducer, projectCountReducer, favoriteProjectReducer } from './Project/project.reducers';
import { documentReducer, documentCountReducer, documentSatisticReducer } from './Project/document.reducers';
import { commentReducer, commentCountReducer } from './Project/comment.reducers';
import { activitiesCountReducer } from './Project/activities.reducers'
import { userReducer, userCountReducer } from './UsersTeams/user.reducers';
import { teamsReducer } from './UsersTeams/teams.reducers';
import { permissionsReducers } from './Permissions/permissions.reducers';
import { refreshScreenReducer } from './RefreshScreen/refreshScreen.reducers';
import { notificationsReducer, notificationsCountReducer } from './Notifications/notifications.reducers'
import { devicesReducer, deviceIDReducer } from './Notifications/devices.reducers'
import { muteUnMuteNotificationsReducer } from './Notifications/muteUnMuteNotifications.reducers'
import { timeTracksReducer, isTimeTracksReducer, isChargingPerHourReducer } from './TimeTracks/timeTracks.reducers'
import { reportsReducer } from './Reports/reports.reducers'
import { appUpdateReducer } from './SettingsAdmin/appUpdate.reducers'
import { jobsReducer } from './SettingsAdmin/jobs.reducers'
import { calendarReducers } from './Calendar/calendar.reducers'
import { vacationsReducer } from './Vacation/vacation.reducers'
import { openAiReducer } from './OpenAi/openAi.reducers'
import { tasksReducer, taskCountReducer} from './Task/task.reducers'
import { moneyTrackerReducer, moneyTrackerCountReducer, moneyTrackerInvoicesReducer } from './MoneyTracker/moneyTracker.reducers';
import { gpsTracksReducer } from './GPSTracks/gpsTracks.reducers'
import { documentTaskReducer, documentTaskCountReducer } from './DocumentTask/documentTask.reducers'
import { mainCurrencyReducer } from './MoneyTracker/moneyTracker.reducers';
import { contactReducer } from './UsersTeams/contact.reducers';
import { documentTaskDraftsReducer } from './DocumentTask/DocumentTaskDrafts.reducer';
import { chatReducers } from './Chat/Chat.reducers';

const rootReducer = combineReducers({

    translation: translationReducer,
    auth: authentication,
    requestToken: requestRefreshToken,
    userToken: userToken,
    userData: userDataReducers,
    userDataRole: userDataRoleReducers,
    userDataModule: userDataModuleReducers,
    rememberLogin: rememberLogin,
    forgotPassword: forgotPasswordReducers,
    getProjectData: getProjectDataReducer,
    project: projectReducer,
    projectCount: projectCountReducer,
    idRootProject: idRootProjectReducer,
    favoriteProject: favoriteProjectReducer,
    documents: documentReducer,
    documentCount: documentCountReducer,
    documentSatistic: documentSatisticReducer,
    comment: commentReducer,
    commentCount: commentCountReducer,
    activitiesCount: activitiesCountReducer,
    user: userReducer,
    userCount: userCountReducer,
    teams: teamsReducer,
    contact:contactReducer,
    permissions: permissionsReducers,
    refreshScreen: refreshScreenReducer,
    notifications: notificationsReducer,
    notificationsCount: notificationsCountReducer,
    muteUnMuteNotifications: muteUnMuteNotificationsReducer,
    devices: devicesReducer,
    idDevice: deviceIDReducer,
    timeTracks: timeTracksReducer,
    isTimeTracks: isTimeTracksReducer,
    isChargingPerHour: isChargingPerHourReducer,
    reports: reportsReducer,
    appUpdate: appUpdateReducer,
    jobs: jobsReducer,
    calendar: calendarReducers,
    vacations: vacationsReducer,
    openAi: openAiReducer,
    tasks: tasksReducer,
    taskCount: taskCountReducer,
    moneyTracker: moneyTrackerReducer,
    moneyTrackerCount: moneyTrackerCountReducer,
    moneyTrackerInvoices: moneyTrackerInvoicesReducer,
    currencies: mainCurrencyReducer,
    gpsTrack: gpsTracksReducer,
    documentTask: documentTaskReducer,
    documentTaskCount: documentTaskCountReducer,
    documentTaskDrafts:documentTaskDraftsReducer,
    chat: chatReducers,
});

export default rootReducer;
