import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import rootReducer from "../reducers/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
const persistConfig = {
  key: "TEXXANO",
  storage: AsyncStorage,
  whitelist: [
    "auth",
    "requestToken",
    "userToken",
    "userData",
    "userDataRole",
    "rememberLogin",
    "translation",
    "projectCount",
    "getProjectData",
    "idRootProject",
    "documentCount",
    "commentCount",
    "activitiesCount",
    "userCount",
    "notificationsCount",
    "idDevice",
    "isTimeTracks",
    "userDataModule",
    "isChargingPerHour",
    "documentSatistic",
    "taskCount",
    "moneyTrackerCount",
    "documentTaskCount"
  ],
  blacklist: [
    "forgotPassword",
    "project",
    "favoriteProject",
    "documents",
    "comment",
    "user",
    "teams",
    "permissions",
    "refreshScreen",
    "notifications",
    "muteUnMuteNotifications",
    "devices ",
    "timeTracks",
    "appUpdate",
    "jobs",
    "calendar",
    "vacations",
    "openAi",
    "tasks",
    "moneyTracker",
    "gpsTrack",
    "documentTask"
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, applyMiddleware(thunk));
let persistor = persistStore(store);

export { store, persistor };
