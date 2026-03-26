import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';

// Redux 
import { useSelector } from "react-redux";
import http from '../../../services/http'

import { dateFormat } from '../../../utils/dateFormat'

// Components
import FormatDateTime from '../../../components/FormatDateTime';
import Pagination from "../../../components/Pagination";
import ModalDelete2 from "../../../components/Modal/ModalDelete2";
import InitialUser from "../../../components/InitialUser";
import Applyshifts from "./Applyshifts";

import { modalStyle } from "../../../asset/style/components/modalStyle"
import { globalStyles } from "../../../asset/style/globalStyles";
const windowWidth = Dimensions.get("window").width;

const ShiftUser = ({ id, userData }) => {

  const state = useSelector(state => state)
  const trackingState = state.timeTracks
  const timeTrackerIsSupervisor = state.userDataModule?.timeTrackerIsSupervisor

  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const [onNavigateStart, setOnNavigateStart] = useState(new Date(firstDayOfMonth));
  const [onNavigateStop, setOnNavigateStop] = useState(new Date(lastDayOfMonth));
  const [requestApi, setRequestApi] = useState(true);

  const getApplyShift = (start, end) => {
    if (start && end) {
      setOnNavigateStart(new Date(start));
      setOnNavigateStop(new Date(end));
      setRequestApi(true);
      let path1 = `/timetracker/shifts/user/${id}`
      let path2 = `/timetracker/shifts/me`

      http.get(`${id ? path1 : path2}?From=${dateFormat(onNavigateStart)}&To=${dateFormat(onNavigateStop)}&pageSize=35${currentPage ? `&page=${currentPage}` : ''}`,)
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
  }

  useEffect(() => {
    const getData = async () => {
      setDataResponse([])
      getApplyShift(onNavigateStart, onNavigateStop);
    };
    getData();
  }, [currentPage, trackingState]);

  const onPressDate = (type) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        type ? prevDate.getMonth() + 1 : prevDate.getMonth() - 1,
        1
      );
      setOnNavigateStart(
        new Date(newDate.getFullYear(), newDate.getMonth(), 1)
      );
      setOnNavigateStop(
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)
      );
      getApplyShift(
        newDate,
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)
      );
      return newDate;
    });
  };

  const handleDeletedById = (id) => {
    dispatch(deleteByIdUserShift(id));
  };
  const handleDeletedAll = (id) => {
    dispatch(deleteAllUserShifts(id));
  };

  const [modalDelete, setModalDelete] = useState(false);
  const [modalDeleteAll, setModalDeleteAll] = useState(false);
  const [idShitDate, setidShitDate] = useState('');

  const handleOpenModal = (id) => {
    setidShitDate(id)
    setModalDelete(true)
  };

  function addLeadingZeros(num) {
    return String(num).padStart(2, '0');
  }

  return (
    <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}>
          {!id ? (<FormattedMessage id="Shift.Template.Personal" />) : (<FormattedMessage id="Shift.Template" />)}
        </Text>
      </View>
      <>
      </>
      {userData?.firstName ?
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
            <InitialUser FirstName={userData?.firstName} LastName={userData?.lastName} email={userData?.email} color={userData?.color} />
            <View style={{ paddingLeft: 10 }}>
              <Text style={{ fontSize: 17, fontWeight: '500' }}>{userData?.firstName} {userData?.lastName}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500' }}>{userData?.email}</Text>
            </View>
          </View>
          <Applyshifts userId={id} />
        </View >
        : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, marginBottom: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#ccc", }}>
        {!dataLength && timeTrackerIsSupervisor ? (
          <View style={modalStyle.modalViewFlex}>
            <Text style={{ fontSize: 17, marginRight: 10 }}>
              <FormattedMessage id="Applied.Shift.Template" />
            </Text>
            <TouchableOpacity style={modalStyle.btnCircle} onPress={() => setModalDeleteAll(true)}>
              <MaterialIcons name="delete" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        ) : (<></>)}
      </View>
      <View style={{ marginBottom: 10, backgroundColor: "#fff", borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => onPressDate(0)} style={[globalStyles.btnCircle, { marginLeft: 0, borderTopEndRadius: 0, borderBottomEndRadius: 0 }]} disabled={requestApi} >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}>
            {'<'} Previous
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: windowWidth < 430 ? 15 : 17 }}><FormatDateTime datevalue={onNavigateStart} type={1} /> - <FormatDateTime datevalue={onNavigateStop} type={1} /> </Text>
        <TouchableOpacity onPress={() => onPressDate(1)} style={[globalStyles.btnCircle, { margin: 0, borderTopStartRadius: 0, borderBottomStartRadius: 0 }]} disabled={requestApi}>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}>
            Next {'>'}
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <View>
          {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
          {dataResponse?.sort((a, b) => new Date(a.shiftDate) - new Date(b.shiftDate))?.map((data, index) =>
            <View key={index} style={{ marginVertical: 5, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, }}>
                <Text style={{ fontSize: 20 }}><FormatDateTime datevalue={data.shiftDate} type={1} /></Text>
                <TouchableOpacity onPress={() => handleOpenModal(data.id)} style={modalStyle.btnCircle} >
                  <MaterialIcons name="delete" size={20} color="#6c757d" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", padding: 10 }}>
                <Text style={{ fontSize: 20 }}>{addLeadingZeros(data.fromHour)}:{addLeadingZeros(data.fromMin)} - {addLeadingZeros(data.toHour)}:{addLeadingZeros(data.toMin)}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      {dataLength ? (<Text style={{ paddingTop: 10 }}><FormattedMessage id="applied.shift.list.noItems" /> </Text>) : (<></>)}
      {!dataLength ? (
        <Pagination
          onPageChange={page => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
        />
      ) : (<></>)}
      <ModalDelete2 id={idShitDate}
        description={"applied.time.shift.templete.delete.modal.description.this"}
        deleted={handleDeletedById}
        modalDelete={modalDelete} setModalDelete={setModalDelete}
      />
      <ModalDelete2 id={id}
        description={"applied.time.shift.templete.delete.all.modal.description.this"}
        deleted={handleDeletedAll}
        modalDelete={modalDeleteAll} setModalDelete={setModalDeleteAll}
      />
    </View >
  )
}

export default ShiftUser
