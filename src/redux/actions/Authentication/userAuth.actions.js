import { userAuthTypes } from "../../type/Authentication/userAuth.types";
import { userAuthService } from "../../../services/Authentication/userAuth.services";
import { NavigationService } from "../../../navigator";
import { translation } from "../Translations/translation.action";
import { postDataDevice } from "../Notifications/devices.actions";
import { notificationsCount } from "../Notifications/notifications.actions";
import {
  isTracking,
  isChargingPerHour,
} from "../TimeTracks/timeTracks.actions";
import { Alert } from "react-native";

export function login(payload, payloadMobile, remember) {
  return (dispatch) => {
    dispatch(request(payload.username));
    userAuthService.login(payload).then(async (data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        let tokenExpirationEpoch = new Date(data.tokenExpiration).getTime();
        let dataSuccess = { ...data, tokenExpirationEpoch };
console.log(data,'data od login')
        await Promise.all([
          dispatch(successData(data)),
          dispatch(translation(data.language)),
          dispatch(successToken(dataSuccess)),
          dispatch(successDataRole(dataSuccess)),
          dispatch(successDataModule(dataSuccess)),
          dispatch(success(data)),
          dispatch(isTracking(data.isTrackingTime)),
          dispatch(isChargingPerHour(data.isChargingPerHour)),
          dispatch(notificationsCount(data.notificationCount)),
        ]);
        
        if (remember) {
          let dataRemember = {
            username: payload.username,
            password: payload.password,
            remember,
          };
          dispatch(rememberLogin(dataRemember));
        } else {
          dispatch(notRememberLogin(remember));
        }
        
        // Save push token for ALL users (including admins) to enable notifications
        if (payloadMobile.expoPushToken) {
          console.log('📱 Saving push token to backend:', payloadMobile.expoPushToken);
          try {
            await dispatch(postDataDevice(payloadMobile));
            console.log('✅ Push token saved successfully');
          } catch (tokenError) {
            console.log('❌ Failed to save push token:', tokenError?.message || tokenError);
          }
        } else {
          console.log('⚠️ No push token available to save');
        }
        
        NavigationService.navigate("Dashboard", {});
      
      }
    });
  };

  function request(data) {
    return { type: userAuthTypes.LOGIN_REQUEST, data };
  }
  function success(data) {
    return { type: userAuthTypes.LOGIN_SUCCESS, data };
  }
  function successData(data) {
    return { type: userAuthTypes.USER_DATA_SUCCESS, data };
  }
  function successDataRole(data) {
    return { type: userAuthTypes.USER_DATA_ROLE_SUCCESS, data };
  }
  function successDataModule(data) {
    return { type: userAuthTypes.USER_DATA_MODULE_SUCCESS, data };
  }
  function successToken(dataSuccess) {
    return { type: userAuthTypes.TOKEN_LOGIN_SUCCESS, dataSuccess };
  }
  function rememberLogin(data) {
    return { type: userAuthTypes.REMEMBER_LOGIN, data };
  }
  function notRememberLogin(data) {
    return { type: userAuthTypes.NOT_REMEMBER_LOGIN, data };
  }
  function failure(data) {
    return { type: userAuthTypes.LOGIN_FAILURE, data };
  }
}

