import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { 
  readPingPongLogs, 
  clearPingPongLogs, 
  exportPingPongLogs, 
  countPingPongEvents,
  getLastPingPongTimes 
} from '../utils/readPingPongLogs';

/**
 * Ping-Pong Debug Panel
 * 
 * Shows persistent logs from killed-state notification handling.
 * 
 * Usage:
 * ```javascript
 * import PingPongDebugPanel from '../components/PingPongDebugPanel';
 * 
 * // Add to your screen (e.g., Dashboard or Settings)
 * <PingPongDebugPanel />
 * ```
 * 
 * Features:
 * - View all ping/pong events
 * - See success/failure counts
 * - Export logs for backend team
 * - Clear logs
 */
const PingPongDebugPanel = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ pings: 0, pongsSuccess: 0, pongsFailed: 0 });
  const [lastTimes, setLastTimes] = useState({ lastPing: null, lastPong: null });
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [logsData, statsData, timesData] = await Promise.all([
        readPingPongLogs(),
        countPingPongEvents(),
        getLastPingPongTimes(),
      ]);
      
      setLogs(logsData);
      setStats(statsData);
      setLastTimes(timesData);
    } catch (error) {
      console.error('Failed to load ping-pong logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExport = async () => {
    try {
      const formatted = await exportPingPongLogs();
      await Share.share({
        message: formatted,
        title: 'Ping-Pong Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs: ' + error.message);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all ping-pong logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearPingPongLogs();
            await loadLogs();
          },
        },
      ]
    );
  };

  const successRate = stats.pings > 0 
    ? ((stats.pongsSuccess / stats.pings) * 100).toFixed(1) 
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>
          🔔 Ping-Pong Debug {expanded ? '▼' : '▶'}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{logs.length}</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Summary (always visible) */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pings}</Text>
          <Text style={styles.statLabel}>Pings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.pongsSuccess}</Text>
          <Text style={styles.statLabel}>Pongs OK</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.pongsFailed}</Text>
          <Text style={styles.statLabel}>Pongs Fail</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{successRate}%</Text>
          <Text style={styles.statLabel}>Success</Text>
        </View>
      </View>

      {/* Last Times */}
      {(lastTimes.lastPing || lastTimes.lastPong) && (
        <View style={styles.lastTimes}>
          {lastTimes.lastPing && (
            <Text style={styles.lastTime}>
              Last Ping: {new Date(lastTimes.lastPing).toLocaleTimeString()}
            </Text>
          )}
          {lastTimes.lastPong && (
            <Text style={styles.lastTime}>
              Last Pong: {new Date(lastTimes.lastPong).toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}

      {/* Expanded Content */}
      {expanded && (
        <>
          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonRefresh]} 
              onPress={loadLogs}
            >
              <Text style={styles.buttonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonExport]} 
              onPress={handleExport}
            >
              <Text style={styles.buttonText}>📤 Export</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonClear]} 
              onPress={handleClear}
            >
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Logs List */}
          <ScrollView style={styles.logsList} nestedScrollEnabled>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : logs.length === 0 ? (
              <Text style={styles.emptyText}>No logs yet. Logs appear when app receives pings while killed.</Text>
            ) : (
              logs.map((log, index) => (
                <View key={index} style={styles.logEntry}>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={[
                    styles.logMessage,
                    log.message.includes('❌') && styles.logError,
                    log.message.includes('✅') && styles.logSuccess,
                  ]}>
                    {log.message}
                  </Text>
                  {Object.keys(log.data).length > 0 && (
                    <Text style={styles.logData}>
                      {JSON.stringify(log.data, null, 2)}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  lastTimes: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  lastTime: {
    color: '#aaa',
    fontSize: 11,
    marginVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonRefresh: {
    backgroundColor: '#4A90E2',
  },
  buttonExport: {
    backgroundColor: '#4CAF50',
  },
  buttonClear: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logsList: {
    maxHeight: 300,
  },
  logEntry: {
    backgroundColor: '#2a2a2a',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  logTime: {
    color: '#888',
    fontSize: 10,
    marginBottom: 4,
  },
  logMessage: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  logError: {
    color: '#F44336',
  },
  logSuccess: {
    color: '#4CAF50',
  },
  logData: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'Courier',
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
    fontSize: 12,
  },
});

export default PingPongDebugPanel;
