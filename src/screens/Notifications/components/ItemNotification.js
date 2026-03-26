import React from "react";
import { useSelector, useDispatch } from "react-redux";
import * as WebBrowser from "expo-web-browser";
import { FormattedMessage } from "react-intl";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";

import { deleteByIdNotifications } from "../../../redux/actions/Notifications/notifications.actions";
import { NavigationService } from "../../../navigator";
import FormatDateTime from "../../../components/FormatDateTime";
import { styles } from "../../../asset/style/components/itemNotification";
import { handleInAppNotificationNavigation } from "../../../utils/inAppNotificationNavigation";

// Helper function to check if a message should be translated
const shouldTranslateMessage = (message) => {
    // If message contains dynamic content (project names, dates, user names), don't translate
    const dynamicPatterns = [
        /Root Project:/,
        /Project:/,
        /Period:/,
        /By .+\./,
        /members of/,
        /Time Logs for/,
        /Automatic Time Logs/,
        /added documents .+ to Document Subtask/,  // Matches "added documents [filename] to Document Subtask"
        /\w+ \w+ added documents/  // Matches "[First Last] added documents"
    ];
    
    return !dynamicPatterns.some(pattern => pattern.test(message));
};

// Extract NotificationNavigator to handle various types
export const NotificationNavigator = ({ data, color, isSupervisor }) => {
  const {
    message,
    messageArgument,
    notificationDestination,
  } = data;

  let displayMessage = message;
  let displayMessageArgument = messageArgument;

  // Handle app update notification - don't navigate, just show link
  const isUpdateNotification = message === "New.Update.For.Texxano.Application.Is.Available";

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.text}>
        {shouldTranslateMessage(displayMessage) ? (
          <FormattedMessage id={displayMessage} />
        ) : (
          displayMessage
        )}
      </Text>
      {isUpdateNotification ? (
        <Text style={styles.text}>
          {Platform.OS === "android" ? (
            <Text
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=texxano.v1.android"
                )
              }
              style={{ textDecorationLine: "underline", color: "#0070c9" }}
            >
              <FormattedMessage id="update.now" />
            </Text>
          ) : (
            <Text
              onPress={() =>
                Linking.openURL("https://apps.apple.com/app/id1589908664")
              }
              style={{ textDecorationLine: "underline", color: "#0070c9" }}
            >
              <FormattedMessage id="update.now" />
            </Text>
          )}
        </Text>
      ) : null}
      <Text style={[styles.text, { color: color }]}>
        {displayMessageArgument}
      </Text>
    </View>
  );
};

const ItemNotification = ({ index, data }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const notificationsRequestId = state.notifications.notificationsRequestId;
  const vacationIsSupervisor = state.userDataModule.vacationIsSupervisor;
  const shotgunIsSupervisor = state.userDataModule?.shotgunIsSupervisor;
  const handleDeleteByIdNotifications = (id) => {
    dispatch(deleteByIdNotifications(id));
  };

  // Determine type and corresponding style and color
  const notificationType = Object.keys(styles.borderColor).find(
    (type) => data[type]
  );
  const color =
    styles.borderColor[notificationType] || styles.borderColor.general;
  const style = {
    ...styles.baseBox,
    borderLeftColor: color,
    borderColor: color,
  };
  const isSupervisor =
    notificationType === "vacationRequestId"
      ? vacationIsSupervisor
      : shotgunIsSupervisor;

  // Determine navigation handler based on notificationDestination
  const handleNotificationPress = () => {
    const { notificationDestination, message, messageArgument } = data;
    
    // Don't navigate for app update notifications (handled by link in UI)
    if (message === "New.Update.For.Texxano.Application.Is.Available") {
      return;
    }
    
    // Use new notificationDestination structure if available
    if (notificationDestination) {
      handleInAppNotificationNavigation(
        notificationDestination,
        data,
        {
          isSupervisor,
          messageArgument,
        }
      );
    } else {
      // Fallback to legacy navigation (for backward compatibility)
      handleInAppNotificationNavigation(
        null,
        data,
        {
          isSupervisor,
          messageArgument,
        }
      );
    }
  };

  return (
    <TouchableOpacity 
      key={index} 
      style={style}
      onPress={handleNotificationPress}
      activeOpacity={0.7}
    >
      <View style={{ width: "90%", flex: 1 }}>
        <NotificationNavigator
          data={data}
          color={color}
          isSupervisor={isSupervisor}
        />
        <Text style={styles.message}>
          <FormatDateTime datevalue={data.date} type={2} />
        </Text>
      </View>
      {notificationsRequestId === data.id ? (
        <ActivityIndicator size="small" color="#6c757d" />
      ) : (
        <TouchableOpacity
          onPress={() => {
            handleDeleteByIdNotifications(data.id);
          }}
        >
          <EvilIcons name="close" size={24} color="#6c757d" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default ItemNotification;
