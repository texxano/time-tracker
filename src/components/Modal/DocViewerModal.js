import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  View,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { modalStyle } from "../../asset/style/components/modalStyle";
import WebView from "react-native-webview";
import { ButtonCloseForm } from "../buttons/ButtonCloseForm";

const MS_OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
const PDF_EXTENSIONS = ["pdf"];

const { height, width } = Dimensions.get("screen");

const DocViewerModal = ({
  isOpen,
  toggle,
  selectedDocument,
  docPurpose,
  file,
  previewLocation,
}) => {
  const [dataResponse, setDataResponse] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isMSOfficeFile, setIsMSOfficeFile] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isPDF, setIsPDF] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocumentPreview = async () => {
    //   setLoading(true);
      try {
        let response;
        if (file) {
          response = {
            url: file.sasUrl,
            name: file.name,
            extension: file.extension,
          };
        } else if (previewLocation) {
          const fetchResponse = await http.get(previewLocation);
          response = {
            name: selectedDocument?.name || fetchResponse.name || "document",
            blobUrl: fetchResponse.url ?? fetchResponse.sasUrl,
          };
        } else if (selectedDocument?.id) {
          const downloadUrl = `/doctask/docs/${selectedDocument.id}/preview?docPurpose=${docPurpose}`;
          const fetchResponse = await http.get(downloadUrl);
          response = {
            name: selectedDocument?.name || "document",
            blobUrl: fetchResponse.url ?? fetchResponse.sasUrl,
          };
        }

        if (response) {
          const extension = response.name.split(".").pop().toLowerCase();
          const isImgFile = IMAGE_EXTENSIONS.includes(extension);
          const isPDFile = PDF_EXTENSIONS.includes(extension);
          
          setIsImage(isImgFile);
          setIsPDF(isPDFile);

          if (isImgFile && response.blob) {
            const blobURL = URL.createObjectURL(response.blob);
            setPreviewURL(blobURL);
          } else if (isPDFile) {
            // Handle PDF by directly pointing to the URL
            const encodedUrl = encodeURIComponent(response.blobUrl ?? response.url ?? response.sasUrl);
            setPreviewURL(`https://docs.google.com/gview?url=${encodedUrl}&embedded=true`);
          } else {
            const encodedUrl = encodeURIComponent(response.blobUrl ?? response.url ?? response.sasUrl);
            setPreviewURL(
              MS_OFFICE_EXTENSIONS.includes(extension)
                ? `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`
                : response.blobUrl ?? response.url ?? response.sasUrl
            );
          }

          setDataResponse(response);
          setIsMSOfficeFile(MS_OFFICE_EXTENSIONS.includes(extension));
        }
      } catch (error) {
        console.error("Error fetching document preview:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDocumentPreview();
    }

    return () => {
      if (previewURL && isImage) {
        URL.revokeObjectURL(previewURL); // Clean up blob URLs when modal is closed
      }
    };
  }, [isOpen, file, selectedDocument, docPurpose, previewLocation]);

  useEffect(() => {
    if (!isOpen) {
      setDataResponse(null);
      setPreviewURL(null);
    }
  }, [isOpen]);
  return (
    <Modal animationType="slide" transparent={true} visible={isOpen}>
      <View style={modalStyle.centeredView}>
        <View style={[modalStyle.modalView, { height: height - 200 }]}>
          {loading ? (
            <ActivityIndicator
              style={{ position: "absolute", top: height / 3 }}
              size="large"
              color="#6c757d"
            />
          ) : (
            previewURL &&
            (isImage ? (
              <Image
                source={{ uri: previewURL }} // Correct use of Image component
                style={{
                  width: "100%", // Ensures the image spans the full width of the modal
                  height: "100%", // Or any height you prefer
                  resizeMode: "contain", // Ensures the image scales properly without distortion
                }}
            
              />
            ) : (
              <WebView
                source={{ uri: previewURL }} // Correct use of WebView source
                style={{
                  flex: 1,
                  width: width - width / 10,
                }}
       
              />
            ))
          )}
        </View>
        <ButtonCloseForm onPress={toggle} />
      </View>
    </Modal>
  );
};

export default DocViewerModal;
