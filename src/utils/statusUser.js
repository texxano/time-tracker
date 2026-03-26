export function check() {
  const maxNumber = 10000;
  const check = Math.floor((Math.random() * maxNumber) + 1);
  return check;
}

import { store } from '../redux/store/store';

export function auth() {
  const state = store.getState();
  const token = state.userToken.token;
  const tokenExpiration = state.userToken.tokenExpiration;

  console.log('🔐 [Auth Check] Full state:', {
    userToken: state.userToken,
    userData: state.userData,
    auth: state.auth
  });

  console.log('🔐 [Auth Check] Token details:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenExpiration,
    currentTime: new Date().getTime(),
    timeLeft: tokenExpiration ? tokenExpiration - new Date().getTime() : 'N/A'
  });

  if (token && tokenExpiration) {
    const timeLeft = tokenExpiration - new Date().getTime();
    // Allow tokens that are still valid or expired by less than 5 minutes
    if (timeLeft > -300000) { // 5 minutes grace period
      console.log('✅ [Auth Check] Token is valid, time left:', timeLeft);
      return true;
    } else {
      console.log('❌ [Auth Check] Token expired, time left:', timeLeft);
      return false;
    }
  } else {
    console.log('❌ [Auth Check] Missing token or expiration');
    console.log('❌ [Auth Check] Token exists:', !!token);
    console.log('❌ [Auth Check] Expiration exists:', !!tokenExpiration);
    return false;
  }
}