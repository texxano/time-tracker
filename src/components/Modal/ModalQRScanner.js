import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AntDesign } from '@expo/vector-icons';
import { FormattedMessage } from 'react-intl';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

const ModalQRScanner = ({ visible, onClose, onQRScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Reset scanned state when modal visibility changes
  useEffect(() => {
    setScanned(false);
    setProcessing(false);
  }, [visible]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned || processing) {
      return;
    }

    setScanned(true);
    setProcessing(true);

    // Check if this is the check-in QR code
    if (data.includes('texxano://checkin') || data.includes('checkin')) {
      onQRScanned(data);
    } else {
      console.log('❌ Invalid QR code - not a check-in code');
      alert('Invalid QR code. Please scan the check-in QR code.');
      setProcessing(false);
      setScanned(false);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <AntDesign name="closecircle" size={32} color={Colors.white} />
            </TouchableOpacity>
            
            <Text style={styles.permissionText}>
              <FormattedMessage id="camera.permissions" />
            </Text>
            
            <TouchableOpacity
              style={styles.allowButton}
              onPress={requestPermission}
            >
              <Text style={styles.allowButtonText}>
                <FormattedMessage id="common.button.allow" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={onClose}>
              <AntDesign name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Instruction Text */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              <FormattedMessage id="dashboard.scan.title" />
            </Text>
            <Text style={styles.instructionSubText}>
              <FormattedMessage id="dashboard.scan.instruction" />
            </Text>
          </View>

          {/* Scanning Overlay */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
          </View>

          {/* Processing Indicator */}
          {processing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={Colors.white} />
              <Text style={styles.processingText}>
                <FormattedMessage id="dashboard.scan.processing" />
              </Text>
            </View>
          )}

          {/* Cancel Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>
                <FormattedMessage id="dashboard.scan.cancel" />
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  allowButton: {
    backgroundColor: Colors.primary_500,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeButtonTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary_500,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  processingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: 150,
  },
  processingText: {
    fontSize: 16,
    color: Colors.white,
    marginTop: 10,
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default ModalQRScanner;
