import React, { useEffect, useState, useMemo } from "react";
import { Text, View, ActivityIndicator, Keyboard, StyleSheet } from 'react-native';
import { Input, Radio, Icon } from "native-base";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import { FormattedMessage } from 'react-intl';


// Redux 
import { useSelector } from "react-redux";
import http from '../../services/http'
    
// Redux

// Components
import HeaderProject from "./components/HeaderProject";
import RoleInProject from "./components/ItemProject/RoleInProject";
import FormatDateTime from "../../components/FormatDateTime";
// Components

import { globalStyles } from "../../asset/style/globalStyles"
import AppContainerClean from "../../components/AppContainerClean";

const ReportProject = (route) => {
    const { projectId, parentId, permissionCode } = route.navigation.state.params
    const state = useSelector(state => state)
    const isAdministrator = state.userDataRole?.isAdministrator
    const getProjectDataState = state.getProjectData


    const [dataResponse, setDataResponse] = useState([]);
    const [notAuthorized, setNotAuthorized] = useState(false)
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(!isAdministrator);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("");

    useEffect(() => {
        if ( !isAdministrator) {
            setRequestApi(true)
            http.get(`/projects/${projectId}/report`,)
                .then((data) => {
                    setRequestApi(false)
                    setDataResponse(data);
                    if (data.length !== 0) {
                        setDataLength(false)
                    } else {
                        setDataLength(true)
                    }
                })
                .catch(() => {
                    setRequestApi(false)
                    setNotAuthorized(true)
                })
        }
    }, [ projectId]);

    const dataMemo = useMemo(() => {
        let data = dataResponse;
        if (search) {
            data = data.filter(data => data.title.toLowerCase().includes(search.toLowerCase()))
        }
        if (selected) {
            data = data.filter(data => data.status.toLowerCase().includes(selected.toLowerCase()));
        }
        return data
    }, [search, dataResponse, selected]);

    const clearSearch = () => {
        setSearch("")
        Keyboard.dismiss()
    }

    return (
        <>
            <AppContainerClean location={'ReportProject'} notAuthorized={notAuthorized}>
                <HeaderProject location={'ReportProject'} projectId={projectId} parentId={parentId} permissionCode={permissionCode} />
                <View style={[globalStyles.rowSpaceBetweenAlignItems, globalStyles.minHeight]}>
                    <View style={globalStyles.rowSpaceBetweenAlignItems}>
                        <Text style={globalStyles.screenTitle}>
                            <FormattedMessage id="projects.report" />
                        </Text>
                    </View>
                </View>
                <FormattedMessage id="projects.filter.title">
                    {placeholder =>
                        <Input
                            size={"lg"}
                            _focus
                            InputLeftElement={<Icon style={{ marginLeft: 10, color: "#ccc", fontSize: 22 }} as={<Ionicons name="filter" />} />}
                            InputRightElement={search.length !== 0 ? (<Icon onPress={clearSearch} style={{ marginLeft: 10, color: "#aeafb0", fontSize: 22 }} as={<Ionicons name="close-sharp" />} />) : (<></>)}
                            w="100%"
                            type="text"
                            placeholder={placeholder.toString()}
                            value={search}
                            onChangeText={(e) => setSearch(e)}
                            my={3}
                            // variant="rounded"
                            style={{ height: 40, backgroundColor: "#fff" }}
                        />
                    }
                </FormattedMessage>
                <Radio.Group name="myRadioGroup" value={selected} onChange={nextValue => { setSelected(nextValue); }}>
                    <View style={globalStyles.bottomProjectReport}>
                        <View style={{ flexDirection: "row", paddingRight: 10 }}>
                            <Radio value="" colorScheme="coolGray" my={1}>
                                <Text style={styles.textGrey}> All</Text>
                            </Radio>
                        </View>
                        <View style={{ flexDirection: "row", paddingRight: 10 }}>
                            <Radio value="New" colorScheme="primary" my={1}>
                                <Text style={selected === 'New' ? styles.textNew : styles.textGrey}> <FormattedMessage id="projects.form.status.new" /></Text>
                            </Radio>
                        </View>
                        <View style={{ flexDirection: "row", paddingRight: 10 }}>
                            <Radio value="InProgress" colorScheme="yellow" my={1}>
                                <Text style={selected === 'InProgress' ? styles.textInProgress : styles.textGrey}> <FormattedMessage id="projects.form.status.progress" /></Text>
                            </Radio>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Radio value="Completed" colorScheme="green" my={1}>
                                <Text style={selected === 'Completed' ? styles.textCompleted : styles.textGrey}> <FormattedMessage id="projects.form.status.completed" /></Text>
                            </Radio>
                        </View>
                    </View>
                </Radio.Group>

                <View>
                    {requestApi ? (<ActivityIndicator size="small" color="#6c757d" />) : (<></>)}
                    <View style={globalStyles.projectReport} >
                        <View style={globalStyles.rowSpaceBetweenAlignItems}>
                            <Text style={globalStyles.projectParentTitle}>  {getProjectDataState.title}</Text>
                            <RoleInProject loggedUserPermissionCode={permissionCode} />
                        </View>
                        {dataMemo?.map((data, index) => (
                            <View key={data.count} style={index === dataMemo.length - 1 ? styles.boxData2 : styles.boxData} >
                                <Text style={{ fontSize: 18, fontWeight: "500", }}>{data.title}</Text>
                                <Text><MaterialCommunityIcons name="folder-marker-outline" size={18} color="#343a40" /> {data.path}</Text>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 }} >
                                    <Text style={{ fontSize: 16 }}>{data.dueDate ? (<><MaterialCommunityIcons name="calendar" size={18} color="#343a40" /><FormatDateTime datevalue={data.dueDate} type={1} /></>) : (<></>)}</Text>
                                    {(() => {
                                        if (data.status === "New") {
                                            return (<Text style={styles.textNew}><FormattedMessage id="projects.form.status.new" /></Text>)
                                        } else if (data.status === "InProgress") {
                                            return (<Text style={styles.textInProgress}><FormattedMessage id="projects.form.status.progress" /></Text>)
                                        } else if (data.status === "Completed") {
                                            return (<Text style={styles.textCompleted}><FormattedMessage id="projects.form.status.completed" /></Text>)
                                        }
                                    })()}
                                </View>
                                <View style={globalStyles.bottomProjectReport}>
                                    {data.users.map((dataUsers, index) => (
                                        <Text key={index} style={{ fontSize: 15 }}>{index + 1}.{dataUsers.firstName} {dataUsers.lastName}   </Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                    {dataLength && !requestApi ? (<Text style={globalStyles.dataLength}><FormattedMessage id="projects.list.noItems" /> </Text>) : (<></>)}
                </View>

            </AppContainerClean>
        </>
    );
};
const styles = StyleSheet.create({
    boxData: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        padding: 10,
        marginBottom: 1,
        borderColor: "#ccc"
    },
    boxData2: {
        borderTopWidth: 1,
        padding: 10,
        marginBottom: 1,
        borderColor: "#ccc"
    },
    textNew: {
        color: "#17a2b8",
        fontSize: 16
    },
    textInProgress: {
        color: "#ffc107",
        fontSize: 16
    },
    textCompleted: {
        color: "#28a745",
        fontSize: 16
    },
    textGrey: {
        color: "#717171",
        fontSize: 16
    },

});
export default ReportProject