export function loginGoogle(payload, clientId, payloadMobile) {
  return (dispatch) => {
    dispatch(request(payload.idToken));
    userAuthService.loginGoogle(payload, clientId).then(async (data) => {
      if (data.status) {
        dispatch(failure(data));
      } else {
        let tokenExpirationEpoch = new Date(data.tokenExpiration).getTime();
        let dataSuccess = { ...data, tokenExpirationEpoch };
        
        await Promise.all([
          dispatch(successData(data)),
          dispatch(translation(data.language)),
          dispatch(successToken(dataSuccess)),
          dispatch(successDataRole(dataSuccess)),
          dispatch(successDataModule(dataSuccess)),
          dispatch(success(data)),
          dispatch(isTracking(data.isTrackingTime)),
          dispatch(isChargingPerHour(data.isChargingPerHour)),
          dispatch(notificationsCount(data.notificationCount)),
        ]);
        
        // Save push token for Google login
        if (payloadMobile.expoPushToken) {
          console.log('📱 Saving push token to backend (Google):', payloadMobile.expoPushToken);
          try {
            await dispatch(postDataDevice(payloadMobile));
            console.log('✅ Push token saved successfully');
          } catch (tokenError) {
            console.log('❌ Failed to save push token:', tokenError?.message || tokenError);
          }
        } else {
          console.log('⚠️ No push token available to save (Google)');
        }
        
        NavigationService.navigate("Dashboard", {});
      
      }
    });
  };

  function request(data) {
    return { type: userAuthTypes.LOGIN_REQUEST, data };
  }
  function success(data) {
    return { type: userAuthTypes.LOGIN_SUCCESS, data };
  }
  function successData(data) {
    return { type: userAuthTypes.USER_DATA_SUCCESS, data };
  }
  function successDataRole(data) {
    return { type: userAuthTypes.USER_DATA_ROLE_SUCCESS, data };
  }
  function successDataModule(data) {
    return { type: userAuthTypes.USER_DATA_MODULE_SUCCESS, data };
  }
  function successToken(dataSuccess) {
    return { type: userAuthTypes.TOKEN_LOGIN_SUCCESS, dataSuccess };
  }
  function failure(data) {
    return { type: userAuthTypes.LOGIN_FAILURE, data };
  }
}

export function logout(payload) {
  return (dispatch) => {
    // 🚀 Cleanup chat services before logout
    try {
      const centralizedUserStatusService = require('../../../services/Chat/centralizedUserStatusService').default;
      const UserStatusManager = require('../../../services/Chat/userStatusManager').default;
      
      centralizedUserStatusService.cleanup();
      UserStatusManager.cleanup();
    } catch (error) {
      // Cleanup error - continue with logout
    }
    
    if (payload?.token) {
      userAuthService
        .logout(payload)
        .then((data) => {
          dispatch(success(data));
        })
        .catch((error) => {
          console.error("Logout error:", error);
          // Even if the API call fails, we should still logout locally
          dispatch(success());
        });
      return;
    }

    dispatch(success());
  };

  function success(data) {
    return { type: userAuthTypes.LOGOUT, data };
  }
}
export function logoutAll() {
  return (dispatch) => {
    // 🚀 Cleanup chat services before logout
    try {
      const centralizedUserStatusService = require('../../../services/Chat/centralizedUserStatusService').default;
      const UserStatusManager = require('../../../services/Chat/userStatusManager').default;
      
      centralizedUserStatusService.cleanup();
      UserStatusManager.cleanup();
    } catch (error) {
      // Cleanup error - continue with logout
    }
    
    userAuthService.logoutAll().then((data) => {
      dispatch(success(data));
    }).catch((error) => {
      console.error('LogoutAll error:', error);
      // Even if the API call fails, we should still logout locally
      dispatch(success());
    });
  };

  function success(data) {
    return { type: userAuthTypes.LOGOUT, data };
  }
}

