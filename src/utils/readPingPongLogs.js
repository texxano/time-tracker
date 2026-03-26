import AsyncStorage from '@react-native-async-storage/async-storage';

const PING_PONG_LOG_KEY = '@texxano_ping_pong_log';

/**
 * Read Ping-Pong Logs from Persistent Storage
 * 
 * Use this to debug what happened when the app was killed.
 * 
 * Usage in any component:
 * ```javascript
 * import { readPingPongLogs, clearPingPongLogs, exportPingPongLogs } from '../utils/readPingPongLogs';
 * 
 * // Read and display logs
 * const logs = await readPingPongLogs();
 * console.log('📋 Ping-Pong Logs:', logs);
 * 
 * // Export as formatted text
 * const formatted = await exportPingPongLogs();
 * console.log(formatted);
 * 
 * // Clear logs
 * await clearPingPongLogs();
 * ```
 */

/**
 * Read all ping-pong logs from AsyncStorage
 * @returns {Promise<Array<{timestamp: string, message: string, data: object, appState: string}>>}
 */
export const readPingPongLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem(PING_PONG_LOG_KEY);
    if (!logs) {
      return [];
    }
    return JSON.parse(logs);
  } catch (error) {
    console.error('Failed to read ping-pong logs:', error);
    return [];
  }
};

/**
 * Get only logs from the last N minutes
 * @param {number} minutes - Number of minutes to look back
 * @returns {Promise<Array>}
 */
export const getRecentPingPongLogs = async (minutes = 10) => {
  try {
    const logs = await readPingPongLogs();
    const cutoff = Date.now() - (minutes * 60 * 1000);
    
    return logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime > cutoff;
    });
  } catch (error) {
    console.error('Failed to get recent logs:', error);
    return [];
  }
};

/**
 * Count pings and pongs in the logs
 * @returns {Promise<{pings: number, pongsSuccess: number, pongsFailed: number}>}
 */
export const countPingPongEvents = async () => {
  try {
    const logs = await readPingPongLogs();
    
    const pings = logs.filter(log => log.message.includes('PING RECEIVED')).length;
    const pongsSuccess = logs.filter(log => log.message.includes('PONG SENT')).length;
    const pongsFailed = logs.filter(log => log.message.includes('PONG FAILED')).length;
    
    return { pings, pongsSuccess, pongsFailed };
  } catch (error) {
    console.error('Failed to count events:', error);
    return { pings: 0, pongsSuccess: 0, pongsFailed: 0 };
  }
};

/**
 * Export logs as formatted text (for sharing with backend team)
 * @returns {Promise<string>}
 */
export const exportPingPongLogs = async () => {
  try {
    const logs = await readPingPongLogs();
    
    if (logs.length === 0) {
      return 'No ping-pong logs found.';
    }
    
    let output = '📋 PING-PONG DEBUG LOGS\n';
    output += '='.repeat(50) + '\n\n';
    
    logs.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleString();
      output += `[${index + 1}] ${time}\n`;
      output += `    ${log.message}\n`;
      
      if (Object.keys(log.data).length > 0) {
        output += `    Data: ${JSON.stringify(log.data, null, 2)}\n`;
      }
      
      output += '\n';
    });
    
    // Add summary
    const counts = await countPingPongEvents();
    output += '='.repeat(50) + '\n';
    output += 'SUMMARY:\n';
    output += `  - Pings Received: ${counts.pings}\n`;
    output += `  - Pongs Sent: ${counts.pongsSuccess}\n`;
    output += `  - Pongs Failed: ${counts.pongsFailed}\n`;
    output += `  - Success Rate: ${counts.pings > 0 ? ((counts.pongsSuccess / counts.pings) * 100).toFixed(1) : 0}%\n`;
    
    return output;
  } catch (error) {
    console.error('Failed to export logs:', error);
    return 'Error exporting logs: ' + error.message;
  }
};

/**
 * Clear all ping-pong logs
 * @returns {Promise<void>}
 */
export const clearPingPongLogs = async () => {
  try {
    await AsyncStorage.removeItem(PING_PONG_LOG_KEY);
    console.log('✅ Ping-pong logs cleared');
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
};

/**
 * Check if app successfully responded to a ping in the last N minutes
 * @param {number} minutes - Minutes to look back
 * @returns {Promise<boolean>}
 */
export const hasRecentPong = async (minutes = 5) => {
  try {
    const recentLogs = await getRecentPingPongLogs(minutes);
    return recentLogs.some(log => log.message.includes('PONG SENT'));
  } catch (error) {
    console.error('Failed to check recent pong:', error);
    return false;
  }
};

/**
 * Get the last ping and pong timestamps
 * @returns {Promise<{lastPing: string | null, lastPong: string | null}>}
 */
export const getLastPingPongTimes = async () => {
  try {
    const logs = await readPingPongLogs();
    
    // Find last ping
    const lastPingLog = [...logs].reverse().find(log => log.message.includes('PING RECEIVED'));
    const lastPing = lastPingLog ? lastPingLog.timestamp : null;
    
    // Find last pong
    const lastPongLog = [...logs].reverse().find(log => log.message.includes('PONG SENT'));
    const lastPong = lastPongLog ? lastPongLog.timestamp : null;
    
    return { lastPing, lastPong };
  } catch (error) {
    console.error('Failed to get last times:', error);
    return { lastPing: null, lastPong: null };
  }
};
