/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FormattedMessage, } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { documentTaskFile } from "../../../../services/DocumentTask/documentTaskFile.Services"

import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import { deleteDocumentTask } from "../../../../redux/actions/DocumentTask/documentTask.actions"
import { modalStyle } from "../../../../asset/style/components/modalStyle"

const ModalMoreFile = ({ document, data , subTaskId}) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data
    const [modalEditVisible, setModalEditVisible] = useState(false);

    const [reuplodDocumentId, setReuplodDocumentId] = useState(null)
    const [isSigned, setIsSigned] = useState(false)
    const [modalUploadSignDocument, setModalUploadSignDocument] = useState(false);
    const [request, setRequest] = useState(false);

    const handleReuploadDocument = (isReuploadDocument, id) => {
        setIsSigned(isReuploadDocument)
        setReuplodDocumentId(id)
        setModalUploadSignDocument(true)
    }
    const uploadDocument = async () => {
        try {
            setRequest(true);
            let response = await DocumentPicker.getDocumentAsync({ type: "*/*" });
            if (!response.canceled) {
                const { uri, name , extension} = response.assets[0];
                const base64Content = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64
                });
                const payload = {
                    name,
                    base64Content,
                    docPurpose: 1,
                    extension: name.split(".")[1],
                    subtaskId: subTaskId,
                    id: reuplodDocumentId,
                    sign: isSigned
                };
                const request = await documentTaskFile.reuploadDocumentTaskFile(payload);
                if (request.url) {
                    closeModal()
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
    const closeModal = () => {
        setModalEditVisible(false)
        setModalUploadSignDocument(false)
        setIsSigned(false)
        setReuplodDocumentId(null)
    };

    return (
        <>

            <Modal animationType="fade" transparent={true} visible={modalEditVisible} style={{ height: 500 }}>
                <Modal animationType="fade" transparent={true} visible={modalUploadSignDocument} style={{ height: 500 }}>
                    <View style={modalStyle.centeredViewSmall}>
                        <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                            <View style={modalStyle.modalEditClose} >
                                <TouchableWithoutFeedback onPress={() => setModalUploadSignDocument(!modalUploadSignDocument)}>
                                    <Ionicons name="close" size={24} color="#6c757d" />
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={{ borderWidth: 1, borderRadius: 5, borderColor: "#ccc", borderStyle: 'dashed', flexDirection: "row", justifyContent: "center", fontSize: 16, backgroundColor: "#fff", marginBottom: 15, paddingHorizontal: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={uploadDocument}>
                                    {request ? (
                                        <ActivityIndicator size="small" color="#6c757d80" style={{ marginVertical: 25, fontSize: 14, color: "#6c757d80" }} />
                                    ) : (
                                        <Text style={{ marginVertical: 25, fontSize: 14, color: "#6c757d80" }}>
                                            <FormattedMessage id="documents.form.upload.placeholder" />
                                        </Text>
                                    )}

                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </Modal>
                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalEditVisible(!modalEditVisible)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>

                        {data.isCompleted &&
                            <TouchableOpacity style={modalStyle.modalTitleEditView} onClick={() => handleReuploadDocument(true, document.id)}>
                                <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="reupload.the.document.signed" /></Text>
                            </TouchableOpacity>
                        }
                        {!data.isCompleted && !document.isSigned && <>
                            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handleReuploadDocument(false, document.id)}>
                                <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="reupload" /></Text>
                            </TouchableOpacity>
                        </>}

                    </View>
                </View>
            </Modal>

            <TouchableOpacity onPress={() => setModalEditVisible(!modalEditVisible)} style={{ height: 24 }}>
                <Text><Feather name="more-vertical" size={24} color="#6c757d" /></Text>
            </TouchableOpacity>

        </>
    )
}
export default ModalMoreFile