export function refreshTokenAction(refreshToken, userId, retryCount = 0) {

  
  return (dispatch) => {
    function request(data) {
      return { type: userAuthTypes.TOKEN_REFRESH_REQUEST, data };
    }
    function stopRequest(data) {
      return { type: userAuthTypes.STOP_TOKEN_REFRESH_REQUEST, data };
    }
    function successDataRole(data) {
      return { type: userAuthTypes.USER_DATA_ROLE_SUCCESS, data };
    }
    function successDataModule(data) {
      return { type: userAuthTypes.USER_DATA_MODULE_SUCCESS, data };
    }
    function success(dataSuccess) {
      return { type: userAuthTypes.TOKEN_REFRESH_SUCCESS, dataSuccess };
    }
    function successData(data) {
      return { type: userAuthTypes.USER_DATA_SUCCESS, data };
    }
    function logoutsuccess() {
      return { type: userAuthTypes.LOGOUT };
    }
    function failure(data) {
      return { type: userAuthTypes.LOGIN_FAILURE, data };
    }

    dispatch(request(refreshToken));
    

    userAuthService
      .refreshTokenService(refreshToken, userId)
      .then(async (data) => {

        dispatch(stopRequest(data.status));
        
        // Only logout for specific authentication failures, not general network errors
        if (data.status === 401 && (data.title === "Refresh.Token.Not.Found" || data.title === "Refresh.Token.Expired")) {

          await dispatch(logoutsuccess());
          return;
        }
        
        // For other 4xx errors, retry up to 2 times before giving up
        if (data.status >= 400 && data.status < 500 && data.status !== 401) {

          
          if (retryCount < 2) {

            setTimeout(() => {
              dispatch(refreshTokenAction(refreshToken, userId, retryCount + 1));
            }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
          } else {

          }
          return;
        }
        
        
        // If it's a 500 error with "Refresh.Token.Not.Found", the token is invalid/expired
        if (data.status === 500 && data.title === "Refresh.Token.Not.Found") {

          await dispatch(logoutsuccess());
          return;
        }
        
        // If it's a 500 error but not "Refresh.Token.Not.Found", retry up to 2 times
        if (data.status === 500) {

          
          if (retryCount < 2) {

            setTimeout(() => {
              dispatch(refreshTokenAction(refreshToken, userId, retryCount + 1));
            }, 2000 * (retryCount + 1)); // Longer backoff for server errors: 2s, 4s
          } else {

          }
          return;
        }
        // Success path: no data.status present
        let tokenExpirationEpoch = new Date(data.tokenExpiration).getTime();
        let dataSuccess = { ...data, tokenExpirationEpoch };
        
        await Promise.all([
          dispatch(success(dataSuccess)),
          dispatch(successData(data)),
          dispatch(successDataRole(dataSuccess)),
          dispatch(successDataModule(dataSuccess)),
          dispatch(translation(data.language)),
          dispatch(isTracking(data.isTrackingTime)),
          dispatch(isChargingPerHour(data.isChargingPerHour)),
          dispatch(notificationsCount(data.notificationCount)),
        ]);
      })
      .catch((error) => {

        dispatch(stopRequest(error));
        
        // Retry network errors up to 2 times instead of immediately logging out
        if (retryCount < 2) {

          setTimeout(() => {
            dispatch(refreshTokenAction(refreshToken, userId, retryCount + 1));
          }, 3000 * (retryCount + 1)); // 3s, 6s backoff for network errors
          return;
        }
        
        // Retry once after 2 seconds if it's a server error (but not token not found)
        if (error.message && error.message.includes('500') && !error.message.includes('Refresh.Token.Not.Found')) {

          setTimeout(() => {

            dispatch(refreshTokenAction(refreshToken, userId));
          }, 2000);
        } else if (error.message && error.message.includes('Refresh.Token.Not.Found')) {

          dispatch(logoutsuccess());
        }
      });
  };
}
export function forgotPassword(email) {
  return (dispatch) => {
    dispatch(request(email));
    userAuthService.forgotPassword(email).then(async (data) => {
      if (data.status <= 299) {
        dispatch(success(data.status));
      } else {
        dispatch(failure(data));
      }
    });
  };
  function request(data) {
    return { type: userAuthTypes.FORGOT_PASSWORD_REQUEST, data };
  }
  function success(data) {
    return { type: userAuthTypes.FORGOT_PASSWORD_SUCCESS, data };
  }
  function failure(data) {
    return { type: userAuthTypes.FORGOT_PASSWORD_FAILURE, data };
  }
}
