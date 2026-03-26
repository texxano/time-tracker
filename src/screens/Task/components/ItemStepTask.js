import React, { useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
// Redux 
import { useDispatch, useSelector } from "react-redux";
import { deleteStepTask } from "../../../redux/actions/Task/stepTask.actions"
// Components
import ModalDelete2 from "../../../components/Modal/ModalDelete2";
import FormatDateTime from '../../../components/FormatDateTime'
import InitialUser from "../../../components/InitialUser";
import ModalEditStepTask from "./ModalEditStepTask";
import ModalStepTask from "./ModalStepTask";
import { modalStyle } from "../../../asset/style/components/modalStyle"

const ItemStepTask = ({ data, isCompletedBefore, index }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const userIdState = state.userDataRole.userId
    const shotgunIsSupervisor = state.userDataModule?.shotgunIsSupervisor
    const [modalDelete, setModalDelete] = useState(false);
    const [modal, setModal] = useState(false);
    const [modalComplete, setModalComplete] = useState(false);
    const [modalRolback, setModalRolback] = useState(false);
    const handleDeletedById = (id) => {
        dispatch(deleteStepTask(id));
    };
    return (
        <>
            {data ? (
                <>
                    <ModalDelete2
                        id={data.id}
                        description={"shotgun.task.step.delete.modal.description.this"}
                        deleted={handleDeletedById}
                        modalDelete={modalDelete}
                        setModalDelete={setModalDelete}
                    />
                    <ModalEditStepTask
                        id={data.id}
                        type={1}
                        modal={modal}
                        setModal={setModal}
                        data={data}
                    />
                    <ModalStepTask id={data.id} type={0} modal={modalComplete} setModal={setModalComplete} />
                    <ModalStepTask id={data.id} type={1} modal={modalRolback} setModal={setModalRolback} />
                </>
            ) : (<></>)}
            <View style={[styles.box, { borderColor: data.isCompleted ? '#28a745' : '#ccc' }]}>
                <View >
                    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
                        <View style={{ borderRightWidth: 1, borderRightColor: "#ccc" }}>
                            <Text style={{ fontSize: 20, padding: 10, }}>{data.order}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between", width: "86%" }}>
                            <Text style={{ fontSize: 20, padding: 10, }}>{data.name}</Text>
                            {shotgunIsSupervisor && data.isCompleted === false ? (
                                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => setModal(true)}>
                                        <Feather name="edit" size={24} color="#6c757d" />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => setModalDelete(true)}>
                                        <AntDesign name="delete" size={24} color="#6c757d" />
                                    </TouchableOpacity>
                                </View>
                            ) : (<></>)}
                        </View>
                    </View>
                </View>
                {data.description &&
                    <View style={{ padding: 10, borderBottomWidth: 0.4, borderBottomColor: "#ccc" }}>
                        <Text style={{ fontSize: 16, }}>{data.description}</Text>
                    </View>
                }
                <View>
                    <View style={{ padding: 10, borderBottomWidth: 0.4, borderBottomColor: "#ccc", flexDirection: "row", }}>
                        <Text ><InitialUser FirstName={data.firstName} LastName={data.lastName} email={data.email} color={data.color} />  </Text>
                        <View style={{ paddingLeft: 10 }}>
                            <Text style={{ fontSize: 16 }}>{data.firstName} {data.lastName}</Text>
                            <Text style={{ fontSize: 13 }}>{data.email}</Text>
                        </View>
                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={{ fontSize: 16 }}><FormattedMessage id="Due.Date.Title" />: <FormatDateTime datevalue={data.dueDate} type={1} /></Text>
                        {data.completedOn ? (
                            <Text style={{ fontSize: 16 }}><FormattedMessage id="projects.form.status.completed" />: <FormatDateTime datevalue={data.completedOn} type={2} /></Text>
                        ) : (<></>)}
                    </View>
                </View>

                {userIdState === data.userId || shotgunIsSupervisor ? (
                    <>
                        {(isCompletedBefore && data.isCompleted === false) || (index === -1 && data.isCompleted === false) ? (
                            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, borderTopWidth: 0.8, borderTopColor: "#ccc" }}>
                                {index > -1 ? (<TouchableOpacity style={[modalStyle.button, modalStyle.buttonVacationDelete]} onPress={() => setModalRolback(true)}>
                                    <Text style={{ color: "#fa002d" }}><FormattedMessage id="Rollback.Step.Task.Button" /> <FontAwesome name="rotate-left" size={18} color="#fa002d" /></Text>
                                </TouchableOpacity>) : (<></>)}
                                <TouchableOpacity style={[modalStyle.button, modalStyle.buttonGreeanOutline]} onPress={() => setModalComplete(true)} >
                                    <Text style={modalStyle.textGreeanOutline}>
                                        <FormattedMessage id="Complete.Step.Task.Button" />
                                        {'  '}
                                        <AntDesign name="checksquareo" size={18} color="#28a745" />
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        ) : (<></>)}
                    </>
                ) : (<></>)}
            </View>
        </>
    )
}
const styles = StyleSheet.create({
    box: {
        marginVertical: 10,
        borderWidth: 1,
        borderLeftWidth: 8,
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    boxNotCompleted: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    boxCompleted: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#28a745",
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    statusView: {
        flexDirection: "row",
        alignItems: "center"
    },
    statusProject1: {
        fontSize: 18,
        paddingLeft: 3,
        color: "#ffc107",
    },
    statusProject2: {
        fontSize: 18,
        paddingLeft: 3,
        color: "#28a745",
    }
});
export default ItemStepTask
