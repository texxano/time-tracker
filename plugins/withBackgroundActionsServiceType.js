const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin to add foregroundServiceType to react-native-background-actions service
 * Required for Android 14+ (API 34+) when targetSdk >= 34
 * Using "dataSync" type since we're sending API requests, not tracking location
 */
const withBackgroundActionsServiceType = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    // Find the RNBackgroundActionsTask service
    if (application.service) {
      const bgActionService = application.service.find(
        (service) =>
          service.$['android:name'] === 'com.asterinet.react.bgactions.RNBackgroundActionsTask'
      );

      if (bgActionService) {
        // Add foregroundServiceType for data sync (API calls)
        bgActionService.$['android:foregroundServiceType'] = 'dataSync';
        console.log('✅ Added foregroundServiceType="dataSync" to RNBackgroundActionsTask');
      } else {
        // Service doesn't exist yet, add it
        if (!application.service) {
          application.service = [];
        }
        application.service.push({
          $: {
            'android:name': 'com.asterinet.react.bgactions.RNBackgroundActionsTask',
            'android:foregroundServiceType': 'dataSync',
          },
        });
        console.log('✅ Created RNBackgroundActionsTask service with foregroundServiceType="dataSync"');
      }
    } else {
      // No services array exists, create it
      application.service = [
        {
          $: {
            'android:name': 'com.asterinet.react.bgactions.RNBackgroundActionsTask',
            'android:foregroundServiceType': 'dataSync',
          },
        },
      ];
      console.log('✅ Created services array with RNBackgroundActionsTask');
    }

    return config;
  });
};

module.exports = withBackgroundActionsServiceType;
