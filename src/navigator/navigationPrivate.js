import React, { useEffect } from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { useSelector } from "react-redux";
import UserStatusManager from "../services/Chat/userStatusManager";
import Dashboard from "../screens/Dashboard/Dashboard";
// Hidden imports - routes temporarily disabled
// import Project from "../screens/Project/Project";
// import Documents from "../screens/Project/Documents";
// import Comments from "../screens/Project/Comments";
// import TaskProject from "../screens/Project/TaskProject";
// import MoneyProject from "../screens/Project/MoneyProject";
// import Users from "../screens/UsersTeams/TeamsContainer";
// import UsersPermissions from "../screens/Project/UsersPermissions";
// import Activity from "../screens/Project/Activity";
// import ReportProject from "../screens/Project/ReportProject";
import Profile from "../screens/Profile/Profile";
import Password from "../screens/Profile/Password";
// import Notifications from "../screens/Notifications/Notifications";
import NotificationsSettings from "../screens/Profile/NotificationsSettings";
import Devices from "../screens/Profile/Devices";
import Overview from "../screens/MoreInfo/Overview";
import Presentation from "../screens/MoreInfo/Presentation";
import Privacy from "../screens/MoreInfo/Privacy";
// import FavoriteProject from "../screens/FavoriteProject/FavoriteProject";
// import Report from "../screens/Report/Report";
// import GlobalSearch from "../screens/GlobalSearch/GlobalSearch";
// import SettingsAdmin from "../screens/SettingsAdmin/BackgroundJobs";
// import Calendar from "../screens/Calendar/CalendarContainer";
// import DueDate from "../screens/DueDate/DueDate";
// import Vacation from "../screens/Vacation/VacationContainer";
// import Task from "../screens/Task/TaskContainer.js";
// import TimeTracks from "../screens/TimeTracks/TimeHeaderNavigate/TimeTracks";
// import TimeTracksCharge from "../screens/TimeTracks/TimeHeaderNavigate/TimeTracksCharge";
// import Time from "../screens/TimeTracks/TimeContainer";
// import MoneyTracker from "../screens/MoneyTracker/MoneyTrackerContainer";
// import OpenAi from "../screens/OpenAi/OpenAiContainer";
// import Gps from "../screens/GPSTracks/GPSTrackerContainer";
import GeofenceTest from "../screens/GPSTracks/GeofenceTest";
// import DocumentTask from "../screens/DocumentTask/DocumentTaskContainer";
// import ChatMessages from "../screens/Chat/ChatMessages/ChatMessages";
// import ChatRoomList from "../screens/Chat/ChatRoomList/ChatRoomList";

import { enableScreens } from "react-native-screens";

enableScreens();

const NavigatorPrivate = createStackNavigator(
  {
    Dashboard,
    Profile,
    Password,
    NotificationsSettings,
    Devices,
    // Hidden routes - keeping only essential navigation
    // Project,
    // Documents,
    // Comments,
    // TaskProject,
    // MoneyProject,
    // Users,
    // UsersPermissions,
    // Activity,
    // ReportProject,
    // Notifications,
    Overview,
    Presentation,
    Privacy,
    // FavoriteProject,
    // TimeTracks,
    // TimeTracksCharge,
    // Report: Report,
    // GlobalSearch,
    // SettingsAdmin,
    // Calendar,
    // DueDate,
    // Vacation,
    // Time,
    // Task,
    // MoneyTracker,
    // OpenAi,
    // Gps,
      GeofenceTest,
    // DocumentTask,
    // ChatMessages,
    // ChatRoomList: ChatRoomList,
  },
  {
    defaultNavigationOptions: {
      headerShown: null,
      animationEnabled: false,
    },
  }
);

// Add navigation state change listener
const AppContainer = createAppContainer(NavigatorPrivate);

// Wrap with navigation state tracking
const NavigatorPrivateWithTracking = React.forwardRef((props, ref) => {
  const userId = useSelector((state) => state.userData?.id);
  const rootId = useSelector((state) => state.userDataRole?.rootId);
  const { initialRouteName, ...otherProps } = props;

  // Initialize UserStatusManager when user data is available
  useEffect(() => {
    if (userId && rootId) {
      UserStatusManager.initialize(userId, rootId);
    }
  }, [userId, rootId]);

  return (
    <AppContainer
      ref={ref}
      initialRouteName={initialRouteName}
      onNavigationStateChange={(prevState, currentState, action) => {
        // Get current route name
        const getCurrentRouteName = (state) => {
          if (!state || !state.routes || state.routes.length === 0) {
            return "Unknown";
          }

          const route = state.routes[state.index];

          if (route.state) {
            // Dive into nested navigators
            return getCurrentRouteName(route.state);
          }

          return route.routeName || route.name;
        };

        const currentRouteName = getCurrentRouteName(currentState);

        // Handle user status based on route change
        UserStatusManager.handleRouteChange(currentRouteName);
      }}
    />
  );
});

export default NavigatorPrivateWithTracking;
