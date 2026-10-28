import React, { createContext, useState, useEffect } from "react";
import * as Notifications from "expo-notifications";

/**
 * Context value type for notifications state.
 * @typedef {Object} NotificationsContextValue
 * @property {Object|null} lastNotificationResponse - The latest notification response received
 * @property {Function} addResponseListener - Wrapper to add a notification response listener with automatic state tracking
 */

const NotificationsContext = createContext(null);

/**
 * Provider that manages notification response state and listener lifecycle.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export function NotificationsProvider({ children }) {
  const [lastNotificationResponse, setLastNotificationResponse] = useState(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        setLastNotificationResponse(response);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Adds a notification response listener that automatically tracks the latest response
   * in state and forwards the event to the provided handler.
   *
   * @param {Function} handler - Callback invoked with each notification response
   * @returns {{ remove: Function }} Subscription object with a remove method
   */
  const addResponseListener = (handler) => {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      setLastNotificationResponse(response);
      handler(response);
    });
  };

  return (
    <NotificationsContext.Provider value={{ lastNotificationResponse, addResponseListener }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsContext };