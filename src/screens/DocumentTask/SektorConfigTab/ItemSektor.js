import React from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { NavigationService } from "../../../navigator";

// Components
import ModalMoreSektor from "./ModalMoreSektor";

const ItemSektor = ({ data }) => {
    return (
        <>
            <View style={styles.box}>
                <View style={styles.row}>
                        <View style={styles.rowSb}>
                            <Text style={{ fontSize: 20 }}>{data.name}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: "center", paddingTop: 10 }}>
                            <Text style={{ fontSize: 16 }}><FormattedMessage id="sector.number" />: </Text>
                            <Text style={{ fontSize: 16, fontWeight: "500" }}> {data.number}</Text>
                        </View>
                        {data?.sectorSupervisorId ? (
                            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                <Text style={{ fontSize: 16 }}><FormattedMessage id="Supervisor" />: </Text>
                                <Text style={{ fontSize: 16, fontWeight: "500" }}> {data.supervisorFirstName} {data.supervisorLastName}</Text>
                            </View>
                        ) : (<></>)}
                        {data?.projectId ? (
                            <TouchableOpacity onPress={() => { NavigationService.navigate('Project', { projectId: data.projectId, }) }} style={{ flexDirection: 'row', alignItems: "center", paddingTop: 10 }}>
                                <AntDesign name="folderopen" size={24} color={"#6c757d"} />
                                <Text> {data.projectTitle}</Text>
                            </TouchableOpacity>
                        ) : (<></>)}
                </View>
                <ModalMoreSektor sector={data} />
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
        borderRadius: 5,
        backgroundColor: '#fff',
        flexDirection: "row",
        justifyContent: "space-between"
    },
});
export default ItemSektor
