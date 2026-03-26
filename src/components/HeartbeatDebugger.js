/**
 * Heartbeat Debugger Component
 * Shows heartbeat logs stored in AsyncStorage for production debugging
 * 
 * Usage:
 * import HeartbeatDebugger from './components/HeartbeatDebugger';
 * 
 * Add to your screen:
 * <HeartbeatDebugger />
 * 
 * Or programmatically check status:
 * import { getHeartbeatStatus, getHeartbeatLogs } from './services/appStatusService';
 * const status = await getHeartbeatStatus();
 * console.log(status);
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Platform } from 'react-native';
import { getForegroundHeartbeatStatus, getHeartbeatLogs, clearHeartbeatLogs } from '../services/foregroundHeartbeatService';
import { promptBatteryOptimization, showHeartbeatTroubleshootingGuide } from '../utils/batteryOptimizationHelper';
import { showDiagnosticResults } from '../utils/heartbeatDiagnostic';

const HeartbeatDebugger = () => {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadStatus = async () => {
    try {
      const statusInfo = await getForegroundHeartbeatStatus();
      const allLogs = await getHeartbeatLogs();
      setStatus(statusInfo);
      setLogs(allLogs);
    } catch (error) {
      console.log('Error loading heartbeat status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatus();
    setRefreshing(false);
  };

  const handleClearLogs = async () => {
    await clearHeartbeatLogs();
    await loadStatus();
  };

  useEffect(() => {
    loadStatus();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isExpanded) {
    return (
      <TouchableOpacity 
        style={styles.collapsedButton}
        onPress={() => setIsExpanded(true)}
      >
        <Text style={styles.collapsedText}>
          💓 Foreground Service {status?.isRunning ? '✅' : '❌'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Heartbeat Debugger</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {status && (
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Foreground Service: 
            <Text style={status.isRunning ? styles.success : styles.error}>
              {status.isRunning ? ' ✅ Running' : ' ❌ Stopped'}
            </Text>
          </Text>
          <Text style={styles.statusLabel}>Last Activity: 
            <Text style={styles.statusValue}>
              {status.lastActivity ? new Date(status.lastActivity).toLocaleTimeString() : ' None'}
            </Text>
          </Text>
          <Text style={styles.statusLabel}>Last Message: 
            <Text style={styles.statusValue}> {status.lastMessage || 'None'}</Text>
          </Text>
          <Text style={styles.statusLabel}>Total Logs: 
            <Text style={styles.statusValue}> {status.totalLogs}</Text>
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onRefresh}>
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.diagnosticButton]} 
          onPress={showDiagnosticResults}
        >
          <Text style={styles.buttonText}>🔍 Diagnose</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearLogs}>
          <Text style={styles.buttonText}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'android' && (
        <View style={styles.androidActions}>
          <TouchableOpacity 
            style={[styles.button, styles.warningButton]} 
            onPress={promptBatteryOptimization}
          >
            <Text style={styles.buttonText}>🔋 Battery Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.infoButton]} 
            onPress={showHeartbeatTroubleshootingGuide}
          >
            <Text style={styles.buttonText}>❓ Troubleshoot</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.logsContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.logsTitle}>Recent Logs ({logs.length}):</Text>
        {logs.length === 0 ? (
          <Text style={styles.noLogs}>No logs yet. Heartbeat might not be running.</Text>
        ) : (
          logs.reverse().map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={styles.logTime}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && Object.keys(log.data).length > 0 && (
                <Text style={styles.logData}>{JSON.stringify(log.data, null, 2)}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  collapsedButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#6497c1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  collapsedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  statusSection: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  statusValue: {
    color: '#666',
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  androidActions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#487a33',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  diagnosticButton: {
    backgroundColor: '#9C27B0',
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
  infoButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logsContainer: {
    maxHeight: 200,
    padding: 10,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noLogs: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  logEntry: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#b7d0e4',
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  logMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  logData: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default HeartbeatDebugger;
