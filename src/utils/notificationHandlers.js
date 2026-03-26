import { Linking, Platform, Alert } from "react-native";
import { NavigationService } from "../navigator";
import { isInsideAnyGeofence, getGeofencesStatus } from "./locationModule";
import { timeTracksServices } from "../services/TimeTracks/timeTracks.services";
import * as SharedTrackingState from './sharedTrackingState';

export const detectNotificationTypes = (data, body, title) => {
  const notificationBody = body?.toLowerCase() || "";
  const notificationTitle = title?.toLowerCase() || "";

  return {
    isChatNotification: data?.type === "chat_message",
    isReportStatustNotification: data?.notificationDestination?.type === "ProjectStatusReport",
    isReportTimeNotification: data?.notificationDestination?.type === "ProjectTimeReport",
    isTimeTrackerReportNotification: data?.notificationDestination?.type === "TimeTrackerReport",
    isShiftStartOrEndNotification: data?.notificationDestination?.type === "ShiftStartOrEnd",
    isProjectNotification: data?.notificationDestination?.type === "Project",
    isCalendarEventNotification: data?.notificationDestination?.type === "CalendarEvent",
    isUpdateNotification:
      notificationBody.includes("new update for texxano application is available") ||
      notificationBody.includes("app store") ||
      notificationBody.includes("play store") ||
      notificationTitle.includes("update") ||
      notificationTitle.includes("app store") ||
      notificationTitle.includes("play store") ||
      data?.type === "app_update" ||
      data?.isAppUpdate === true,
    isAutoStopNotification: data?.type === "auto_stop",
    isHeartbeatNotification: 
      data?.type === "heartbeat_inactive" ||
      data?.type === "inactivity_alert" ||
      data?.type === "app_inactive" ||
      notificationTitle.includes("heartbeat") ||
      notificationTitle.includes("inactive") ||
      notificationBody.includes("heartbeat") ||
      notificationBody.includes("not responding"),
  };
};

export const handleChatNotification = async (data) => {
  try {
    const deepLink = data?.deep_link || `texxano://ChatMessages/${data.chatId}`;
    Linking.openURL(deepLink);
  } catch (error) {
    NavigationService.navigate("ChatMessages", {
      chat: { id: data.chatId },
    });
  }
};

export const handleReportStatusNotification = async (data) => {
  try {
    const deepLink = data?.deep_link || `texxano://Report/20`;
    Linking.openURL(deepLink);
  } catch (error) {
    NavigationService.navigate("Report", {
      location: "Dashboard",
      macroCategoryReport: 20,
    });
  }
};

export const handleReportTimeNotification = async (data) => {
  try {
    const deepLink = data?.deep_link || `texxano://Report/10`;
    Linking.openURL(deepLink);
  } catch (error) {
    NavigationService.navigate("Report", {
      location: "Dashboard",
      macroCategoryReport: 10,
    });
  }
};

export const handleTimeTrackerReportNotification = async (data) => {
  try {
    const deepLink = data?.deep_link || `texxano://Time`;
    Linking.openURL(deepLink);
  } catch (error) {
    NavigationService.navigate("Time", {
      locationActive: "",
      id: "",
    });
  }
};

export const handleShiftStartOrEndNotification = async (data) => {
  try {
    const deepLink = data?.deep_link || `texxano://Time`;
    Linking.openURL(deepLink);
  } catch (error) {
    NavigationService.navigate("Time", {
      locationActive: "",
      id: "",
    });
  }
};

export const handleProjectNotification = async (data) => {
  try {
    const projectId = data?.notificationDestination?.entityId;
    const deepLink = data?.deep_link || (projectId ? `texxano://Project/${projectId}` : null);
    if (deepLink) {
      Linking.openURL(deepLink);
    } else {
      throw new Error('No project ID or deep link available');
    }
  } catch (error) {
    const projectId = data?.notificationDestination?.entityId;
    if (projectId) {
      NavigationService.navigate("Project", {
        projectId: projectId,
        navigateFrom: "Notifications",
      });
    } else {
      NavigationService.navigate("Dashboard");
    }
  }
};

