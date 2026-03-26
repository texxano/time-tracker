import React from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { NavigationService } from "../../../navigator";

// Components
import FormatDateTime from '../../../components/FormatDateTime'
import ModalMoreTaks from "./ModalMoreTaks";

const ItemTask = ({ data, projectViewMode, dataNavigate }) => {
    const handleNavigate = () => {
        if (projectViewMode) {
            NavigationService.navigate("TaskProject", {
                projectId: dataNavigate.projectId,
                parentId: dataNavigate.parentId,
                permissionCode: dataNavigate.permissionCode,
                taskId: data.id,
            });
        } else {
            NavigationService.navigate("Task", {
                locationActive: "1",
                id: data.id,
            });
        }
    };

    return (
        <>
            <View style={[styles.box, { borderColor: data.isCompleted ? "#28a745" : "#ccc" }]}>
                <View style={styles.rowSb}>
                    <TouchableOpacity
                        onPress={() => handleNavigate()}
                        style={{ width: "90%" }}
                    >
                        <View style={styles.rowSb}>
                            <Text style={{ fontSize: 20 }}>{data.name}</Text>


                        </View>
                        <Text>{data.description}</Text>

                        {data?.projectId ? (
                            <TouchableOpacity onPress={() => { NavigationService.navigate('Project', { projectId: data.projectId, }) }} style={{ flexDirection: 'row', alignItems: "center", paddingTop: 10 }}>
                                <AntDesign name="folderopen" size={24} color={"#6c757d"} />
                                <Text> {data.projectTitle}</Text>
                            </TouchableOpacity>
                        ) : (<></>)}
                        <View >
                            <Text> {data.isCompleted ? (
                                <View style={styles.statusView}>
                                    <View style={styles.statusProject2}>
                                        <AntDesign name="checkcircle" size={18} color="#28a745" />
                                    </View>
                                    <Text style={styles.statusProject2}>
                                        <FormattedMessage id="projects.form.status.completed" />
                                    </Text>
                                    <Text style={styles.statusProject2}>
                                        <FormatDateTime datevalue={data.completedOn} type={1} />
                                    </Text>
                                </View>
                            ) : null}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <ModalMoreTaks taskdata={data} />
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
export default ItemTask
