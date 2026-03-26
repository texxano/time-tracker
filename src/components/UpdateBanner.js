import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { FormattedMessage } from 'react-intl';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = '@updateBannerDismissed';

const UpdateBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBannerStatus();
  }, []);

  // Listen for notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { data, body } = response.notification.request.content;
      
      // Check if this is an update notification
      const notificationBody = body?.toLowerCase() || "";
      const notificationTitle = response.notification.request.content.title?.toLowerCase() || "";
      
      const isUpdateNotification = 
        notificationBody.includes("update") || 
        notificationBody.includes("app store") || 
        notificationBody.includes("play store") ||
        notificationTitle.includes("update") ||
        notificationTitle.includes("app store") ||
        notificationTitle.includes("play store") ||
        data?.type === "app_update" ||
        data?.isAppUpdate === true;

      if (isUpdateNotification) {
        // Mark banner as dismissed
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
      }
    });

    return () => subscription.remove();
  }, []);

  const checkBannerStatus = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
      if (dismissed === 'true') {
        setIsVisible(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Error checking banner status:', error);
      setIsLoading(false);
    }
  };

  // Listen for update notifications when they arrive
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const { data, body } = notification.request.content;
      
      // Check if this is an update notification
      const notificationBody = body?.toLowerCase() || "";
      const notificationTitle = notification.request.content.title?.toLowerCase() || "";
      
      const isUpdateNotification = 
        notificationBody.includes("update") || 
        notificationBody.includes("app store") || 
        notificationBody.includes("play store") ||
        notificationTitle.includes("update") ||
        notificationTitle.includes("app store") ||
        notificationTitle.includes("play store") ||
        data?.type === "app_update" ||
        data?.isAppUpdate === true;

      if (isUpdateNotification) {
        // Show the banner when an update notification arrives
        console.log('📢 Update notification received, showing banner');
        setIsVisible(true);
        // Clear the dismissed flag so banner appears
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => subscription.remove();
  }, []);

  const handleUpdatePress = async () => {
    try {
      // Mark banner as dismissed
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setIsVisible(false);

      const appStoreURL = "https://apps.apple.com/app/id6737259084"; // iOS App Store URL (replace with your actual app ID)
      const playStoreURL = "https://play.google.com/store/apps/details?id=texxano.v1.android"; // Android Google Play Store URL
      
      const storeURL = Platform.OS === 'ios' ? appStoreURL : playStoreURL;
      
      console.log('🔄 Opening store from banner:', storeURL);
      const canOpen = await Linking.canOpenURL(storeURL);
      
      if (canOpen) {
        await Linking.openURL(storeURL);
      } else {
        console.log('❌ Cannot open store URL');
      }
    } catch (error) {
      console.log('❌ Error opening store:', error);
    }
  };

  if (!isVisible || isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="cloud-download-outline" size={20} color="#007bff" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            <FormattedMessage id="update.available.title" />
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleUpdatePress}
      >
        <Text style={styles.buttonText}>
          <FormattedMessage id="update.now" />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    padding: 12,
    marginHorizontal: 7,
    marginVertical: 8,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default UpdateBanner;
