import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Entypo } from '@expo/vector-icons';

// Redux 
import { useSelector } from "react-redux";
import http from '../../../services/http'
// Components
import Pagination from "../../../components/Pagination";
// import Search from "../../../../components/Search";
import ModalCUDShiftTemplate from "./CUDShiftTemplates";
import ItemShiftTemplate from "./ItemShiftTemplate";

import { modalStyle } from "../../../asset/style/components/modalStyle"

const ShiftTemplatesList = () => {

  const state = useSelector(state => state)
  const isAdministrator = state.userDataRole?.isAdministrator
  const trackingState = state.timeTracks
  const [dataResponse, setDataResponse] = useState([]);
  // const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [modalCreate, setModalCreate] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    if (!isAdministrator) {
      setRequestApi(true)
      http.get(`/timetracker/templates${currentPage ? `?page=${currentPage}` : ''}`,)
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
  }, [currentPage, isAdministrator, trackingState]);

  return (
      <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, flex: 1 }}>
      <ModalCUDShiftTemplate modal={modalCreate} setModal={setModalCreate} type={0} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, }}>
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}>
          <FormattedMessage id="Shift.Template" />
        </Text>
        <TouchableOpacity onPress={() => setModalCreate(true)} style={{ flexDirection: "row", alignItems: "center" }} >
          <Text><FormattedMessage id="Create.Shift.Template" /> </Text>
          <View style={modalStyle.btnCircle}><Entypo name="plus" size={24} color="#6c757d" /></View>
        </TouchableOpacity>
      </View>
      {/* <Search
        onSearch={value => { setSearch(value) }}
        onPageChange={page => setCurrentPage(page)}
        placeholder={"users.filter.title"}
      /> */}
      {requestApi ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6c757d" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {dataResponse?.map((data, index) =>
            <View key={index}>
              <ItemShiftTemplate data={data} />
            </View>
          )}
          {dataLength ? (
            <Text style={{ paddingTop: 10 }}>
              <FormattedMessage id="shift.templete.list.noItems" />
            </Text>
          ) : (
            <></>
          )}
   
        </ScrollView>
      )}
             {!dataLength ? (
            <View style={{ width: "80%" }}>
              <Pagination
                onPageChange={page => setCurrentPage(page)}
                currentPage={pageIndex}
                total={totalPages}
                height={10}
              />
            </View>
          ) : (
            <></>
          )}
    </View>
  );
};

export default ShiftTemplatesList;
