import React, { useEffect, useState } from "react";

import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons, } from '@expo/vector-icons';
import { FormattedMessage } from 'react-intl';

// Redux 
import { useDispatch, useSelector } from "react-redux";

import http from '../../services/http'
import { userCount } from "../../redux/actions/UsersTeams/user.actions"
import { lockAllUser, unlockAllUser, } from "../../redux/actions/UsersTeams/user.actions"
// Redux 

// Components
import HeaderProject from "./components/HeaderProject";
import ModalEditUser from "../UsersTeams/components/ModalEditUser";
import ModalMoreEditUser from "../UsersTeams/components/ModalMoreEditUser";
import ModalRegisterUser from "../UsersTeams/components/ModalRegisterUser";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import ModalReport from "../../components/Modal/ModalReport";
// Components
import { styles } from "../../asset/style/Project/document"
import { globalStyles } from "../../asset/style/globalStyles"
import AppContainerClean from "../../components/AppContainerClean";

const Users = (route) => {
    const { projectId, parentId, permissionCode } = route.navigation.state.params

    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const userIdState = state.userData.userId
    const isAdministrator = state.userDataRole?.isAdministrator
    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState("");
    const user = state.user
    const userdelete = state.user.data
    const userCountState = state.userCount.count

    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(null);
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(true);
    const [checkTokenExp, setcheckTokenExp] = useState(0);
    const [pagination, setpagination] = useState(0);
    const [notAuthorized, setNotAuthorized] = useState(false)

    useEffect(() => {
        const getData = async () => {

            setDataResponse([]);
            if (user || userdelete) {
                http.get(`/users?rootId=${projectId}${currentPage ? `&page=${currentPage}` : ''}${search ? `&search=${search}` : ''}`)
                    .then((data) => {
                        setRequestApi(false)
                        if (search.length === 0) {
                            dispatch(userCount(data.totalItems))
                        }
                        setPageIndex(data.pageIndex)
                        setTotalPages(data.totalPages)
                        setDataResponse(data.list);
                        setDataLength(data.list.length === 0);
                        setNotAuthorized(false)
                    })
                    .catch(() => {
                        setRequestApi(false)
                        setNotAuthorized(true)
                    })
            }
        }
        getData();
    }, [ user, userdelete, projectId, currentPage, search]);
    useEffect(() => {
        if (dataLength && currentPage > 1) {
            setCurrentPage(-1)
        }
    }, [dataLength, currentPage]);
    const handleLockUser = () => {
        dispatch(lockAllUser(projectId));
    }
    const handleUnLockUser = () => {
        dispatch(unlockAllUser(projectId));
    }

    const lockStatus = dataResponse[0]?.isLocked
    return (
        <>
            <AppContainerClean location={'Users'} checkTokenExp={checkTokenExp} pagination={pagination} notAuthorized={notAuthorized} searchChange={search.length > 3 && search.length < 128}  >
                <HeaderProject location={'Users'} projectId={projectId} parentId={parentId} permissionCode={permissionCode} />
                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }} >
                    <View style={{ flexDirection: "row", alignItems: 'center', minHeight: 37 }}>
                        <Text style={globalStyles.screenTitle}>
                            <FormattedMessage id="projects.tabs.users.title" />
                        </Text>
                        <ModalRegisterUser rootId={projectId} setcheckTokenExp={e => setcheckTokenExp(e)} />
                        {isAdministrator ? (
                            <>
                                {!lockStatus ? (
                                    <TouchableOpacity style={globalStyles.btnCircle} onPress={() => handleLockUser()} ><MaterialIcons name="lock" size={24} color="#6c757d" /></TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={globalStyles.btnCircle} onPress={() => handleUnLockUser()} ><MaterialIcons name="lock-open" size={24} color="#6c757d" /></TouchableOpacity>)}
                            </>
                        ) : (<></>)}
                    </View>
                    {permissionCode === 3 && !isAdministrator ? (
                        <View>
                            <ModalReport projectId={projectId} reportFor={2} />
                        </View>
                    ) : (<></>)}
                </View>
                <Search
                    onSearch={value => { setSearch(value) }}
                    onPageChange={page => setCurrentPage(page)}
                    placeholder={"users.filter.title"}
                />
                <View>
                    {dataResponse.map((data, index) =>
                        <View key={index} style={styles.box}>
                            <View style={styles.box2}>
                                <ModalEditUser dataUser={data} setcheckTokenExp={e => setcheckTokenExp(e)} openFromModal={false} />
                                <Text>
                                    {data.isLocked ? (<MaterialIcons name="lock" size={20} color="#6c757d" />) : (<MaterialIcons name="lock-open" size={20} color="#6c757d" />)}
                                </Text>
                            </View>
                            <View>
                                {userIdState !== data.id ? (<ModalMoreEditUser dataUser={data} setcheckTokenExp={e => setcheckTokenExp(e)} />) : (<></>)}
                            </View>
                        </View>
                    )}
                    {userCountState === 0 || dataLength ? (<Text style={globalStyles.dataLength}><FormattedMessage id="users.list.noItems" /></Text>
                    ) : (
                        <Pagination
                            onPageChange={page => setCurrentPage(page)}
                            currentPage={pageIndex}
                            total={totalPages}
                            checkTokenExpPagination={e => setpagination(e)}
                        />
                    )}
                </View>
                {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
            </AppContainerClean>
        </>
    )
}

export default Users
