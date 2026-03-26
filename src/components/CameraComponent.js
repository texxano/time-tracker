import {
  AntDesign,
  Ionicons,
  Entypo,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
} from "react-native";
import colors from "../constants/Colors";
import flex from "../asset/style/flex.style";
import { FormattedMessage } from "react-intl";
import { ml, mt, p, px } from "../asset/style/utilities.style";
import * as FileSystem from "expo-file-system";

const { width, height } = Dimensions.get("window");

export default function CameraComponent({
  showCamera,
  closeCamera,
  saveImage,
}) {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }
  if (!permission.granted) {
    // Camera permissions are not granted yet.
    requestPermission();
    // return (
    //   <View style={styles.container}>
    //     <TouchableOpacity
    //       onPress={closeCamera}
    //       style={{ position: "absolute", top: 30, right: 30 }}
    //     >
    //       <AntDesign name="closecircle" size={30} color={colors.white} />
    //     </TouchableOpacity>
    //     <Text style={styles.message}>
    //       <FormattedMessage id="camera.permissions" />
    //     </Text>
    //     <TouchableOpacity
    //       onPress={}
    //       style={[
    //         styles.requestPermissionBtn,
    //         flex.d_flex_center,
    //         mt[3]
    //       ]}
    //     >
    //       <Text style={{ fontSize: 16 }}>
    //         {" "}
    //         <FormattedMessage id="common.button.allow" />
    //       </Text>
    //     </TouchableOpacity>
    //   </View>
    // );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const capturePhoto = async () => {
    setIsLoading(true);
    if (cameraRef.current) {
      let photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);

      //   setImageUri(photo.uri); // Save the captured image URI
      //   setCameraVisible(false); // Close the camera modal
    }
    setIsLoading(false);
  };

  return (
    <>
      <Modal visible={showCamera} transparent={true} animationType="slide">
        <View
          style={[
            { flex: 1, width, height, backgroundColor: colors.black },
            flex.d_flex_center,
          ]}
        >
          {!photo ? (
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent]}>
                <View>
                  <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                  >
                    <TouchableOpacity
                      style={[
                        flex.d_flex_center,
                        styles.closeBtn,
                        { right: 10 },
                      ]}
                      onPress={closeCamera}
                    >
                      <AntDesign name="close" color={colors.black} size={25} />
                    </TouchableOpacity>
                    <View style={[styles.buttonContainer]}>
                      <View style={{ position: "relative" }}>
                        <TouchableOpacity
                          onPress={capturePhoto}
                          style={[styles.captureButton]}
                        >
                          <Ionicons
                            name="camera"
                            color={colors.white}
                            size={60}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[flex.d_flex_center, styles.flipCamera]}
                          onPress={toggleCameraFacing}
                        >
                          <Feather
                            name="refresh-cw"
                            color={colors.black}
                            size={25}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </CameraView>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Image source={{ uri: photo }} style={styles.preview} />
              <View
                style={[
                  styles.buttonContainer,
                  flex.d_flex_center,
                  {
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    height: 120,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    flex.d_flex_center,
                    px[8],
                    p[2],
                   
                    { backgroundColor: colors.error_100, borderRadius: 8 },
                  ]}
                  onPress={() => setPhoto(null)}
                >
                  <Text style={{ fontSize: 16, color: colors.white }}>
                    <FormattedMessage id="common.button.delete" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    flex.d_flex_center,
                    px[8],
                    p[2],
                    ml[8],
                    { backgroundColor: colors.success_100, borderRadius: 8 },
                  ]}
                  onPress={() => saveImage(photo)}
                >
                  <Text style={{ fontSize: 16, color: colors.white }}>
                    <FormattedMessage id="common.button.save" />
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    padding: 20,
    marginTop: 100,
    width,
    height,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
    zIndex: 9999999,
  },
  requestPermissionBtn: {
    width: 200,
    height: 60,
    backgroundColor: colors.white,
    alignSelf: "center",
    borderRadius: 9,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: colors.white,
  },
  camera: {
    flex: 1,
    position: "relative",
    width,
    height: height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width,
    height: 100,
    alignSelf: "center",
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  captureButton: {
    borderWidth: 7,
    borderColor: colors.white,
    borderRadius: 50,
    padding: 10,
    alignSelf: "center",
  },
  preview: {
    width: "100%",
    height: height - 150,
    resizeMode: "contain",
    zIndex: 99999999,
  },
  flipCamera: {
    position: "absolute",
    top: "33.333%",
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 50,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 50,
  },
});

//
