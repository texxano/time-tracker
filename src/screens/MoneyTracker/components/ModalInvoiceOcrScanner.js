import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";
import http from "../../../services/http";
import * as FileSystem from "expo-file-system";
import { FormattedMessage } from "react-intl";
import { mt, px } from "../../../asset/style/utilities.style";
import flex from "../../../asset/style/flex.style";
import { AntDesign } from "@expo/vector-icons";

const ModalInvoiceOcrScanner = ({
  setInvoiceCreationWay,
  setScannedFormData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [scanStatus, setScanStatus] = useState();

  const createDocumentName = (images) => {
    let fileName, fileExtension;
    const lastChar = images[0].lastIndexOf("/");
    const finalOutputPath = images[0].substring(lastChar + 1);
    const extension = finalOutputPath.lastIndexOf(".")
    if(images.length === 1) {

      const extension = finalOutputPath.lastIndexOf(".")
      fileName = finalOutputPath;
      fileExtension = finalOutputPath.substring(extension + 1)
    }else {
      const createdName = finalOutputPath.substring(0, extension +1)
      fileName = `invoice_${createdName}pdf`
      fileExtension = "pdf"
    }


    return { fileName, fileExtension}
  }
  const scanDocument = async () => {
    if (Platform.OS === 'android' && await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    ) !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Error', 'User must grant camera permissions to use document scanner.')
      return
    }
    try {
    const { scannedImages, status } = await DocumentScanner.scanDocument();

    setScanStatus(status);
    if (scannedImages.length > 0) {

        let base64Arr = [];

        for (const element of scannedImages) {
          const base64Content = await FileSystem.readAsStringAsync(element, {
            encoding: FileSystem.EncodingType.Base64,
          });
          base64Arr.push(base64Content);
        }

        const {fileExtension, fileName} = createDocumentName(scannedImages)
        const payload = {
          base64Images: base64Arr,
          fileName,
          fileExtension,
          modelId: "prebuilt-invoice",
        };
     

        setIsLoading(true);
        const res = await http.post("/moneytracker/docs/ocr", payload);

        if (res.status === 500) {
          setError("money-tracker.scan.form.error");
        }
        const invoiceDocument = {
          name: fileName,
          fileId: res.fileId,
        };

        setScannedFormData({...res, invoiceDocument} );
        setInvoiceCreationWay("manually");

        setIsLoading(false);
      } 

      // set the img src, so we can view the first scanned image
      // setScannedImage((prevState) => [...prevState, scannedImages[0]]);
    }
    catch (error) {
      setError("money-tracker.scan.form.error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // dispatch(refreshTokenAction(refreshToken, userId));
    // call scanDocument on load
    scanDocument();
  }, []);

  useEffect(() => {
    if (scanStatus === "cancel") setInvoiceCreationWay("");
  }, [scanStatus]);

  return (
    <>
      <View style={[styles.container, px[4], flex.d_flex_center]}>
        {isLoading ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
        {error && (
          <View style={[flex.flex_direction_column]}>
            <Text>
              <FormattedMessage id="money-tracker.scan.form.error" />
            </Text>
            <TouchableOpacity
              onPress={() => setInvoiceCreationWay("manually")}
              style={[
                {
                  width: "100%",
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 10,
                  borderWidth: 1,
                },
                flex.d_flex_center,
                mt[2],
              ]}
            >
              <Text style={[]}>
                <FormattedMessage id="money-tracker.scan.form.goBack" />
              </Text>
              <AntDesign
                style={{ marginLeft: 5 }}
                name="back"
                size={24}
                color="#6c757d"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};
export default ModalInvoiceOcrScanner;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
  },
});
