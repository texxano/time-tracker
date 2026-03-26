/**
 * Heartbeat Diagnostic Helper
 * 
 * Provides comprehensive diagnostics for heartbeat system health
 * Use this to identify why heartbeats might be failing
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getForegroundHeartbeatStatus, getHeartbeatLogs } from '../services/foregroundHeartbeatService';

/**
 * Run comprehensive diagnostic check
 * Returns detailed report of system health
 */
export const runHeartbeatDiagnostic = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    checks: [],
    recommendations: [],
    overallHealth: 'unknown',
  };

  // Check 1: Authentication Token
  try {
    const persistedData = await AsyncStorage.getItem('persist:TEXXANO');
    const hasToken = persistedData && JSON.parse(persistedData).userToken;
    results.checks.push({
      name: 'Authentication Token',
      status: hasToken ? 'pass' : 'fail',
      message: hasToken ? 'Token found in storage' : 'No authentication token - user not logged in',
    });
    if (!hasToken) {
      results.recommendations.push('User must log in first');
    }
  } catch (error) {
    results.checks.push({
      name: 'Authentication Token',
      status: 'error',
      message: 'Error checking token: ' + error.message,
    });
  }

  // Check 2: Location Permissions
  try {
    const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
    
    results.checks.push({
      name: 'Foreground Location Permission',
      status: fgStatus === 'granted' ? 'pass' : 'fail',
      message: `Status: ${fgStatus}`,
    });
    
    results.checks.push({
      name: 'Background Location Permission',
      status: bgStatus === 'granted' ? 'pass' : 'fail',
      message: `Status: ${bgStatus}`,
    });
    
    if (fgStatus !== 'granted') {
      results.recommendations.push('Grant foreground location permission');
    }
    if (bgStatus !== 'granted') {
      results.recommendations.push('Grant "Allow all the time" location permission');
    }
  } catch (error) {
    results.checks.push({
      name: 'Location Permissions',
      status: 'error',
      message: 'Error checking permissions: ' + error.message,
    });
  }

  // Check 3: Heartbeat Task Status
  try {
    const status = await getForegroundHeartbeatStatus();
    
    results.checks.push({
      name: 'Foreground Service',
      status: status.isRunning ? 'pass' : 'fail',
      message: status.isRunning ? 'Running' : 'Not running',
    });
    
    if (!status.isRunning) {
      results.recommendations.push('Start time tracking to activate heartbeat system');
    }
  } catch (error) {
    results.checks.push({
      name: 'Heartbeat Task Status',
      status: 'error',
      message: 'Error checking task status: ' + error.message,
    });
  }

  // Check 4: Recent Heartbeat Activity
  try {
    const logs = await getHeartbeatLogs();
    const recentLogs = logs.slice(-10);
    const lastLog = logs[logs.length - 1];
    
    if (lastLog) {
      const timeSinceLastLog = Date.now() - new Date(lastLog.timestamp).getTime();
      const minutesSince = Math.floor(timeSinceLastLog / 60000);
      
      results.checks.push({
        name: 'Recent Heartbeat Activity',
        status: minutesSince < 2 ? 'pass' : 'warn',
        message: `Last activity: ${minutesSince} minute(s) ago`,
        details: lastLog.message,
      });
      
      if (minutesSince >= 2) {
        results.recommendations.push('No recent heartbeat activity - system might be throttled');
      }
      
      // Check for failures in recent logs
      const recentFailures = recentLogs.filter(log => 
        log.message.includes('FAILED') || log.message.includes('Error')
      );
      
      if (recentFailures.length > 0) {
        results.checks.push({
          name: 'Heartbeat Errors',
          status: 'warn',
          message: `${recentFailures.length} failures in last 10 attempts`,
          details: recentFailures.map(f => f.message).join(', '),
        });
        results.recommendations.push('Check network connectivity and API availability');
      }
    } else {
      results.checks.push({
        name: 'Recent Heartbeat Activity',
        status: 'fail',
        message: 'No heartbeat logs found',
      });
      results.recommendations.push('Heartbeat system has never run successfully');
    }
  } catch (error) {
    results.checks.push({
      name: 'Recent Heartbeat Activity',
      status: 'error',
      message: 'Error reading logs: ' + error.message,
    });
  }

  // Check 5: Network Connectivity (basic check)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    results.checks.push({
      name: 'Network Connectivity',
      status: response.ok ? 'pass' : 'warn',
      message: response.ok ? 'Internet accessible' : 'Internet accessible but response not OK',
    });
  } catch (error) {
    results.checks.push({
      name: 'Network Connectivity',
      status: 'fail',
      message: 'No internet connection: ' + error.message,
    });
    results.recommendations.push('Check WiFi/mobile data connection');
  }

  // Calculate overall health
  const passCount = results.checks.filter(c => c.status === 'pass').length;
  const failCount = results.checks.filter(c => c.status === 'fail').length;
  const totalChecks = results.checks.length;
  
  if (failCount === 0) {
    results.overallHealth = 'excellent';
  } else if (failCount <= 2 && passCount >= totalChecks - 2) {
    results.overallHealth = 'good';
  } else if (failCount <= 3) {
    results.overallHealth = 'fair';
  } else {
    results.overallHealth = 'poor';
  }

  return results;
};

/**
 * Show diagnostic results to user
 */
export const showDiagnosticResults = async () => {
  const results = await runHeartbeatDiagnostic();
  
  const healthEmoji = {
    excellent: '💚',
    good: '💛',
    fair: '🧡',
    poor: '❤️',
    unknown: '❓',
  };
  
  const statusEmoji = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
    error: '⚠️',
  };
  
  let message = `Overall Health: ${healthEmoji[results.overallHealth]} ${results.overallHealth.toUpperCase()}\n\n`;
  
  // Add check results
  message += 'Diagnostic Results:\n';
  results.checks.forEach(check => {
    message += `${statusEmoji[check.status]} ${check.name}\n   ${check.message}\n`;
  });
  
  // Add recommendations if any
  if (results.recommendations.length > 0) {
    message += '\n📋 Recommendations:\n';
    results.recommendations.forEach((rec, idx) => {
      message += `${idx + 1}. ${rec}\n`;
    });
  }
  
  Alert.alert('Heartbeat System Diagnostic', message, [
    { text: 'OK' },
    {
      text: 'Copy to Clipboard',
      onPress: () => {
        // Would need expo-clipboard
        console.log('Diagnostic Results:', JSON.stringify(results, null, 2));
      },
    },
  ]);
  
  return results;
};

/**
 * Get a summary health score (0-100)
 */
export const getHealthScore = async () => {
  const results = await runHeartbeatDiagnostic();
  const passCount = results.checks.filter(c => c.status === 'pass').length;
  const totalChecks = results.checks.length;
  return Math.round((passCount / totalChecks) * 100);
};
