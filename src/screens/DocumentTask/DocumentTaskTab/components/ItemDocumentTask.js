import React, { useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSelector } from "react-redux";

import { NavigationService } from "../../../../navigator";

// Components
import FormatDateTime from '../../../../components/FormatDateTime'
import ModalMoreTaks from "./ModalMoreDocumentTask";
import { daysUntilDue } from '../../../../utils/dateFormat'
import TaskBadge from "./TaskBadge";
import InitialUser from "../../../../components/InitialUser";

const ItemDocumentTask = ({ data, isArchivePerson }) => {
    const state = useSelector(state => state)
    const isOwnerForRoot = state.userDataRole.isOwnerForRoot;

    const [showInfo, setShowInfo] = useState(true);

    const handleNavigate = () => {
        NavigationService.navigate("DocumentTask", {
            locationActive: "1",
            id: data.id,
        });
    };

    const numberOfDaysUntilDue = daysUntilDue(data.dueDate)
    const maxDaysUntilOverdue = 5

    const isOverdue = numberOfDaysUntilDue < 0
    const isDuedateSoon = numberOfDaysUntilDue <= maxDaysUntilOverdue && numberOfDaysUntilDue > 0
    const isNew = data.numberOfSubtasks === 0
    const isInProgress = data.numberOfSubtasks > data.numberOfCompletedSubtasks
    const projectOwner = data.users.filter(user => !user?.isRootOwner && user?.isSectorSupervisor)[0]

    return (
        <>
            <View style={[styles.box, { borderColor: data.isCompleted ? "#28a745" : "#ccc" }]}>
                <View style={styles.rowSb}>
                    <TouchableOpacity
                        onPress={() => handleNavigate()}
                        style={{ width: "90%" }}
                        disabled={isArchivePerson && !isOwnerForRoot}
                    >
                        <View style={styles.rowSb}>
                            <Text style={{ fontSize: 20 }}>{data.name}</Text>
                        </View>
                        <Text style={{ fontSize: 16 }}>{data.description}</Text>
                        <View style={{ marginVertical: 10 }}>
                            <Text style={{ fontSize: 16 }}><FormattedMessage id="document.task.placeholder.requester" />: {data.nameOfRequester}</Text>
                        </View>
                        <View >
                            {projectOwner &&
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <View><InitialUser FirstName={projectOwner.firstName} LastName={projectOwner.lastName} email={projectOwner.email} /></View>
                                    <View style={{ paddingLeft: 10 }}>
                                        <Text style={{ fontSize: 18, fontWeight: Platform.OS === 'ios' ? '500' : '400', }}>{projectOwner.firstName} {projectOwner.lastName}</Text>
                                        <Text style={{ fontSize: 13 }}>{projectOwner.email}</Text>
                                    </View>
                                </View>}
                            <View >
                                {data.sectorId && data.sectorName ? (
                                    <View style={{ gap:3, width: "100%" }} data-tip data-for={data.projectId}>
                                        <Text style={{ fontSize: 16 }}>{data.sectorName}</Text>
                                    </View>
                                ) : (<></>)}
                            </View>
                        </View >
                        <View >
                            <TaskBadge isInProgress={isInProgress} isOverdue={isOverdue} isDuedateSoon={isDuedateSoon} isNew={isNew} data={data} />
                        </View>
                        <View >
                            <View style={{ marginVertical: 10 }}>
                                {showInfo && <View >
                                    {data.creationDate &&
                                        <Text style={{ fontSize: 13 }}>
                                            <FormattedMessage id="created.at" />: <FormatDateTime datevalue={data.creationDate} type={2} />
                                        </Text>
                                    }
                                    {data.isCompleted && showInfo &&
                                        <Text style={{ fontSize: 13 }}>
                                            <FormattedMessage id="completed.at" />:<FormatDateTime datevalue={data.completedOn} type={2} />
                                        </Text>
                                    }
                                </View>}
                            </View>
                            {data.conclusion ?
                                <View >
                                    <Text style={{ fontSize:16 }}><FormattedMessage id="conclusion" />: {data.conclusion}</Text>
                                </View>
                                : null}
                        </View>
                    </TouchableOpacity>
                    {/* <ModalMoreTaks docTaskdata={data} /> */}
                </View>
            </View>

        </>
    )
}
const styles = StyleSheet.create({
    box: {
        marginVertical: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderTopWidth: 8,
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
        paddingRight: 5,
        paddingTop: 10,
        color: "#28a745",
    },
    rowSb: {
        flexDirection: "row",
        justifyContent: "space-between"
    }
});
export default ItemDocumentTask
