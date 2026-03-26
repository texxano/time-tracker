/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';

import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from "native-base"

import { NavigationService } from "../../../navigator";

// Redux 
import { useSelector } from "react-redux";
import http from '../../../services/http'
// Redux

// Components
import ModalSubTask from "./components/ModalSubTask";
import ModalSubTaskStatusButton from "./components/ModalSubTaskStatusButton";
import DocumentTaskActivity from "./DocumentTaskActivity";
import DocumentFileList from "./components/DocumentFileList";
//  Components

const DocumentTaskView = ({ id }) => {

    const state = useSelector(state => state)
    const documentTasksRequest = state.documentTask.documentTasksRequest

    const [dataResponse, setDataResponse] = useState({});
    const [modal, setModal] = useState(false);
    const [modalComplete, setModalComplete] = useState(false);
    const [requestApi, setRequestApi] = useState(true);
    const [showActivity, setShowActivity] = useState(false);

    useEffect(() => {
            if (!documentTasksRequest) {
                setRequestApi(true)
                http.get(`/doctask/sub/${id}`)
                    .then((data) => {
                        setRequestApi(false)
                        setDataResponse(data);
                    })
            }
    }, [documentTasksRequest]);

    const handleNavigateBack = () => {
        NavigationService.navigate('DocumentTask', { locationActive: "1", id: dataResponse.documentTaskId })
    };

    return (
        <>
            <TouchableOpacity onPress={() => handleNavigateBack()} style={{ flexDirection: "row", alignItems: 'center', justifyContent: "flex-end", paddingBottom: 10 }}>
                <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: '#ebf0f3', borderRadius: 5, }}>
                <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#ebf0f3", borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: '#fff', padding: 10 }}>
                    {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
                    <View style={{ borderBttomWidth: 1, borderColor: "#ebf0f3", borderTopLeftRadius: 5, borderTopRightRadius: 5, }}>
                        <Text><FormattedMessage id="document.task.step" /></Text>
                        <View style={{ marginVertical: 5, borderTopWidth: 1, borderColor: "#ccc", paddingBottom: 10 }}>
                            <View>
                                <Text style={{ fontSize: 20 }}>{dataResponse.name}</Text>
                                {dataResponse.description &&
                                    <Text style={{ fontSize: 16, }}>{dataResponse.description}</Text>
                                }
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ padding: 15, }}>
                    {dataResponse?.subtaskDocuments?.length ? <Text><FormattedMessage id="document.task.documents.sub.task" /></Text> : <Text><FormattedMessage id="document.task.documents.sub.task.noitem" /></Text>}
                    <FlatList
                        data={dataResponse.subtaskDocuments}
                        renderItem={({ item, index }) => (
                            <DocumentFileList taskDocuments={item} type={1} />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />
                    <View style={{ borderTopWidth: 1, borderColor: "#ebf0f3", }}>
                        <FormattedMessage id="projects.tabs.activity.title" />

                        <Checkbox
                            isChecked={showActivity}
                            onChange={() => setShowActivity(!showActivity)}
                            value={showActivity}
                            colorScheme="red"
                        />
                    </View>
                    <DocumentTaskActivity id={id} type={1} />
                </View>

            </View>
            <ModalSubTask
                id={dataResponse.id}
                type={0}
                mode={0}
                modal={modal}
                setModal={setModal}
            />
            <ModalSubTaskStatusButton id={dataResponse.id} type={2} modal={modalComplete} setModal={setModalComplete} />
        </>
    )
}

export default DocumentTaskView
