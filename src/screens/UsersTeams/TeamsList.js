// /* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, ScrollView } from "react-native";

import { FormattedMessage } from "react-intl";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { taskCount } from "../../redux/actions/Task/task.actions";

// Redux
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import ItemTeams from "./components/ItemTeams";

const TeamsList = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const teamsRequest = state.teams.teamsRequest;

  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamsRequest) {
      setRequestApi(true);
      http
        .get(
          `/teams${currentPage ? `?page=${currentPage}` : ""}${
            search ? `&search=${search}` : ""
          }`
        )
        .then((data) => {
          setError(null);
          if (data.list) {
            setRequestApi(false);
            setDataResponse(data.list);
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            setDataLength(data.list.length === 0);
            dispatch(taskCount(data.list.length));
          } else {
            setRequestApi(false);
            setDataResponse([]);
            setDataLength(true);
            dispatch(taskCount(0));
          }
        })
        .catch((error) => {
          console.error("Error fetching teams:", error);
          setRequestApi(false);
          setDataResponse([]);
          setDataLength(true);
          setError("Failed to load teams. Please try again later.");
          dispatch(taskCount(0));
        });
    }
  }, [search, currentPage, teamsRequest]);

  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 15,
        borderRadius: 5,
        height: "auto",
      }}
    >
      {/* <ModalCUDTask
                modal={modalCreate}
                setModal={setModalCreate}
                type={0}
            /> */}
      {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}>
                    <FormattedMessage id="shotgun.task.title" />
                </Text>
                {shotgunIsSupervisor ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }} >
                        <Text><FormattedMessage id="Shotgun.Task.Create" /> </Text>
                        <TouchableOpacity onPress={() => setModalCreate(true)} style={modalStyle.btnCircle}><Entypo name="plus" size={24} color="#6c757d" /></TouchableOpacity>
                    </View>
                ) : (<></>)}
            </View> */}
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={"teams.filter.title"}
      />
      <ScrollView
        style={{ maxHeight: 500 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
        {dataResponse?.map((data, index) => (
          <View key={data.id ? `team-${data.id}` : `team-index-${index}`}>
            <ItemTeams data={data} />
          </View>
        ))}
        {error ? (
          <Text style={{ paddingTop: 10, color: "#dc3545", textAlign: "center" }}>
            {error}
          </Text>
        ) : dataLength ? (
          <Text style={{ paddingTop: 10 }}>
            <FormattedMessage id="teams.noItems" />{" "}
          </Text>
        ) : (
          <></>
        )}
        {!dataLength ? (
          <Pagination
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={pageIndex}
            total={totalPages}
          />
        ) : (
          <></>
        )}
      </ScrollView>
    </View>
  );
};

export default TeamsList;
