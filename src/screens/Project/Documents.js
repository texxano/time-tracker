import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, Modal, View, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { FormattedMessage } from 'react-intl';
import fileDownloaderIIOS from '../../utils/fileDownloader.ios';
import fileDownloaderAndroid from '../../utils/fileDownloader.android';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
// Redux 
import { useSelector, useDispatch } from "react-redux";

import http from '../../services/http'
import { documentCount, postDocument, deleteAllDocument } from '../../redux/actions/Project/document.actions'
import { getProject } from '../../redux/actions/Project/project.actions'
// Redux 

import { BytesToSize } from "../../utils/BytesToSize";
// Components
import HeaderProject from "./components/HeaderProject";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import FormatDateTime from "../../components/FormatDateTime";
import ModalDelete from "../../components/Modal/ModalDelete";
import DocumentsIcon from "./components/ItemDocuments/DocumentsIcon";
import DocumentsSatistic from "./components/ItemDocuments/DocumentsSatistic";
import ModalMoreDocuments from "./components/ItemDocuments/ModalMoreDocuments";
import flex from "../../asset/style/flex.style";
import colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

// Components

import { styles } from "../../asset/style/Project/document"
import { globalStyles } from "../../asset/style/globalStyles"
import AppContainerClean from "../../components/AppContainerClean";

export const encode = (uri) => {
    if (Platform.OS === 'android') return encodeURI(`file://${uri}`)
    else return uri
}

const Documents = (route) => {
    const { projectId, parentId, permissionCode, fromNotifications } = route.navigation.state.params

    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const getProjectDataState = state.getProjectData
    const token = useSelector((state) => state.userToken.token);
    const [parentIdRoute, setParentIdRoute] = useState(parentId);
    const [userPermissionCode, setUserPermissionCode] = useState(permissionCode || getProjectDataState.loggedUserPermissionCode);
    const isAdministrator = state.userDataRole?.isAdministrator
    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState("");
    const documentsState = state.documents
    const documentRequest = state.documents.documentRequest

    const documentCountState = state.documentCount.count
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(!isAdministrator);
    const [showStatistics, setShowStatistics] = useState(false);

    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setpagination] = useState(0);
    const [notAuthorized, setNotAuthorized] = useState(false)


    useEffect(() => {
        if (!isAdministrator) {
            if (documentsState) {
                http.get(`/documents?projectId=${projectId}${currentPage ? `&page=${currentPage}` : ''}${search ? `&search=${search}` : ''}`)
                    .then((data) => {
                        if (search.length === 0) {
                            dispatch(documentCount(data.totalItems))
                        }
                        setPageIndex(data.pageIndex)
                        setTotalPages(data.totalPages)
                        setRequestApi(false)
                        setDataResponse(data.list);
                        setDataLength(data.list.length === 0);
                        setNotAuthorized(false)
                    })
            }
        }
    }, [documentsState, currentPage, projectId, search]);


    const uploadDocument = async () => {
        let response = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        const base64Content = await FileSystem.readAsStringAsync(response.assets[0]?.uri, {
            encoding: FileSystem.EncodingType.Base64
        }); 
        const name = response.assets[0]?.name
        const payload = { name, base64Content, projectId }
        dispatch(postDocument(payload))
    }

    const handleDeletedAll = (projectId) => {
        dispatch(deleteAllDocument(projectId));
    };
    useEffect(() => {
        if (dataLength && currentPage > 1) {
            setCurrentPage(-1)
        }
    }, [dataLength, currentPage]);

    return (
        <>
            <AppContainerClean location={'Documents'} pagination={pagination} notAuthorized={notAuthorized}  >
                <View style={{ height: "auto", minHeight: 36 }}>    
                    <HeaderProject location={'Documents'} projectId={projectId} parentId={parentIdRoute} permissionCode={userPermissionCode} />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 37 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={globalStyles.screenTitle}>
                        <FormattedMessage id="projects.tabs.documents.title" />{" "}
                    </Text>
                    {userPermissionCode === 3 && !isAdministrator && documentCountState ? (
                        <View style={{ marginLeft: 10 }}>
                        <ModalDelete
                            id={projectId}
                                description={"documents.delete.all.modal.description"}
                                deleted={handleDeletedAll}
                                type={0}
                            />
                        </View>
                    ) : (<></>)}
                        {userPermissionCode > 1 && !isAdministrator ? (
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={uploadDocument}
                                style={{ 
                                    marginLeft: 10,
                                    borderWidth: 1, 
                                    borderRadius: 5, 
                                    borderColor: colors.white, 
                                    borderStyle: 'dashed', 
                                    backgroundColor: colors.blue_100, 
                                    paddingHorizontal: 16,
                                    paddingVertical: 4,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                {documentRequest ? (
                                    <ActivityIndicator size="small" color="#6c757d80" />
                                ) : (
                                    <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
                                )}
                            </TouchableOpacity>
                        ) : (<></>)}
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowStatistics(!showStatistics)}
                        style={{
                            backgroundColor: "#28a745",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <FormattedMessage id="projects.show.statistics">
                            {(msg) => (
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: "500",
                                        marginRight: 2,
                                    }}
                                >
                                    {msg}
                                </Text>
                            )}
                        </FormattedMessage>
                        <Ionicons
                            name={showStatistics ? "chevron-up" : "chevron-down"}
                            size={12}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
                {showStatistics && <DocumentsSatistic />}
                <Search
                    onSearch={value => { setSearch(value) }}
                    onPageChange={page => setCurrentPage(page)}
                    placeholder={"documents.filter.title"}
                />
                
                <ScrollView 
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {dataResponse.map((data, index) =>
                        <View key={index} style={styles.box}>
                            <View style={styles.box2}>
                                {data.name ? (<DocumentsIcon url={data.name} />) : (<></>)}
                                <View style={styles.boxtitle}>
                                    <TouchableOpacity onPress={() => (Platform.OS === 'android' ? fileDownloaderAndroid(data.id, data.name, 0) : fileDownloaderIIOS(data.id, data.name, 0))} >

                                        <Text style={styles.title}>
                                            {data.name}
                                        </Text>

                                    </TouchableOpacity>
                                    <Text style={{ fontWeight: '400', color: "#6c757d", }}>
                                        <FormatDateTime datevalue={data.date} type={2} />
                                    </Text>
                                    <Text style={styles.size}>
                                        <BytesToSize bytes={data.size} />
                                    </Text>
                                    <Text style={{ fontWeight: '400', color: "#6c757d", }}>{data.userFirstName} {data.userLastName}</Text>
                                </View>
                            </View>
                            {userPermissionCode > 1 && !isAdministrator ? (
                                <ModalMoreDocuments id={data.id} name={data.name} />
                            ) : (<></>)}
                        </View>
                    )}
                    {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
                    {documentCountState === 0 || dataLength ? (<Text style={globalStyles.dataLength}><FormattedMessage id="documents.list.noItems" /></Text>
                    ) : (
                        <Pagination
                            onPageChange={page => setCurrentPage(page)}
                            currentPage={pageIndex}
                            total={totalPages}
                        />
                    )}
                </ScrollView>

            </AppContainerClean>
        </>
    )
}

export default Documents
