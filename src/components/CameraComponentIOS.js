import {
  AntDesign,
  Ionicons,
  Entypo,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Image,
  StatusBar
} from "react-native";
import colors from "../constants/Colors";
import flex from "../asset/style/flex.style";
import { FormattedMessage } from "react-intl";
import { ml, mt, p, px } from "../asset/style/utilities.style";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { endIosCamera } from "../redux/actions/DocumentTask/documentTask.actions";

const { width, height } = Dimensions.get("window");

export default function CameraComponentIOS({
  showCamera,
  closeCamera,
  saveImage,
  buttonsStyles
}) {
    const dispatch = useDispatch();
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);

  const [cameraReadyToShow, setCameraReadyToShow] = useState(false);

  useEffect(() => {
    if (showCamera && permission?.granted) {
      const timer = setTimeout(() => {
        setCameraReadyToShow(true);
      }, 300); // delay can be 200–500ms based on testing

      return () => clearTimeout(timer); // cleanup
    } else {
      setCameraReadyToShow(false); // reset when closing camera
    }
  }, [showCamera, permission]);

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

  // useEffect(() => {
  //   if (Platform.OS === "ios") {
  //     setFacing("front"); // default to front on iOS
  //   }
  // }, []);

  return (
    <View
      style={[
        {
          flex: 1,
          width:"100%",
          height:"100%",
          backgroundColor: colors.black,
          position:'relative',
          zIndex:999999
        },
        flex.d_flex_center,
      ]}
    >
      {!photo ? (
        <CameraView
          ref={cameraRef}
          style={[styles.camera, {zIndex:99999}]}
          facing={facing}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;

          }}
        >
          <TouchableOpacity
            style={[
              flex.d_flex_center,
              styles.closeBtn,
              { right: Platform.OS === "ios" ? 20 : 10 },
              buttonsStyles?.closeBtn
            ]}
            onPress={closeCamera}
          >
            <AntDesign name="close" color={colors.black} size={25} />
          </TouchableOpacity>
          <View style={[styles.buttonContainer]}>
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={capturePhoto}
                style={[styles.captureButton, buttonsStyles?.captureButton]}
              >
                <Ionicons name="camera" color={colors.white} size={60} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[flex.d_flex_center, styles.flipCamera, buttonsStyles?.flipCamera]}
                onPress={toggleCameraFacing}
              >
                <Feather name="refresh-cw" color={colors.black} size={25} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={[{backgroundColor:colors.black, width,height, position:'relative', zIndex:999999}, flex.d_flex_center]}>
          <Image source={{ uri: photo }} style={[styles.preview,{zIndex:9}]} />
          <View
            style={[
              styles.buttonContainer,
              flex.d_flex_center,
              {
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.8)",
                height: 150,
                zIndex:999
              },
            ]}
          >
            <TouchableOpacity
              style={[
                flex.d_flex_center,
                px[8],
                p[3],

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
                p[3],
                ml[8],
                { backgroundColor: colors.success_100, borderRadius: 8 },
              ]}
              onPress={() =>{ 
                saveImage(photo)
                 dispatch(endIosCamera())
                 return
              }}
            >
              <Text style={{ fontSize: 16, color: colors.white }}>
                <FormattedMessage id="common.button.save" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
console.log(height, "height");

const styles = StyleSheet.create({

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
    position: "absolute",
    width,
    height,
    zIndex: 999999,
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
    marginTop:-20
  },
  preview: {
    width: "100%",
    height: height,
    resizeMode: "contain",
    zIndex: 99999999,

  },
  flipCamera: {
    position: "absolute",
    top: "25%",
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 50,
  },
  closeBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 50,
  },
});

//
