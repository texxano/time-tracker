/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, TouchableOpacity } from "react-native";
import DocumentOrImagePicker from "./DocumentOrImagePicker";
import { p } from "../../asset/style/utilities.style";
import { AntDesign } from "@expo/vector-icons";
import flex from "../../asset/style/flex.style";
import colors from "../../constants/Colors";
import { useDispatch, useSelector } from "react-redux";
import { endIosCamera } from "../../redux/actions/DocumentTask/documentTask.actions";

const FileOrPicUpload = ({ document, setDocument, buttonsStyles }) => {
  const dispatch = useDispatch();
  const [modalChoosePicOrDoc, setModalChoosePicOrDoc] = useState(false);
  const state = useSelector((state) => state);
  const { iosCameraStart } = state.documentTask;

  useEffect(() => {
    // always close camera and show all fileds
    dispatch(endIosCamera());
  }, []);

  return (
    <>
      <DocumentOrImagePicker
        close={() => setModalChoosePicOrDoc(false)}
        showModal={modalChoosePicOrDoc}
        setDocument={setDocument}
        buttonsStyles={buttonsStyles}
      />
      {document ? (
        <View
          style={[
            p[2],
            flex.d_flex_center,
            flex.d_flex_between,
            { borderWidth: 1, borderRadius: 5, borderColor: "#ccc" },
          ]}
        >
          <Text numberOfLines={1} style={{ width: "80%" }}>
            {document.name}
          </Text>
          <TouchableOpacity onPress={() => setDocument(null)}>
            <AntDesign name="closecircle" size={22} color={colors.gray_400} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* solving ioscamera UI issues */}
          {!iosCameraStart ? (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 5,
                borderColor: "#ccc",
                borderStyle: "dashed",
                flexDirection: "row",
                justifyContent: "center",
                fontSize: 16,
                backgroundColor: "#fff",
                marginBottom: 15,
                paddingHorizontal: 10,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => setModalChoosePicOrDoc(true)}
              >
                <Text
                  style={{
                    marginVertical: 10,
                    fontSize: 14,
                    color: "#6c757d80",
                    textAlign: "center",
                  }}
                >
                  <FormattedMessage id="documents.form.upload.placeholder" />
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
};

export default FileOrPicUpload;
