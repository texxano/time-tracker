
import http from '../../../services/http'

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ActivityIndicator, Button, Image, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';

const MS_OFFICE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

const FileView = ({ isOpen, toggle, selectedDocument, docPurpose }) => {
    const state = useSelector((state) => state);


    const [dataResponse, setDataResponse] = useState(null);
    const [requestApi, setRequestApi] = useState(true);
    const [filePreviewContent, setFilePreviewContent] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [isMSOfficeFile, setIsMSOfficeFile] = useState(false);
    // console.log('isMSOfficeFile', isMSOfficeFile)
    useEffect(() => {
        if (dataResponse && isMSOfficeFile) {
            const encodedUrl = encodeURIComponent(dataResponse.url);
            setPreviewURL(`https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`);
        }
    }, [dataResponse]);

    useEffect(() => {
        if (isOpen) {
            setRequestApi(true);
            http.get(`/doctask/docs/${selectedDocument.id}/preview?docPurpose=${docPurpose}`)
                .then((data) => {
                    setDataResponse(data);
                    const extension = data.name.split('.').pop().toLowerCase();
                    setIsMSOfficeFile(MS_OFFICE_EXTENSIONS.includes(extension));
                })
                .catch(error => {
                    console.error("Error fetching preview data:", error);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (dataResponse && dataResponse.url) {
                    const fileUri = FileSystem.documentDirectory + dataResponse.name;

                    // Use downloadAsync instead of manually fetching and writing the file
                    const { uri } = await FileSystem.downloadAsync(dataResponse.url, fileUri);

                    // Convert file to base64 string
                    const base64Content = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    const fileType = dataResponse.mimeType || 'application/pdf';
                    setFilePreviewContent(`data:${fileType};base64,${base64Content}`);
                } else {
                    throw new Error("File URL is not available");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setRequestApi(false);
            }
        };

        fetchData();
    }, [dataResponse]);

    useEffect(() => {
        if (!isOpen) {
            setDataResponse(null);
            setRequestApi(true);
            setFilePreviewContent(null);
        }
    }, [isOpen]);


    return (
        <Modal visible={isOpen} onRequestClose={toggle}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{dataResponse?.name ?? ''}</Text>
                    {requestApi ? <ActivityIndicator size="large" color="#0000ff" /> : null}
                    {/* {previewURL && isMSOfficeFile && (
                    <WebView source={{ uri: previewURL }} style={{ flex: 1 }} />
                )}*/}
                    {/* {filePreviewContent && !isMSOfficeFile && (
                    <WebView source={{ uri: filePreviewContent }} style={{ flex: 1 }} />
                )}  */}
                    {/* <Image style={{ width: 300, height: 300, borderRadius: 8 }} source={{ uri: filePreviewContent }} /> */}

                    <Button title="Close" onPress={toggle} />
                </View>

            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },

    modalView: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 8,
        paddingTop: 0,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default FileView;
