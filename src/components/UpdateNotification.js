import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

// Check for updates every 5 minutes while app is running
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000;

const UpdateNotification = () => {
    const appState = useRef(AppState.currentState);
    const lastCheckTime = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Initial check on mount
        checkAndApplyUpdates();

        // Set up periodic checking
        intervalRef.current = setInterval(() => {
            checkAndApplyUpdates();
        }, UPDATE_CHECK_INTERVAL);

        // Check when app returns to foreground
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground - check for updates (throttled)
                const now = Date.now();
                if (now - lastCheckTime.current > 60000) { // At least 1 minute since last check
                        checkAndApplyUpdates();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            subscription?.remove();
        };
    }, []);

    const checkAndApplyUpdates = async () => {
        try {
            // Check for updates in production AND preview builds
            if (Updates.channel) {
                lastCheckTime.current = Date.now();
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                }
            }
        } catch (error) {
            // Silently fail - don't spam logs
            if (error.message && !error.message.includes('no-op')) {
                console.log('❌ Error checking for updates:', error.message);
            }
        }
    };

    // Return null - this component doesn't render anything
    return null;
};

export default UpdateNotification;

