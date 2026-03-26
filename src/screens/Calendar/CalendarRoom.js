/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from "react-redux";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Feather, Entypo, AntDesign } from '@expo/vector-icons';

import http from "../../services/http";
import { deleteByIdCalendarRoom } from '../../redux/actions/Calender/calendarRoom.actions'

// Components
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import CreateUpdateRoom from "./components/CreateUpdateRoom";
import { modalStyle } from '../../asset/style/components/modalStyle'
import ModalDelete2 from "../../components/Modal/ModalDelete2";

// import ItemRoom from "./components/ItemRoom";
// import CreateUpdateRoom from "./components/CreateUpdateRoom";

// Components

const CalendarRoom = ({ }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const calendarState = state.calendar
    const calendarRequest = state.calendar.request

    const [modalCreate, setModalCreate] = useState(false);
    const [modalUpdate, setModalUpdate] = useState(false);
    const [data, setData] = useState({});
    const [modalDelete, setModalDelete] = useState(false);
    const [id, setId] = useState("");

    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState("");
    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(null);
    const [requestApi, setRequestApi] = useState(true);
    const [dataLength, setDataLength] = useState(false);

    useEffect(() => {
        if (!calendarRequest) {
            setRequestApi(true)
            http.get(`/calendarm/rooms${currentPage ? `&page=${currentPage}` : ''}${search ? `&search=${search}` : ''}`)
                .then((data) => {
                    setRequestApi(false)
                    setDataResponse(data.list);
                    setPageIndex(data.pageIndex)
                    setTotalPages(data.totalPages)
                    setDataLength(data.list.length === 0);
                })
                .catch(() => {
                })

        }

    }, [calendarState]);

    const handleOpenModalUpdate = (val) => {
        setData(val)
        setModalUpdate(true)
    };
    const handleOpenModalDelete = (val) => {
        setId(val)
        setModalDelete(true)
    };

    const handleDeletedById = (id) => {
        dispatch(deleteByIdCalendarRoom(id));
    };
    const handleCloseModal = () => {
        setModalCreate(false)
        setModalUpdate(false)
        setModalDelete(false)
        setData({})
        setId('')
    }

    useEffect(() => {
        if (calendarState) {
            handleCloseModal()
        }
    }, [calendarState]);

    return (
        <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
            <CreateUpdateRoom
                setModal={setModalCreate}
                modal={modalCreate}
            />
            <CreateUpdateRoom
                setModal={setModalUpdate}
                modal={modalUpdate}
                data={data}
            />
            <ModalDelete2
                id={id}
                description={"calendar.delete.room.description.this"}
                deleted={handleDeletedById}
                modalDelete={modalDelete}
                setModalDelete={setModalDelete}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 10 }} >
                <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}><FormattedMessage id="Calendar.Room.List" /></Text>

                <TouchableOpacity onPress={() => setModalCreate(true)} style={{ flexDirection: "row", alignItems: "center" }} >
                    <Text><FormattedMessage id="create.new.room" /> </Text>
                    <View style={modalStyle.btnCircle}><Entypo name="plus" size={24} color="#6c757d" /></View>
                </TouchableOpacity>

            </View>
            <Search
                onSearch={value => { setSearch(value) }}
                onPageChange={page => setCurrentPage(page)}
                placeholder={"Calendar.Room.List"}
            />
            <View>

                {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
                <FlatList
                    data={dataResponse}
                    renderItem={({ item, index }) => {

                        return (
                            <View key={index} >
                                <View style={{ marginVertical: 5, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" }} key={index}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                                        <View >
                                            <View>
                                                <Text style={{ fontSize: 20 }} >{item.name} </Text>
                                                <Text style={{ fontSize: 16, paddingVertical: 8 }}>{item.description}</Text>
                                                <Text style={{ fontSize: 18, }}><FormattedMessage id="create.new.room.capacity" />:{" "}{item.capacity}</Text>

                                                <Text><FormattedMessage id="create.new.room.enabled" />:{" "}{item.enabled ? 'enabled' : 'disable'}</Text>
                                            </View>
                                        </View>
                                        <View >
                                            <TouchableOpacity onPress={() => handleOpenModalUpdate(item)}  >
                                                <View style={modalStyle.btnCircle}>
                                                    <Feather name="edit" size={20} color="#6c757d" />
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleOpenModalDelete(item.id)}  >
                                                <View style={[modalStyle.btnCircle, { marginTop: 10 }]}>
                                                    <AntDesign name="delete" size={20} color="#6c757d" />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )
                    }}
                    keyExtractor={item => item.name}
                />
            </View>
            {dataLength ? (<Text style={{ paddingTop: 10 }}><FormattedMessage id="room.list.noItems" /> </Text>) : (<></>)}
            {!dataLength ? (
                <Pagination
                    onPageChange={page => setCurrentPage(page)}
                    currentPage={pageIndex}
                    total={totalPages}
                />
            ) : (<></>)}
        </View >
    )
}

export default CalendarRoom
