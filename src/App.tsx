import React, { useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation-android';
import {
  checkMultiple,
  openSettings,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  request,
} from 'react-native-permissions';
import Button from './Button';

const PERMISSIONS_IOS = (({
  LOCATION_ALWAYS,
  LOCATION_WHEN_IN_USE,
  MOTION,
}) => ({
  LOCATION_ALWAYS,
  LOCATION_WHEN_IN_USE,
  MOTION,
}))(PERMISSIONS.IOS);

const PERMISSIONS_ANDROID = (({
  ACCESS_COARSE_LOCATION,
  ACCESS_FINE_LOCATION,
  ACCESS_BACKGROUND_LOCATION,
  ACTIVITY_RECOGNITION,
}) => ({
  ACCESS_COARSE_LOCATION,
  ACCESS_FINE_LOCATION,
  ACCESS_BACKGROUND_LOCATION,
  ACTIVITY_RECOGNITION,
}))(PERMISSIONS.ANDROID);

const PLATFORM_PERMISSIONS = Platform.select({
  ios: PERMISSIONS_IOS,
  android: PERMISSIONS_ANDROID,
});

const PERMISSION_VALUES = Object.values(PLATFORM_PERMISSIONS);

const App = () => {
  const [statuses, setStatuses] = useState<Record<string, PermissionStatus>>(
    {}
  );

  const checkPermissions = async () => {
    const permissions = await checkMultiple(PERMISSION_VALUES);
    setStatuses(permissions);
  };

  useEffect(() => {
    const listener = (state: AppStateStatus) => {
      if (state === 'active') {
        checkPermissions();
      }
    };

    AppState.addEventListener('change', listener);

    return () => {
      AppState.removeEventListener('change', listener);
    };
  });

  useEffect(() => {
    BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange] success:', event);
    });

    BackgroundGeolocation.onLocation(
      (location) => {
        console.log('[onLocation] success:', location);
      },
      (error) => {
        console.log('[onLocation] ERROR:', error);
      }
    );

    BackgroundGeolocation.ready({
      reset: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    });

    return () => {
      BackgroundGeolocation.removeAllListeners();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.title}>Status</Text>
            <Button
              title="Open app settings"
              onPress={openSettings}
              style={styles.button}
            />
            <Button
              title="Check permissions"
              onPress={checkPermissions}
              style={styles.button}
            />
            <View>
              {Object.keys(PLATFORM_PERMISSIONS).map((permission, index) => {
                const value = PERMISSION_VALUES[index];
                const status = statuses[value];

                if (!status) {
                  return null;
                }

                return (
                  <Text key={permission}>
                    {permission}: {status}
                  </Text>
                );
              })}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Location</Text>
            <View>
              <Button
                title="Request 'when in use' (bg-geo)"
                onPress={async () => {
                  await BackgroundGeolocation.setConfig({
                    locationAuthorizationRequest: 'WhenInUse',
                  });

                  BackgroundGeolocation.requestPermission()
                    .then((status) => console.log('success', status))
                    .catch((error) => console.log('failure', error));
                }}
                style={styles.button}
              />
              <Button
                title="Upgrade to 'always' (bg-geo)"
                onPress={async () => {
                  await BackgroundGeolocation.setConfig({
                    locationAuthorizationRequest: 'Always',
                  });

                  BackgroundGeolocation.requestPermission()
                    .then((status) => console.log('success', status))
                    .catch((error) => console.log('failure', error));
                }}
                style={styles.button}
              />
              {Platform.OS === 'android' && (
                <>
                  <Button
                    title="Request 'when in use'"
                    onPress={async () => {
                      const response = await request(
                        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                      );
                      console.log(response);
                    }}
                    style={styles.button}
                  />
                  <Button
                    title="Upgrade to 'always'"
                    onPress={async () => {
                      const response = await request(
                        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
                      );
                      console.log(response);
                    }}
                    style={styles.button}
                  />
                </>
              )}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Motion/Activity</Text>
            <View>
              <Button
                title="Request motion/activity"
                style={styles.button}
                onPress={() => {
                  request(
                    Platform.select({
                      ios: PERMISSIONS.IOS.MOTION,
                      android: PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
                    }) as Permission
                  )
                    .then(console.log)
                    .catch(console.error);
                }}
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>BG Geo Library</Text>
            <View>
              <Button
                title="Start"
                style={styles.button}
                onPress={() => {
                  BackgroundGeolocation.start()
                    .then(() => console.log('started'))
                    .catch(console.error);
                }}
              />
              <Button
                title="Start Geofences"
                style={styles.button}
                onPress={() => {
                  BackgroundGeolocation.startGeofences()
                    .then(() => console.log('started geofences'))
                    .catch(console.error);
                }}
              />
              <Button
                title="Stop"
                style={styles.button}
                onPress={() => {
                  BackgroundGeolocation.stop()
                    .then(() => console.log('stopped'))
                    .catch(console.error);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginRight: 16,
    marginBottom: 16,
  },
});

export default App;
