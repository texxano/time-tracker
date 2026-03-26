import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { mb, mr, mt, py } from "../../../asset/style/utilities.style";
import CameraComponent from "../../../components/CameraComponent";
import * as FileSystem from "expo-file-system";

export default function DocumentOrImagePicker({
  close,
  showModal,
  setDocument,
}) {
  const [cameraVisible, setCameraVisible] = useState(false);

  const openCamera = async () => {
    close(); // Close the initial modal
    setCameraVisible(true); // Show the camera modal
  };

  const createDocumentName = (doc) => {
    let fileName, fileExtension;
    const lastChar = doc.lastIndexOf("/");
    const finalOutputPath = doc.substring(lastChar + 1);
    const extension = finalOutputPath.lastIndexOf(".");
    fileName = finalOutputPath;
    fileExtension = finalOutputPath.substring(extension + 1);

    return { fileName, fileExtension };
  };

  const getBase64 = async (uri) => {
    const base64Content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64Content;
  };

  const pickFile = async () => {
    close(); // Close the initial modal
    try {
      let response = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!response.canceled) {
        const { uri, name } = response.assets[0];
        const base64Content = await getBase64(uri);
        const { fileExtension } = createDocumentName(uri);
        const document = {
          name,
          extension: fileExtension,
          base64Content,
        };
        setDocument(document);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const saveImage = async (photo) => {
    const base64Content = await getBase64(photo);
    const { fileExtension, fileName } = createDocumentName(photo);
    const document = {
      name: fileName,
      extension: fileExtension,
      base64Content,
    };
    setDocument(document);
    setCameraVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Custom Modal for Options */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <TouchableOpacity
              onPress={openCamera}
              style={[styles.modalButton, mt[2]]}
            >
              <Text>📷 Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFile}
              style={[styles.modalButton, mr[3], mb[2]]}
            >
              <Text>📂 Pick a File</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={close}
              style={[styles.modalButton, styles.cancelButton, py[3]]}
            >
              <Text style={[{ color: "red" }, mt[1], mr[4]]}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      {cameraVisible && (
        <CameraComponent
          saveImage={saveImage}
          showCamera={cameraVisible}
          closeCamera={() => setCameraVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 200, height: 200, marginBottom: 20 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { backgroundColor: "white", borderRadius: 10, width: "80%" },
  modalButton: { padding: 10, alignItems: "center" },
  cancelButton: { borderTopWidth: 1, borderTopColor: "#ddd" },
  camera: { flex: 1 },
  captureButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 10,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "red",
    padding: 10,
  },
});
