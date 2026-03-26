/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef } from "react";
import { FormattedMessage, } from 'react-intl';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { AntDesign } from '@expo/vector-icons';

import { documentTaskFile } from "../../../../services/DocumentTask/documentTaskFile.Services"
import DocumentsIcon from "../../../Project/components/ItemDocuments/DocumentsIcon";

const DocumentFileListUpload = ({ files, setFiles, type, viewList }) => {
    const [request, setRequest] = useState(false);

    // TODO
    // reuploadDocumentTaskFile
    const uploadDocument = async () => {
        try {
            setRequest(true);
            let response = await DocumentPicker.getDocumentAsync({ type: "*/*" });
            if (!response.canceled) {
                const { uri, name } = response.assets[0];
                const base64Content = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64
                });

                const payload = {
                    name,
                    base64Content,
                    docPurpose: type
                };
                const request = await documentTaskFile.uploadDocumentTaskFile(payload);
                if (request.name) {
                    setFiles((prevFiles) => {
                        const updatedFiles = [...prevFiles, request];
                        return updatedFiles;
                    });
                    flatListRef.current?.scrollToEnd({ animated: true });
                } else {
                    console.error('Failed to upload document');
                }
            }
        } catch (error) {
            console.error('Error uploading document:', error);
        } finally {
            setRequest(false);
        }

    }
    const flatListRef = useRef(null);

    const handleDeleteFile = async (id) => {
        const request = await documentTaskFile.deleteDocumentTaskFile(id)
        if (request.status >= 200 && request.status <= 299) {
            let index = files.map(x => { return x.id; }).indexOf(id);
            files.splice(index, 1)
            setFiles([...files])
        }
    }

    return (
        <>
            {viewList ?
                <View>
                    {files?.length ? (
                        <Text>
                            <FormattedMessage id="projects.tabs.documents.title" />: {files?.length}
                        </Text>
                    ) : null}

                    <FlatList
                        ref={flatListRef}
                        data={files}
                        renderItem={({ item, index }) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    borderColor: "#ccc",
                                    marginVertical: 5,
                                    backgroundColor: "#fff",
                                    borderWidth: 1,
                                    paddingHorizontal: 8,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    marginRight: 10,
                                    flex: 1,
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
                                    {item?.name ? <DocumentsIcon url={item.name} /> : null}
                                    <View>
                                        <Text style={{ fontSize: 16, paddingLeft: 20, fontWeight: '500' }}>
                                            {item.name}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteFile(item.id)}>
                                    <AntDesign name="closecircleo" size={24} color="black" />
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                : null}
            <View style={{ borderWidth: 1, borderRadius: 5, borderColor: "#ccc", borderStyle: 'dashed', flexDirection: "row", justifyContent: "center", fontSize: 16, backgroundColor: "#fff", marginBottom: 15, paddingHorizontal: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={uploadDocument}>
                    {request ? (
                        <ActivityIndicator size="small" color="#6c757d80" style={{ marginVertical: viewList ? 25 : 10, fontSize: 14, color: "#6c757d80" }} />
                    ) : (
                        <Text style={{ marginVertical: viewList ? 25 : 10, fontSize: 14, color: "#6c757d80" }}>
                            <FormattedMessage id="documents.form.upload.placeholder" />
                        </Text>
                    )}

                </TouchableOpacity>
            </View>
        </>
    )
}

export default DocumentFileListUpload
