import React, { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { reportDiscordError } from "../services/DiscordAlerts/context";

/**
 * Error boundary component that catches JavaScript errors in child components during rendering, in lifecycle methods,
 * and in constructors of the whole tree below it, and reports them to Sentry and Discord.
 *
 * @augments React.Component
 */
class ErrorBoundary extends React.Component {
  /**
   * @param {Object} props
   * @param {React.ReactNode} props.fallback - Optional UI to render when an error is caught
   * @param {React.ReactNode} props.children
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Updates state when an error is thrown by a child component, causing the fallback UI to render on the next update.
   * @param {Error} error
   * @returns {{ hasError: boolean, error: Error|null }}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Reports the caught error to Sentry and Discord after an update.
   * @param {Error} error
   * @param {Object} errorInfo
   */
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
    void reportDiscordError({
      source: "react.error-boundary",
      error,
      feature: "ui",
      action: "render",
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * Provider that wraps the app with an ErrorBoundary and installs a global runtime error handler via ErrorUtils to catch
 * errors outside React's rendering pipeline, reporting them to Sentry and Discord.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {React.ReactNode} [props.fallback] - Optional fallback UI when an error is caught
 * @param {Function} [props.onError] - Optional callback invoked with each caught error after reporting
 */
export function ErrorProvider({ children, fallback, onError }) {
  useEffect(() => {
    let previousHandler = null;

    try {
      const errorUtils = global.ErrorUtils;
      if (!errorUtils?.setGlobalHandler) return;

      previousHandler = errorUtils.getGlobalHandler?.();

      errorUtils.setGlobalHandler((error, isFatal) => {
        try {
          Sentry.captureException(error);
          void reportDiscordError({
            source: "app.global",
            error,
            feature: "runtime",
            action: isFatal ? "fatal" : "non-fatal",
          });
        } catch {
          // Error reporting must not interrupt the runtime's native error flow.
        }

        try {
          previousHandler?.(error, isFatal);
        } catch {
          // A faulty prior handler must not prevent default handling.
        }
      });
    } catch {
      // ErrorUtils varies by runtime; global handler setup is best-effort.
    }

    return () => {
      // Cleanup is best-effort since ErrorUtils does not expose a restore function.
    };
  }, [onError]);

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}