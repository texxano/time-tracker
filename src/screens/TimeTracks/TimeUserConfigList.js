import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { FontAwesome } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, ActivityIndicator, Platform, ScrollView } from "react-native";
import { NavigationService } from "../../navigator";
import { AntDesign } from "@expo/vector-icons";
// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";

// Components
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import InitialUser from "../../components/InitialUser";
import ModalUserSupervisorTime from "./components/ModalUserSupervisorTime";
import { userConfigStyles } from "../../asset/style/userConfigStyles";

const TimeUserConfigList = () => {
  const state = useSelector((state) => state);
  const isAdministrator = state.userDataRole?.isAdministrator;
  const trackingState = state.timeTracks;
  const timeTracksRequest = state.timeTracks.timeTracksRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    if (!isAdministrator && !timeTracksRequest) {
      setRequestApi(true);
      http
        .get(
          `/timetracker/users?PageSize=14${currentPage ? `&page=${currentPage}` : ""
          }${search ? `&search=${search}` : ""}`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        })
        .catch(() => { });

      //  http.get(`/timetracker/users/me`)
      //   .then((data) => {
      //     setDataDefaultModule(data);
      //   })
    }
  }, [

    currentPage,
    search,
    isAdministrator,
    trackingState,
    timeTracksRequest,
  ]);

  return (
    <View style={userConfigStyles.container}>
      <View>
        <Text style={userConfigStyles.title}>
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
          {dataResponse?.map((data, index) => (
            <React.Fragment key={data.userId || index}>
              <View style={userConfigStyles.itemContainer}>
                <View style={userConfigStyles.userDetails}>
                  <View style={userConfigStyles.userInfo}>
                    <View><InitialUser FirstName={data.firstName} LastName={data.lastName} email={data.email} color={data.color} /></View>
                    <View style={{ paddingLeft: 10 }}>
                      <Text style={{ fontSize: 18, fontWeight: Platform.OS === 'ios' ? '500' : '400', }}>{data.firstName} {data.lastName}</Text>
                      <Text style={{ fontSize: 13 }}>{data.email}</Text>
                    </View>
                    {data.isSupervisor && <FontAwesome name="star" size={24} color="#ffca00" style={{ paddingLeft: 10 }} />}
                  </View>
                  <View>
                    <ModalUserSupervisorTime dataUser={data} type={"Time"} />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate("Time", {
                      locationActive: "1",
                      id: data.userId,
                      userData: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        color: data.color,
                      },
                    });
                  }}
                  style={userConfigStyles.itemFeatureUserTime}
                >
                  <Text style={[userConfigStyles.buttonText, { paddingVertical: 2 }]}>
                    <FormattedMessage id="Shift.Applied" />{" "}
                  </Text>
                  <AntDesign name="arrowright" size={20} color="#6c757d" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate("Time", {
                      locationActive: "3",
                      id: data.userId,
                      userData: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        color: data.color,
                      },
                    });
                  }}
                  style={userConfigStyles.itemFeatureUserTime}
                >
                  <Text style={[userConfigStyles.buttonText, { paddingVertical: 2 }]}>
                    <FormattedMessage id="Time.Tracks" />{" "}
                  </Text>
                  <AntDesign name="arrowright" size={20} color="#6c757d" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate("Time", {
                      locationActive: "5",
                      id: data.userId,
                      userData: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        color: data.color,
                      },
                    });
                  }}
                  style={userConfigStyles.itemFeatureUserTime}
                >
                  <Text style={[userConfigStyles.buttonText, { paddingVertical: 2 }]}>
                    <FormattedMessage id="Time.Sheet" />{" "}
                  </Text>
                  <AntDesign name="arrowright" size={20} color="#6c757d" />
                </TouchableOpacity>

                {data.isChargingPerHour ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        NavigationService.navigate("Time", {
                          locationActive: "4",
                          id: data.userId,
                          userData: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            color: data.color,
                          },
                        });
                      }}
                      style={userConfigStyles.itemFeatureUserTime}
                    >
                      <Text
                        style={[
                          userConfigStyles.buttonText,
                          { paddingVertical: 2 },
                        ]}
                      >
                        <FormattedMessage id="User.Project.Charget" />{" "}
                      </Text>
                      <AntDesign name="arrowright" size={20} color="#6c757d" />
                    </TouchableOpacity>
                    <View
                      style={[userConfigStyles.priceInfo, { paddingVertical: 2 }]}
                    >
                      <Text style={userConfigStyles.buttonText}>
                        <FormattedMessage id="price.per.hour" />{" "}
                      </Text>
                      <Text style={{ fontSize: 17, fontWeight: "600" }}>
                        {data.pricePerHour} {data.currencyCode}{" "}
                      </Text>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </View>
            </React.Fragment>
          ))}
          {dataLength ? (
            <Text style={{ paddingTop: 10 }}>
              <FormattedMessage id="users.list.noItems" />{" "}
            </Text>
          ) : (
            <></>
          )}

        </ScrollView>
      )}
                {!dataLength ? (
            <View style={{ width: "80%" }}>
              <Pagination
                onPageChange={(page) => setCurrentPage(page)}
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

export default TimeUserConfigList;
