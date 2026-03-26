import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ModalShowMessage({
  message,
  type = 'success', // 'success' | 'error' | 'warning'
  showModal,
  close,
  autoDismiss = false,
  dismissDelay = 1200,
}) {
  useEffect(() => {
    if (showModal && autoDismiss) {
      const timer = setTimeout(close, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [showModal, autoDismiss, dismissDelay, close]);

  let icon, color;
  if (type === 'success') {
    icon = <MaterialIcons name="check-circle" size={40} color="#22c55e" style={{ marginBottom: 10 }} />;
    color = '#22c55e';
  } else if (type === 'error') {
    icon = <MaterialIcons name="error" size={40} color="#ef4444" style={{ marginBottom: 10 }} />;
    color = '#ef4444';
  } else if (type === 'warning') {
    icon = <MaterialIcons name="warning" size={40} color="#facc15" style={{ marginBottom: 10 }} />;
    color = '#facc15';
  }

  return (
    <Modal animationType="fade" transparent visible={showModal}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ minWidth: 300, maxWidth: 420, backgroundColor: '#fff', borderRadius: 20, padding: 36, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, elevation: 12 }}>
          {React.cloneElement(icon, { size: 56, style: { marginBottom: 18 } })}
          <Text style={{ fontWeight: 'bold', fontSize: 18, color, textAlign: 'center', marginBottom: 18 }}>{message}</Text>
          {type !== 'warning' && (
            <TouchableOpacity
              onPress={close}
              style={{ marginTop: 8, backgroundColor: color, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
} 