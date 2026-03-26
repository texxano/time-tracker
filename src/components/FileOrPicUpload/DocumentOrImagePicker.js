import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { mb, mr, mt, py } from "../../asset/style/utilities.style";
import CameraComponent from "../CameraComponent";
import * as FileSystem from "expo-file-system";
import { TextMain } from "../Texts";
import CameraComponentIOS from "../CameraComponentIOS";
import { useDispatch } from "react-redux";
import {
  endIosCamera,
  startIosCamera,
} from "../../redux/actions/DocumentTask/documentTask.actions";
import colors from "../../constants/Colors";
import { NavigationService } from "../../navigator";

const { width, height } = Dimensions.get("window");

export default function DocumentOrImagePicker({
  close,
  showModal,
  setDocument,
  buttonsStyles
}) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const dispatch = useDispatch();

  const openCamera = async () => {
    dispatch(startIosCamera());

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
              <TextMain text="common.takePhoto" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFile}
              style={[styles.modalButton, mr[3], mb[2]]}
            >
              <TextMain text="common.pickFile" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={close}
              style={[styles.modalButton, styles.cancelButton, py[3]]}
            >
              <Text style={[{ color: "red" }, mt[1], mr[4]]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      {cameraVisible && (
        <>
          {Platform.OS === "ios" ? (
            <View
              style={{
                height,
                width,
                backgroundColor: colors.black,
                zIndex: 9999,
              }}
            >
              <CameraComponentIOS
                saveImage={saveImage}
                showCamera={cameraVisible}
                closeCamera={() => {
                  dispatch(endIosCamera());
                  setCameraVisible(false);
                  return;
                }}
                buttonsStyles={buttonsStyles}
              />
            </View>
          ) : (
            <View
              style={{
                height,
                width,
                backgroundColor: colors.black,
                zIndex: 9999,
              }}
            >
              <CameraComponent
                saveImage={saveImage}
                showCamera={cameraVisible}
                closeCamera={() => {
                  dispatch(endIosCamera());
                  setCameraVisible(false);
                }}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
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
