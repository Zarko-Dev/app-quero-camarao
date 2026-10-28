import React, { createContext, useState } from "react";
import * as Notifications from "expo-notifications";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

/**
 * Context value type for permissions state.
 * @typedef {Object} PermissionsContextValue
 * @property {string|null} notificationPermission - Current notification permission status
 * @property {string|null} trackingPermission - Current tracking permission status
 * @property {Function} requestAll - Requests all runtime permissions and updates state
 */

const PermissionsContext = createContext(null);

/**
 * Requests notification and tracking permissions from the user.
 *
 * @returns {Promise<{notificationPermission: string, trackingPermission: string}>}
 */
async function requestAll() {
  const { status: notificationStatus } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
    android: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  const { status: trackingStatus } = await requestTrackingPermissionsAsync();

  return {
    notificationPermission: notificationStatus,
    trackingPermission: trackingStatus,
  };
}

/**
 * Provider that manages notification and tracking permission state.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export function PermissionsProvider({ children }) {
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [trackingPermission, setTrackingPermission] = useState(null);

  const handleRequestAll = async () => {
    const result = await requestAll();
    setNotificationPermission(result.notificationPermission);
    setTrackingPermission(result.trackingPermission);
    return result;
  };

  return (
    <PermissionsContext.Provider
      value={{
        notificationPermission,
        trackingPermission,
        requestAll: handleRequestAll,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export { PermissionsContext };