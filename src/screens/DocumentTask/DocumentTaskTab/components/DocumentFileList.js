/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, FlatList, TouchableOpacity, Platform, StyleSheet, Alert } from 'react-native';
import { useSelector } from "react-redux";

import fileDownloaderIIOS from '../../../../utils/fileDownloader.ios';
import fileDownloaderAndroid from '../../../../utils/fileDownloader.android';

import DocumentsIcon from "../../../Project/components/ItemDocuments/DocumentsIcon";
import { BytesToSize } from "../../../../utils/BytesToSize";
import FormatDateTime from "../../../../components/FormatDateTime";
// import FileView from "../../components/FileView";
import ModalMoreFile from "./ModalMoreFile";


const DocumentFileList = ({ taskDocuments, type, viewMore,  subTaskId}) => {
    const state = useSelector(state => state)
    const token = state.userToken.token
    // TODO
    // View File

    // const showfile = async (document) => {
    //     setSelectedFile(document); toggleDocViewerModal()
    // };
    // const [selectedFile, setSelectedFile] = useState(null)
    // const [isDocViewerModalOpen, setIsDocViewerModalOpen] = useState(false);

    // const toggleDocViewerModal = () => setIsDocViewerModalOpen(!isDocViewerModalOpen);

    return (
        <>
            {/* {selectedFile && (
                <FileView
                    isOpen={isDocViewerModalOpen}
                    toggle={toggleDocViewerModal}
                    selectedDocument={selectedFile}
                    docPurpose={type}
                />
            )} */}
            {taskDocuments.length ?
                <View style={{ marginVertical: 5 }}>
                    <Text><FormattedMessage id="document.task.file.list" /></Text>
                    <FlatList
                        data={taskDocuments}
                        nestedScrollEnabled={true}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (

                            <View style={styles.box}>
                                <TouchableOpacity onPress={async () => {
                                    try {
                                        if (Platform.OS === 'android') {
                                            await fileDownloaderAndroid(item.id, item.name, 2, type);
                                        } else {
                                            await fileDownloaderIIOS(item.id, item.name, 2, type);
                                        }
                                    } catch (error) {
                                        // Check if the error is related to sharing cancellation
                                        const errorMessage = error?.message || error?.toString() || '';
                                        const isShareCancelled = errorMessage.toLowerCase().includes('cancelled') || 
                                                               errorMessage.toLowerCase().includes('cancel') ||
                                                               errorMessage.toLowerCase().includes('user dismissed');
                                        
                                        // Only show error alert for actual download failures, not share cancellations
                                        if (!isShareCancelled) {
                                            Alert.alert(
                                                'Download Failed',
                                                `Failed to download ${item.name}. Please try again.`,
                                                [{ text: 'OK' }]
                                            );
                                        }
                                    }
                                }}
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        borderColor: "#ccc",
                                        marginVertical: 5,
                                        paddingHorizontal: 4,
                                        marginRight: 10,
                                        flex: 1,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
                                        {item?.name ? <DocumentsIcon url={item.name} /> : null}
                                        <View style={{ paddingLeft: 20, }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                                {item.name}
                                            </Text>
                                            <View style={{ flexDirection: "row" }}>
                                                <Text style={{ fontWeight: '400', color: "#6c757d", }}>
                                                    <BytesToSize bytes={item.size} /> {" "}
                                                </Text>
                                                <Text style={{ fontWeight: '400', color: "#6c757d", }}>
                                                    <FormatDateTime datevalue={item.uploadDate} type={2} />
                                                </Text>
                                            </View>
                                            <Text style={{ fontWeight: '400', color: "#6c757d", }}>{item.nameOfUploader}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                {type ?  <ModalMoreFile document={item} data={viewMore} subTaskId={subTaskId}/> : ""}
                            </View>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
                : null}</>
    )
}
const styles = StyleSheet.create({
    box: {
        marginVertical: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: '#fff',
        flexDirection: "row",
        justifyContent: "space-between"
    },
});
export default DocumentFileList
