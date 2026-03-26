import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { NavigationService } from "../../navigator";

// Redux
import http from "../../services/http";

import {
  notificationsCount,
  deleteAllNotifications,
} from "../../redux/actions/Notifications/notifications.actions";
// Redux

// Components
import Search from "../../components/Search";
import Pagination from "../../components/Pagination";
import ItemNotification from "./components/ItemNotification";
import ModalDelete from "../../components/Modal/ModalDelete";
import AppContainerClean from "../../components/AppContainerClean";
import { px } from "../../asset/style/utilities.style";
// Components

const Notifications = (route) => {
  const { location } = route.navigation.state.params;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const notificationsState = state.notifications;
  // const notificationsCountState = state.notificationsCount.count

  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [pagination, setpagination] = useState(0);

  useEffect(() => {
    const getData = async () => {
      if (notificationsState) {
        http
          .get(`/notifications?page=${currentPage}&search=${search}`)
          .then((data) => {
            setRequestApi(false);
            if (search.length === 0) {
              dispatch(notificationsCount(data.totalItems));
            }
            setDataLength(data.list.length === 0);
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            setDataResponse(data.list);
          });
      }
    };
    getData();
  }, [currentPage, search, notificationsState]);


  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [dataLength, currentPage]);

  const handleDeletedAll = () => {
    dispatch(deleteAllNotifications());
  };

  return (
    <AppContainerClean location={"Dashboard"} pagination={pagination}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 37,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            <FormattedMessage id="Notifications" />{" "}
          </Text>

          {!dataLength ? (
            <ModalDelete
              description={"delete.all.notifications"}
              deleted={handleDeletedAll}
              type={0}
            />
          ) : (
            <></>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate(location || "Dashboard", {
              location: location,
            });
          }}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
        </TouchableOpacity>
      </View>
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={"notifications.filter.title"}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {dataResponse.map((data, index) => (
          <ItemNotification key={index} data={data} />
        ))}
        {requestApi ? (
          <ActivityIndicator size="large" color="#6c757d" />
        ) : (
          <></>
        )}
        {!dataLength ? (
          <View style={{ width: "80%" }}>
            <Pagination
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={pageIndex}
              total={totalPages}
            />
          </View>
        ) : (
          <></>
        )}
      </ScrollView>
    </AppContainerClean>
  );
};

export default Notifications;
