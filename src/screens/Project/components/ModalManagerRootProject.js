import React, { useState, useEffect } from 'react'
import { Text, Modal, TouchableOpacity, View, Image, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { FormattedMessage, } from 'react-intl';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { Box, Input, Checkbox, TextArea } from "native-base"
import { useSelector, useDispatch } from "react-redux";
import { updateProject, addlogoRootProject, removeLogoRootProject } from '../../../redux/actions/Project/project.actions'
import SelectStatusProject from './ItemProject/SelectStatusProject';
import { modalStyle } from "../../../asset/style/components/modalStyle"
import MuteUnMuteNotifications from "./ItemProject/MuteUnMuteNotifications"
import ModalDeleteProject from './ModalDeleteProject';
import ModalDueDate from '../../../components/Modal/ModalDueDate';
import ModalReport from '../../../components/Modal/ModalReport';
import FormatDateTime from "../../../components/FormatDateTime";
import { check } from '../../../utils/statusUser'
import { dateFormat } from '../../../utils/dateFormat'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import ModalDeleteMyPermission from './ModalDeleteMyPermission';

export const encode = (uri) => {
    if (Platform.OS === 'android') return encodeURI(`file://${uri}`)
    else return uri
}

const ModalManagerRootProject = ({ projectdata }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const projectState = state.project
    const isAdministrator = state.userDataRole?.isAdministrator
    const [modalEdit, setModalEdit] = useState(false);
    const [modalEditVisible, setModalEditVisible] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [dataCapacity, setDataCapacity] = useState(projectdata.size);
    const [totalCapacity, setTotalCapacity] = useState(projectdata.capacity);
    let totalCapacityToGb = (projectdata.capacity / (1024 * 1024 * 1024)).toFixed(0)
    const [totalCapacityEdit, setTotalCapacityEdit] = useState(totalCapacityToGb);
    const [title, setTitle] = useState(projectdata.title);
    const [description, setDescription] = useState(projectdata.description);
    const [address, setAddress] = useState(projectdata.address);

    const [statusProject, setStatusProject] = useState(projectdata.status);
    const [dueDate, setDueDate] = useState(projectdata.dueDate);

    useEffect(() => {
        if (projectState.success) {
            setModalEdit(false)
            setModalEditVisible(false)
        }
    }, [projectState.success]);

    const handleUpdateProject = () => {
        setSubmitted(true)
        if (submitted && !title && !statusProject) {
        } else if (!title && !statusProject) {
        } else {
            const payload = {
                'id': projectdata.id,
                'title': title,
                'description': description,
                'status': statusProject,
                'capacity': totalCapacity,
                'address': address,
                'dueDate': dateFormat(dueDate),
                blockReason: projectdata.blockReason
            }
            dispatch(updateProject(payload));
        }
    }
    const handleUpdateProjectAdminstratore = () => {
        setSubmitted(true)
        if (submitted && !title && !statusProject) {
        } else if (!title && !statusProject) {
        } else {
            let capacityToByte = (totalCapacityEdit * (1024 * 1024 * 1024)).toFixed(0)
            const payload = {
                'id': projectdata.id,
                'title': title,
                'description': description,
                'status': statusProject,
                'capacity': capacityToByte,
                'address': address,
                'dueDate': dateFormat(dueDate),
                blockReason: projectdata.blockReason
            }

            dispatch(updateProject(payload));
        }
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const handleModalVisible = () => {
        setModalEditVisible(!modalEditVisible)
    }
    const uploadLogoRootProject = async () => {
        let response = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
        // const correctUri = encode(response.uri)
        const base64Content = await FileSystem.readAsStringAsync(response.assets[0]?.uri, {
            encoding: FileSystem.EncodingType.Base64
        });
        dispatch(addlogoRootProject(response.assets[0]?.name, base64Content, projectdata.id))
    }
    const removeLogo = async () => {
        dispatch(removeLogoRootProject(projectdata.id))
    }

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalEditVisible} style={{ height: 500 }}>
                <Modal animationType="slide" transparent={true} visible={modalEdit} >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={modalStyle.centeredView}>
                                <View style={modalStyle.modalView}>
                                    <Box style={[modalStyle.modalInput, modalStyle.paddingBottom60]} >
                                        <View style={modalStyle.modalViewTitle}>
                                            <Text style={modalStyle.modalTitle}>
                                                <FormattedMessage id="projects.form.edit.title" />
                                            </Text>
                                        </View>
                                        <ScrollView keyboardShouldPersistTaps='handled' keyboardDismissMode='on-drag' style={{ paddingHorizontal: 17, width: "100%" }}>
                                            <Box style={{ flexDirection: "row", }}>
                                                <Image style={{ width: 50, height: 50, borderRadius: 8 }} source={{ uri: projectdata.logoUrl }} />
                                                <View>
                                                    {projectdata.logoUrl ? (
                                                        <TouchableOpacity activeOpacity={0.5} onPress={removeLogo}>
                                                            <Text style={{ paddingRight: 10 }}>
                                                                <AntDesign name="closecircleo" size={16} color="red" />
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ) : (<></>)}
                                                </View>
                                                <TouchableOpacity activeOpacity={0.5} onPress={uploadLogoRootProject}>
                                                    <Text style={{ marginVertical: 25, fontSize: 14, color: "#6c757d80" }}>
                                                        <FormattedMessage id="documents.form.upload.placeholder" />
                                                    </Text>
                                                </TouchableOpacity>
                                            </Box>

                                            <FormattedMessage id="projects.form.title.placeholder">
                                                {placeholder =>
                                                    <Input
                                                        size={"lg"}
                                                        _focus
                                                        w="100%"
                                                        type="text"
                                                        placeholder={placeholder.toString()}
                                                        value={title}
                                                        onChangeText={(e) => setTitle(e)}
                                                        my={3}
                                                        style={{ height: 40, backgroundColor: "#fff" }}
                                                        isDisabled={!isAdministrator}
                                                    />
                                                }
                                            </FormattedMessage>
                                            {submitted && !title && <Text style={{ fontSize: 14, color: "#dc3545" }}><FormattedMessage id="projects.form.title.error.required"/></Text>}
                                            <FormattedMessage id="projects.form.description.placeholder">
                                                {placeholder =>
                                                    <TextArea
                                                        size={"lg"}
                                                        _focus
                                                        w="100%"
                                                        type="text"
                                                        placeholder={placeholder.toString()}
                                                        value={description}
                                                        onChangeText={(e) => setDescription(e)}
                                                        my={3}
                                                        style={{ backgroundColor: "#fff" }}
                                                    />
                                                }
                                            </FormattedMessage>
                                            <FormattedMessage id="projects.form.address.placeholder">
                                                {placeholder =>
                                                    <Input
                                                        size={"lg"}
                                                        _focus
                                                        w="100%"
                                                        type="text"
                                                        placeholder={placeholder.toString()}
                                                        value={address}
                                                        onChangeText={(e) => setAddress(e)}
                                                        my={3}

                                                        style={{ height: 40, backgroundColor: "#fff" }}
                                                    />
                                                }
                                            </FormattedMessage>

                                            <SelectStatusProject onSelect={value => { setStatusProject(value); }} select={projectdata.status} />

                                            <View style={{ flexDirection: "column", flexWrap: "wrap", marginTop: 20 }}>
                                                <Text>Size</Text>
                                                <Input
                                                    size={"lg"}
                                                    _focus
                                                    w="50%"
                                                    value={(formatBytes(dataCapacity)).toString()}
                                                    onChangeText={(e) => setDataCapacity(e)}

                                                    style={{ height: 40, backgroundColor: "#fff" }}
                                                    my={3}
                                                    isDisabled={!isAdministrator}
                                                />
                                            </View>
                                            {isAdministrator ? (
                                                <Box style={{ flexDirection: "column", flexWrap: "wrap", }}>
                                                    <Text><FormattedMessage id="Capacity" /></Text>
                                                    <Box style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                                                        <Input
                                                            size={"lg"}
                                                            _focus
                                                            w="90%"
                                                            value={totalCapacityEdit}
                                                            onChangeText={(e) => setTotalCapacityEdit(e)}

                                                            style={{ height: 40, backgroundColor: "#fff" }}
                                                            my={3}
                                                            mr={2}
                                                        />
                                                        <Text>GB</Text>
                                                    </Box>

                                                </Box>
                                            ) : (
                                                <Box style={{ flexDirection: "column", flexWrap: "wrap", }}>
                                                    <Text>Capacity</Text>
                                                    <Input
                                                        size={"lg"}
                                                        _focus
                                                        w="100%"
                                                        isDisabled
                                                        value={(formatBytes(totalCapacity)).toString()}
                                                        onChangeText={(e) => setDataCapacity(e)}

                                                        style={{ height: 40, backgroundColor: "#fff" }}
                                                        my={3}
                                                    />
                                                </Box>
                                            )}
                                            <Box style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", paddingVertical: 10 }}>
                                                {dueDate ? (
                                                    <Box style={{ flexDirection: "row", alignItems: "center", paddingTop: 10 }}>

                                                        <Text style={{ fontSize: 16 }}><FormatDateTime datevalue={dueDate} type={1} /> </Text>
                                                        {isAdministrator ? (
                                                            <TouchableOpacity onPress={() => setDueDate(projectdata.dueDate)}>
                                                                <AntDesign name="back" size={24} color="#6c757d" />
                                                            </TouchableOpacity>
                                                        ) : (<></>)}
                                                    </Box>
                                                ) : (<Text></Text>)}
                                                {isAdministrator ? (<ModalDueDate projectdata={projectdata} onDeadlineChange={value => { setDueDate(value) }} date={true} />) : (<></>)}
                                            </Box>

                                            <Box>
                                                <View style={modalStyle.progresContainer}>
                                                    <View style={[modalStyle.progresLine, { backgroundColor: "#2196F3", width: `${dataCapacity / totalCapacity}%` }]} />
                                                </View>
                                                <Text>{formatBytes(totalCapacity - dataCapacity)} free of {formatBytes(totalCapacity)}</Text>
                                            </Box>
                                            {submitted && projectState.failure ? (<Text style={{ fontSize: 14, color: "#dc3545" }}><FormattedMessage id={projectState.failure} /></Text>) : (<></>)}
                                        </ScrollView>
                                    </Box>
                                    <Box style={modalStyle.ModalBottom}>
                                        <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalEdit(false)}>
                                            <Text style={modalStyle.textStyle}>
                                                <FormattedMessage id="common.button.close" /></Text>
                                        </TouchableOpacity>
                                        {isAdministrator ? (
                                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleUpdateProjectAdminstratore()}>
                                                <Text style={modalStyle.textStyle}>
                                                    <FormattedMessage id="common.button.confirm" /></Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleUpdateProject()}>
                                                <Text style={modalStyle.textStyle}>
                                                    <FormattedMessage id="common.button.confirm" /></Text>
                                            </TouchableOpacity>
                                        )}
                                    </Box>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </Modal>
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalViewEdit}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalEditVisible(!modalEditVisible)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <MuteUnMuteNotifications projectId={projectdata.id} isMutedForNotifications={projectdata.isMutedForNotifications} />
                        {projectdata.loggedUserPermissionCode >= 2 ? (
                            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalEdit(true)}>
                                <Text style={modalStyle.modalTitleEdit} >
                                    <FormattedMessage id="common.button.edit" />
                                </Text>
                            </TouchableOpacity>
                        ) : (<></>)}
                        {projectdata.loggedUserPermissionCode === 3 && !isAdministrator ? (
                            <ModalReport projectId={projectdata.id} reportFor={0} />
                        ) : (<></>)}
                        {isAdministrator ? (
                            <ModalDeleteProject projectId={projectdata.id} projectName={projectdata.title} />
                        ) : (<></>)}
                        {projectdata.loggedUserPermissionCode < 3 ? (
                            <ModalDeleteMyPermission projectId={projectdata.id} projectTitle={projectdata.title} />
                        ) : (<></>)}
                    </View>
                </View>
            </Modal>

            <TouchableOpacity onPress={handleModalVisible}>
                <Text><Feather name="more-vertical" size={24} color="#6c757d" /></Text>
            </TouchableOpacity>
        </>
    )
}
export default ModalManagerRootProject
