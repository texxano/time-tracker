import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FormattedMessage } from "react-intl";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import flex from "../../../../asset/style/flex.style";
import { AntDesign } from "@expo/vector-icons";
import http from "../../../../services/http";
import colors from "../../../../constants/Colors";

const ModalInvoiceFormUploadFile = ({ invoiceDocument, setValues }) => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadDocument = async () => {
    setIsLoading(true);
    let response = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (response.assets !== null) {
      setValues((prevState) => ({ ...prevState, invoiceDocument: {} }));
      const base64Content = await FileSystem.readAsStringAsync(
        response.assets[0]?.uri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );
      const name = response.assets[0]?.name;

      const extension = response.assets[0]?.name.lastIndexOf(".");
      const finalExtension = name.substring(extension + 1);
      const payload = { name, base64Content, extension: finalExtension };
      try {
        const res = await http.post("/moneytracker/docs", payload);
        if (res?.id)
          setValues((prevState) => ({
            ...prevState,
            invoiceDocument: {
              name,
              fileId: res.id,
            },
          }));
      } catch (error) {
        console.log(error, "error");
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };
  return (
    <>
      {invoiceDocument && invoiceDocument.name ? (
        <View
          my={3}
          style={[
            styles.uploadStyle,
            flex.d_flex_center,
            flex.flex_start,
            {
              height: 47,
              backgroundColor: colors.gray_100,
              borderStyle: "solid",
            },
          ]}
        >
          <Text>{invoiceDocument.name}</Text>
          <TouchableOpacity
            style={{ position: "absolute", top: 13.3, right: 15 }}
            onPress={() =>
              setValues((prevState) => ({ ...prevState, invoiceDocument: {} }))
            }
          >
            <AntDesign name="close" size={16} color={colors.gray_400} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadStyle}>
          <TouchableOpacity activeOpacity={0.5} onPress={uploadDocument}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.gray_400}
                style={{
                  marginVertical: 10,
                  fontSize: 14,
                  color: colors.gray_400,
                }}
              />
            ) : (
              <Text
                style={{
                  marginVertical: 10,
                  fontSize: 14,
                  color: colors.gray_400,
                }}
              >
                <FormattedMessage id="money-tracker.scan.form.uploadInvoice" />
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default ModalInvoiceFormUploadFile;

const styles = StyleSheet.create({
  uploadStyle: {
    height:47,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.gray_100,
    borderStyle: "dashed",
    flexDirection: "row",
    justifyContent: "center",
    fontSize: 16,
    backgroundColor: colors.white,
    marginBottom: 15,
    paddingHorizontal: 10,
    position: "relative",
  },
});