export const handleCalendarEventNotification = async (data) => {
  try {
    const eventId = data?.notificationDestination?.entityId;
    const deepLink = data?.deep_link || (eventId ? `texxano://Calendar/${eventId}` : `texxano://Calendar`);
    if (deepLink) {
      Linking.openURL(deepLink);
    } else {
      throw new Error('No deep link available');
    }
  } catch (error) {
    const eventId = data?.notificationDestination?.entityId;
    if (eventId) {
      NavigationService.navigate("Calendar", {
        locationActive: "3",
        id: eventId,
        update: false,
        navigateFrom: "Notifications",
      });
    } else {
      NavigationService.navigate("Calendar", {
        navigateFrom: "Notifications",
      });
    }
  }
};

export const handleUpdateNotification = async () => {
  try {
    const appStoreURL = "https://apps.apple.com/app/id1589908664";
    const playStoreURL = "https://play.google.com/store/apps/details?id=texxano.v1.android";
    const storeURL = Platform.OS === 'ios' ? appStoreURL : playStoreURL;
    const canOpen = await Linking.canOpenURL(storeURL);
    if (canOpen) {
      await Linking.openURL(storeURL);
    } else {
      NavigationService.navigate("Dashboard");
    }
  } catch (error) {
    NavigationService.navigate("Dashboard");
  }
};

export const handleAutoStopNotification = async (data) => {
  const minutesInactive = Math.round((data?.secondsInactive || 180) / 60);
  
  // Show alert to user
  Alert.alert(
    'Time Tracking Stopped',
    `Your session was automatically stopped after ${minutesInactive} minutes of inactivity.`,
    [{ text: 'OK' }]
  );
};

export const handleHeartbeatNotification = async (data) => {
  try {
    // Guard: Check cooldown before allowing STOP
    if (SharedTrackingState.isInStopCooldown()) {
      return;
    }
    
    const isInside = await isInsideAnyGeofence();
    if (isInside) {
      return;
    } else {
      try {
        await timeTracksServices.stopTimeTrack();
        await SharedTrackingState.markWorkStopped();
      } catch (stopError) { /* ignore */ }
    }
  } catch (error) { /* ignore */ }
};

export const handleGenericNotification = (data) => {
  const deepLink = data?.deep_link || data?.path;
  
  if (deepLink && deepLink !== "Dashboard") {
    NavigationService.navigate(deepLink);
  } else {
    NavigationService.navigate("Dashboard");
  }
};

export const handleNotificationResponse = async (response) => {
  try {
    const { data, body } = response.notification.request.content;
    const notificationTitle = response.notification.request.content.title || "";
    
    const notificationTypes = detectNotificationTypes(data, body, notificationTitle);
    
    if (notificationTypes.isAutoStopNotification) {
      await handleAutoStopNotification(data);
      return;
    }
    
    if (notificationTypes.isHeartbeatNotification) {
      await handleHeartbeatNotification(data);
      return;
    }
    
    // Handle notifications based on type
    if (notificationTypes.isChatNotification) {
      await handleChatNotification(data);
    } else if (notificationTypes.isReportStatustNotification) {
      await handleReportStatusNotification(data);
    } else if (notificationTypes.isReportTimeNotification) {
      await handleReportTimeNotification(data);
    } else if (notificationTypes.isTimeTrackerReportNotification) {
      await handleTimeTrackerReportNotification(data);
    } else if (notificationTypes.isShiftStartOrEndNotification) {
      await handleShiftStartOrEndNotification(data);
    } else if (notificationTypes.isProjectNotification) {
      await handleProjectNotification(data);
    } else if (notificationTypes.isCalendarEventNotification) {
      await handleCalendarEventNotification(data);
    } else if (notificationTypes.isUpdateNotification) {
      await handleUpdateNotification();
    } else {
      handleGenericNotification(data);
    }
  } catch (error) {
    NavigationService.navigate("Dashboard");
  }
};

