import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { FontAwesome } from "@expo/vector-icons";
import { Text, View, ActivityIndicator, ScrollView } from "react-native";

// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";

// Components
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import InitialUser from "../../components/InitialUser";
import ModalUsersConfigurationsVacation from "./components/ModalUsersConfigurationsVacation";
import { globalStyles } from "../../asset/style/globalStyles";
import { vacationStyles } from "./syles";
import flex from "../../asset/style/flex.style";

const VacationUserConfigList = () => {
  const state = useSelector((state) => state);
  const isAdministrator = state.userDataRole?.isAdministrator;
  const vacations = state.vacations;

  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [pagination, setpagination] = useState(0);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    if (!isAdministrator) {
      setRequestApi(true);
      http
        .get(
          `/vacations/users/${currentPage ? `?page=${currentPage}` : ""}${
            search ? `&search=${search}` : ""
          }`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        })
        .catch(() => {});
    }
  }, [currentPage, search, isAdministrator, vacations]);

  return (
    <View style={vacationStyles.container}>
      <View>
        <Text style={globalStyles.screenTitle}>
          <FormattedMessage id="Users.Configurations.List" />
        </Text>
      </View>
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={"users.filter.title"}
      />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {requestApi ? (
          <ActivityIndicator size="large" color="#6c757d" />
        ) : (
          <></>
        )}
        {dataResponse.map((data, index) => (
          <View
            style={[vacationStyles.listItemUser, { position: "relative" }]}
            key={index}
          >
            <View style={{ alignItems: "flex-start" }}>
              <View style={[vacationStyles.userInfoContainerUser]}>
                <View>
                  <InitialUser
                    FirstName={data.firstName}
                    LastName={data.lastName}
                    email={data.email}
                    color={data.color}
                  />
                </View>
                <View style={{ paddingLeft: 10 }}>
                  <Text style={[vacationStyles.userText, { width: "90%" }]}>
                    {data.firstName} {data.lastName}
                  </Text>
                  <Text style={{ fontSize: 13 }}>{data.email}</Text>
                </View>
              </View>
              <View
                style={[
                  flex.d_flex_center,
                  flex.flex_between,
                  { width: "100%" },
                ]}
              >
                <View>
                  <Text style={vacationStyles.textDetail}>
                    <FormattedMessage id="Available.Days.Off" />:{" "}
                    {data.availableDaysOff}
                  </Text>
                  <Text style={vacationStyles.textDetail}>
                    <FormattedMessage id="available.hours.Off" />:{" "}
                    {data.availableHoursOff}
                  </Text>
                  <Text style={vacationStyles.textDetail}>
                    <FormattedMessage id="hours.working.day" />:{" "}
                    {data.hoursPerWorkingDay}
                  </Text>
                </View>
                {data.isSupervisor && (
                  <FontAwesome
                    name="star"
                    size={24}
                    color="#ffca00"
                    style={{ paddingLeft: 10 }}
                  />
                )}
              </View>
            </View>
            <View style={{ position: "absolute", right: 10, top: 10 }}>
              <ModalUsersConfigurationsVacation dataUser={data} />
            </View>
          </View>
        ))}
      </ScrollView>
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="users.list.noItems" />{" "}
        </Text>
      ) : (
        <></>
      )}
      {!dataLength ? (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
          checkTokenExpPagination={(e) => setpagination(e)}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export default VacationUserConfigList;
