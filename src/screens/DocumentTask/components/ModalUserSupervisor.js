/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Switch,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";

import { taskUserConfig } from "../../../redux/actions/DocumentTask/taskUserConfig.actions";

import { modalStyle } from "../../../asset/style/components/modalStyle";

const ModalUserSupervisor = ({ dataUser }) => {
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const documentTasksState = state.documentTask
    const userId = dataUser?.userId;

    const [modalSupervisor, setModalSupervisor] = useState(false);
    const [isSupervisor, setIsSupervisor] = useState(dataUser?.isSupervisor);
    const [isArchivePerson, setArchivePerson] = useState(
        dataUser?.isArchivePerson
    );

    const handleSubmitUserConfig = () => {
        const payload = {
            userId,
            isSupervisor,
            isArchivePerson

        };
        dispatch(taskUserConfig(payload));
    };
    useEffect(() => {
        if (documentTasksState) {
            setModalSupervisor(false);
        }
    }, [documentTasksState]);

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalSupervisor}>
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalView}>

                        <View style={modalStyle.modalViewTitle}>
                            <Text style={modalStyle.modalTitle}>
                                {dataUser.firstName} {dataUser.lastName}
                            </Text>
                        </View>
                        <View
                            style={[
                                modalStyle.modalInput,
                                modalStyle.bodyModal,
                                { justifyContent: "space-between" },
                            ]}
                        >
                            <Text style={{ fontSize: 20, paddingRight: 10 }}>
                                <FormattedMessage id="Is.Supervisor" />
                            </Text>
                            <Switch
                                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                thumbColor={isSupervisor ? "#007bff" : "#f4f3f4"}
                                ios_backgroundColor="#7d7d7d"
                                onValueChange={() => setIsSupervisor(!isSupervisor)}
                                value={isSupervisor}
                            />
                        </View>
                        <View
                            style={[
                                modalStyle.modalInput,
                                modalStyle.bodyModal,
                                { justifyContent: "space-between" },
                            ]}
                        >
                            <Text style={{ fontSize: 20, paddingRight: 10 }}>
                                <FormattedMessage id="document.task.is.archive.person" />
                            </Text>
                            <Switch
                                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                thumbColor={isArchivePerson ? "#007bff" : "#f4f3f4"}
                                ios_backgroundColor="#7d7d7d"
                                onValueChange={() => setArchivePerson(!isArchivePerson)}
                                value={isArchivePerson}
                            />
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity
                                style={[modalStyle.button, modalStyle.buttonClose]}
                                onPress={() => setModalSupervisor(false)}
                            >
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" />
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyle.button, modalStyle.buttonAdd]}
                                onPress={() => handleSubmitUserConfig()}
                            >
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.confirm" />
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={() => setModalSupervisor(true)}>
                <View
                    style={{
                        backgroundColor: "#dee2e6",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#c7cbcf",
                        padding: 6,
                        marginLeft: 15,
                        alignSelf: "flex-start",
                    }}
                >
                    <Feather name="edit" size={20} color="#6c757d" />
                </View>
            </TouchableOpacity>
        </>
    );
};

export default ModalUserSupervisor;
