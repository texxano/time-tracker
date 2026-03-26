import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { FontAwesome } from '@expo/vector-icons';

// Redux 
import { useSelector, useDispatch } from "react-redux";
import http from '../../services/http'
import { updateReceiveNotificationsDevice, deleteByIdDevice, deleteAllDevice } from '../../redux/actions/Notifications/devices.actions'
// Redux 

// Components
import HeaderProfile from './components/HeaderProfile'
import Search from "../../components/Search";
import Pagination from "../../components/Pagination";
import ModalDelete from "../../components/Modal/ModalDelete"
// Components
import { profileStyle } from '../../asset/style/Profile/profileStyle'
import { globalStyles } from "../../asset/style/globalStyles"
import AppContainerClean from "../../components/AppContainerClean";

const Devices = () => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)

    const devices = state.devices

    const [devicesData, setDevicesData] = useState([]);
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(true);
    const [search, setSearch] = useState("");
    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [checkTokenExp, setcheckTokenExp] = useState(0);
    const [pagination, setpagination] = useState(0);

    useEffect(() => {
        const getData = async () => {
            http.get(`/devices?page=${currentPage}&search=${search}`,)
                .then((data) => {
                    setDevicesData(data.list)
                    setPageIndex(data.pageIndex)
                    setTotalPages(data.totalPages)
                    setRequestApi(false)
                    setDataLength(data.list.length === 0);
                })
        }
        getData()
    }, [ devices, currentPage, search]);

    useEffect(() => {
        if (dataLength && currentPage > 1) {
            setCurrentPage(1)
        }
    }, [dataLength, currentPage]);

    const handleUpdateDeviceReceive = (id, receiveNotifications) => {
        const payload = {
            'id': id,
            'receiveNotifications': receiveNotifications
        };
        dispatch(updateReceiveNotificationsDevice(payload));
    }
    const handleDeletedById = (id) => {
        dispatch(deleteByIdDevice(id));
    };
    const handleDeletedAll = () => {
        dispatch(deleteAllDevice());
    }

    return (
        <AppContainerClean location={'Profile'} pagination={pagination} >
            <HeaderProfile location={'Devices'} />
            <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
            <View style={{ flexDirection: "row", alignItems: "center", minHeight: 37 }}>
                <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}>
                    <FormattedMessage id="Devices" />{" "}
                </Text>
                {!dataLength ? (
                    <ModalDelete
                        description={"devices.delete.modal.title"}
                        checkTokenExpModal={e => setcheckTokenExp(e)}
                        deleted={handleDeletedAll}
                        type={0}
                    />
                ) : (<></>)}
            </View>
            <Search
                onSearch={value => { setSearch(value) }}
                onPageChange={page => setCurrentPage(page)}
                placeholder={"devices.filter.title"}
            />
            {devicesData.map((data, index) =>
                <View key={index} style={profileStyle.boxDevices}>
                    <View style={profileStyle.box2}>
                        <View style={profileStyle.boxtitle}>
                            <Text style={profileStyle.titleDevices}>
                                {data.name}
                            </Text>
                            <Text>
                                {data.serialNumber}
                            </Text>
                        </View>
                    </View>

                    <View style={profileStyle.box2}>
                        {data.receiveNotifications === true ? (
                            <TouchableOpacity onPress={() => handleUpdateDeviceReceive(data.id, false)} style={[globalStyles.btnCircle, {marginRight: 20, padding:5}]}>
                                {devices.dataDevice !== data.id ? (<FontAwesome name="bell" size={20} color="#6c757d" />) : (<ActivityIndicator size="small" color="#2196F3" />)}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => handleUpdateDeviceReceive(data.id, true)} style={[globalStyles.btnCircle, {marginRight: 20,padding:5 }]}>
                                {devices.dataDevice !== data.id ? (<FontAwesome name="bell-slash" size={20} color="#6c757d" />) : (<ActivityIndicator size="small" color="#2196F3" />)}
                            </TouchableOpacity>
                        )}
                        {devices.data !== data.id ? (
                            <ModalDelete
                                id={data.id}
                                description={"device.delete.modal.title"}
                                checkTokenExpModal={e => setcheckTokenExp(e)}
                                deleted={handleDeletedById}
                                type={0}
                            />
                        ) : (
                            <TouchableOpacity style={{ backgroundColor: '#dc3545', borderRadius: 8, padding: 5, alignItems: "center" }}>
                                <ActivityIndicator size="small" color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
            {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
            {dataLength ? (<Text style={profileStyle.dataLength}><FormattedMessage id="devices.list.noItems" /></Text>
            ) : (
                <Pagination
                    onPageChange={page => setCurrentPage(page)}
                    currentPage={pageIndex}
                    total={totalPages}
                    checkTokenExpPagination={e => setpagination(e)}
                />
            )}
            </View>
        </AppContainerClean>
    )
}

export default Devices
