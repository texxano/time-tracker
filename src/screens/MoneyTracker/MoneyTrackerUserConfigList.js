import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, Platform } from 'react-native';

// Redux 
import { useSelector } from "react-redux";
import http from '../../services/http'

// Components
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import InitialUser from "../../components/InitialUser";
import ModalUserSupervisor from "../../components/Modal/ModalUserSupervisor";

const MoneyTrackerUserConfigList = () => {
  const state = useSelector(state => state)
  const moneyTrackerState = state.moneyTracker

  // const failure = state.moneyTracker?.failure
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setRequestApi(true)
      http.get(`/moneytracker/users?PageSize=10${currentPage ? `&page=${currentPage}` : ''}${search ? `&search=${search}` : ''}`)
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
    getData()
  }, [currentPage, search, moneyTrackerState]);

  return (
    <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
      <View >
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}><FormattedMessage id="Users.Configurations.List" /></Text>
        {/* {isOwnerForRoot && dataDefaultModule ? (
        <Text className="d-flex align-items-center">
          <FormattedMessage id="Default.Vacation.Configurations" />
          <ModalModuleConfigurationsVacation dataModule={dataDefaultModule} /></Text>) : (<></>)} */}
      </View>
      <Search
        onSearch={value => { setSearch(value) }}
        onPageChange={page => setCurrentPage(page)}
        placeholder={"users.filter.title"}
      />
      <View>
        {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
        {dataResponse?.map((data, index) =>
          <>
            <View style={{ marginVertical: 5, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" }} key={index}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }} >
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                  <View><InitialUser FirstName={data.firstName} LastName={data.lastName} email={data.email} color={data.color} /></View>
                  <View style={{ paddingLeft: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: Platform.OS === 'ios' ? '500' : '400', }}>{data.firstName} {data.lastName}</Text>
                    <Text style={{ fontSize: 13 }}>{data.email}</Text>
                  </View>
                  {data.isSupervisor && <FontAwesome name="star" size={24} color="#ffca00" style={{ paddingLeft: 10 }} />}
                </View>
                <View >
                  <ModalUserSupervisor dataUser={data} type={"MoneyTracker"} />
                </View>
              </View>
            </View>
          </>
        )}
      </View>
      {dataLength ? (<Text style={{ paddingTop: 10 }}><FormattedMessage id="users.list.noItems" /> </Text>) : (<></>)}
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

export default MoneyTrackerUserConfigList
