import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshTokenAction } from "../redux/actions/Authentication/userAuth.actions";

const useTokenRefresher = (refreshToken, userId) => {
  const dispatch = useDispatch();
  const tokenExpiration = useSelector((state) => state.userToken.tokenExpiration);
  const intervalRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const lastWarningRef = useRef(0);

  useEffect(() => {
    // Validate required data
    if (!refreshToken || !userId || !tokenExpiration) {
      console.warn("[useTokenRefresher] Missing required values. Skipping setup.");
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const refresh = async () => {
      const now = Date.now();
      const timeLeft = tokenExpiration - now;

      // Only warn about expired tokens once per minute to reduce spam
      if (now >= tokenExpiration) {
        const timeSinceLastWarning = now - lastWarningRef.current;
        if (timeSinceLastWarning > 60000) { // Only warn once per minute
          console.warn("[useTokenRefresher] Token already expired. Skipping refresh.");
          lastWarningRef.current = now;
        }
        return;
      }

      // Only refresh if token expires in less than 5 minutes
      if (timeLeft > 300000) { // 5 minutes
        return;
      }

      if (isRefreshingRef.current) {
        return;
      }

      isRefreshingRef.current = true;
      console.log("[useTokenRefresher] Refreshing token...");

      try {
        await dispatch(refreshTokenAction(refreshToken, userId));
        console.log("[useTokenRefresher] Token refreshed successfully.");
      } catch (error) {
        console.error("[useTokenRefresher] Failed to refresh token:", error);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Initial call
    refresh();

    // Set interval to run every 4 minutes (240,000 ms)
    intervalRef.current = setInterval(refresh, 240000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshToken, userId, tokenExpiration]);
};

export default useTokenRefresher;
