import { NavigationService } from "../navigator";
import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

/**
 * Handles in-app notification navigation based on notificationDestination
 * @param {Object} notificationDestination - The notificationDestination object from the notification
 * @param {Object} notificationData - The full notification data object (for backward compatibility)
 * @param {Object} options - Additional options like isSupervisor, messageArgument, etc.
 */
export const handleInAppNotificationNavigation = (
  notificationDestination,
  notificationData = {},
  options = {}
) => {
  const { isSupervisor = false, messageArgument = "" } = options;
  const { type, entityId } = notificationDestination || {};

  if (!type) {
    // Fallback to old navigation logic if notificationDestination is not available
    return handleLegacyNotificationNavigation(notificationData, options);
  }

  // Map notification types to navigation handlers
  switch (type) {
    case "Project":
      return handleProjectNavigation(entityId, messageArgument);
    
    case "CalendarEvent":
      return handleCalendarEventNavigation(entityId);
    
    case "ProjectStatusReport":
      return handleReportStatusNavigation();
    
    case "ProjectTimeReport":
      return handleReportTimeNavigation();
    
    case "TimeTrackerReport":
      return handleTimeTrackerNavigation();
    
    case "ShiftStartOrEnd":
      return handleShiftStartOrEndNavigation();
    
    case "Document":
      return handleDocumentNavigation(entityId, notificationData.projectId);
    
    case "Comment":
      return handleCommentNavigation(entityId, notificationData.projectId);
    
    case "VacationRequest":
      return handleVacationNavigation(isSupervisor);
    
    case "Task":
    case "ShotgunTask":
      return handleTaskNavigation(isSupervisor);
    
    case "DocumentTask":
      return handleDocumentTaskNavigation(entityId, notificationData.documentTaskId, notificationData.documentSubtaskId);
    
    case "Report":
      return handleReportNavigation(messageArgument);
    
    default:
      // If type doesn't match, try to navigate to the route name directly
      if (type) {
        NavigationService.navigate(type, entityId ? { id: entityId } : {});
      } else {
        NavigationService.navigate("Dashboard");
      }
  }
};

/**
 * Handles Project navigation
 */
const handleProjectNavigation = (entityId, projectName) => {
  if (entityId) {
    NavigationService.navigate("Project", {
      projectId: entityId,
      projectName: projectName,
      navigateFrom: "Notifications",
    });
  } else {
    NavigationService.navigate("Dashboard");
  }
};

/**
 * Handles CalendarEvent navigation
 */
const handleCalendarEventNavigation = (entityId) => {
  if (entityId) {
    NavigationService.navigate("Calendar", {
      locationActive: "3",
      id: entityId,
      update: false,
      navigateFrom: "Notifications",
    });
  } else {
    NavigationService.navigate("Calendar", {
      navigateFrom: "Notifications",
    });
  }
};

/**
 * Handles Report Status navigation
 */
const handleReportStatusNavigation = () => {
  NavigationService.navigate("Report", {
    location: "Dashboard",
    macroCategoryReport: 20, // First tab: "Извештај на статусот"
  });
};

/**
 * Handles Report Time navigation
 */
const handleReportTimeNavigation = () => {
  NavigationService.navigate("Report", {
    location: "Dashboard",
    macroCategoryReport: 10, // Second tab: "Извештаи за Време"
  });
};

/**
 * Handles TimeTracker navigation
 */
const handleTimeTrackerNavigation = () => {
  NavigationService.navigate("Time", {
    locationActive: "",
    id: "",
  });
};

/**
 * Handles ShiftStartOrEnd navigation
 */
const handleShiftStartOrEndNavigation = () => {
  NavigationService.navigate("Time", {
    locationActive: "",
    id: "",
  });
};

/**
 * Handles Document navigation
 */
const handleDocumentNavigation = (entityId, projectId) => {
  NavigationService.navigate("Documents", {
    projectId: projectId || entityId,
    fromNotifications: true,
  });
};

/**
 * Handles Comment navigation
 */
const handleCommentNavigation = (entityId, projectId) => {
  NavigationService.navigate("Comments", {
    projectId: projectId || entityId,
    fromNotifications: true,
  });
};

/**
 * Handles Vacation navigation
 */
const handleVacationNavigation = (isSupervisor) => {
  NavigationService.navigate("Vacation", {
    locationActive: isSupervisor ? "0" : "",
    id: "",
  });
};

/**
 * Handles Task navigation
 */
const handleTaskNavigation = (isSupervisor) => {
  NavigationService.navigate("Task", {
    locationActive: isSupervisor ? "0" : "",
    id: "",
  });
};

/**
 * Handles DocumentTask navigation
 */
const handleDocumentTaskNavigation = (entityId, documentTaskId, documentSubtaskId) => {
  const id = entityId || documentTaskId || documentSubtaskId;
  const locationActive = documentTaskId ? "1" : "2";
  const type = documentSubtaskId ? 1 : 0;
  
  NavigationService.navigate("DocumentTask", {
    locationActive: locationActive,
    id: id,
    type: type,
  });
};

/**
 * Handles Report navigation (opens in browser)
 */
const handleReportNavigation = (messageArgument) => {
  if (messageArgument) {
    WebBrowser.openBrowserAsync(messageArgument);
  } else {
    NavigationService.navigate("Dashboard");
  }
};

/**
 * Legacy navigation handler for backward compatibility
 * Uses the old notification structure with individual ID fields
 */
const handleLegacyNotificationNavigation = (data, options) => {
  const { isSupervisor = false, messageArgument = "" } = options;
  const {
    documentId,
    commentId,
    reportId,
    calendarId,
    projectId,
    vacationRequestId,
    shotgunTaskId,
    documentTaskId,
    documentSubtaskId,
  } = data;

  if (documentId) {
    NavigationService.navigate("Documents", {
      projectId: data.projectId,
      fromNotifications: true,
    });
  } else if (commentId) {
    NavigationService.navigate("Comments", {
      projectId: data.projectId,
      fromNotifications: true,
    });
  } else if (reportId) {
    if (messageArgument) {
      WebBrowser.openBrowserAsync(messageArgument);
    }
  } else if (calendarId) {
    NavigationService.navigate("Calendar", { navigateFrom: "Notifications" });
  } else if (vacationRequestId) {
    NavigationService.navigate("Vacation", {
      locationActive: isSupervisor ? "0" : "",
      id: "",
    });
  } else if (shotgunTaskId) {
    NavigationService.navigate("Task", {
      locationActive: isSupervisor ? "0" : "",
      id: "",
    });
  } else if (documentTaskId || documentSubtaskId) {
    NavigationService.navigate("DocumentTask", {
      locationActive: documentTaskId ? "1" : "2",
      id: documentTaskId ? documentTaskId : documentSubtaskId,
      type: documentSubtaskId ? 1 : 0,
    });
  } else if (projectId) {
    NavigationService.navigate("Project", {
      projectId: data.projectId,
      projectName: messageArgument,
      navigateFrom: "Notifications",
    });
  }
};

