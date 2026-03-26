import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Text, View, ActivityIndicator, FlatList } from "react-native";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { deleteAllTimeTrack } from "../../redux/actions/TimeTracks/timeTracks.actions";
// Redux

// Components
import Pagination from "../../components/Pagination";
import InitialUser from "../../components/InitialUser";
import ModalDelete from "../../components/Modal/ModalDelete";
import ModalReport from "../../components/Modal/ModalReport";
import ItemTimeTracks from "./components/ItemTimeTracks";
// Components
// import { globalStyles } from "../../../asset/style/globalStyles";
import { styles } from "./TimeTracks.Styles";

const TimeTracksList = ({ userId, userData }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const trackingState = state.timeTracks.data;
  const timeTracksRequest = state.timeTracks.timeTracksRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const reportsState = state.reports.data;
  const [requestApi, setRequestApi] = useState(true);
  const [dataLength, setDataLength] = useState(false);

  useEffect(() => {
    if (!timeTracksRequest) {
      setRequestApi(true);
      let path1 = `/timetracker/tracks/user/${userId}`;
      let path2 = `/timetracker/tracks`;
      http
        .get(
          `${userId ? path1 : path2}${
            currentPage ? `?page=${currentPage}` : ""
          }`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        });
    }
  }, [

    currentPage,
    trackingState,
    timeTracksRequest,
    userId,
  ]);

  const handleDeletedAll = () => {
    dispatch(deleteAllTimeTrack());
  };
  const [modalGetReport, setModalGetReport] = useState(false);

  useEffect(() => {
    if (reportsState?.date) {
      setModalGetReport(false);
    }
  }, [reportsState]);

  return (
    <>
      <View
        style={{
          backgroundColor: "#ebf0f3",
          padding: 15,
          borderRadius: 5,
          height: "auto",
        }}
      >
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            <FormattedMessage id="Time.Tracks" />{" "}
          </Text>
          {!userId && dataResponse?.length ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ModalReport
                reportFor={1}
                modalGetReport={modalGetReport}
                setModalGetReport={setModalGetReport}
              />
              {dataResponse.length ? (
                <View>
                  <ModalDelete
                    description={"timeLogs.delete.modal.description"}
                    deleted={handleDeletedAll}

                    type={0}
                  />
                </View>
              ) : (
                <></>
              )}
            </View>
          ) : (
            <></>
          )}
        </View>
        {userData?.firstName ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <InitialUser
                FirstName={userData?.firstName}
                LastName={userData?.lastName}
                email={userData?.email}
                color={userData?.color}
              />
              <View style={{ paddingLeft: 17 }}>
                <Text style={{ fontSize: 17, fontWeight: "500" }}>
                  {userData?.firstName} {userData?.lastName}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "500" }}>
                  {userData?.email}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        <View>
          {requestApi ? (
            <ActivityIndicator size="large" color="#6c757d" />
          ) : (
            <></>
          )}
          <FlatList
            data={dataResponse}
            renderItem={({ item, index }) => {
              return (
                <View key={index}>
                  <ItemTimeTracks data={item} userId={userId} />
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
          />
          {dataLength ? (
            <Text style={styles.dataLength}>
              <FormattedMessage id="time.list.noItems" />
            </Text>
          ) : (
            <></>
          )}
          <Pagination
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={pageIndex}
            total={totalPages}
          />
        </View>
      </View>
    </>
  );
};

export default TimeTracksList;
