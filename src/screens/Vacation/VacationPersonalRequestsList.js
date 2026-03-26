import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
  AntDesign,
  FontAwesome,
} from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";

import { cancelRequestVacation } from "../../redux/actions/Vacation/vacationRequests.actions";
// Components
import Pagination from "../../components/Pagination";
import ModalRequestVacation from "./components/ModalRequestsVacation";
import FormatDateTime from "../../components/FormatDateTime";
import { globalStyles } from "../../asset/style/globalStyles";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { vacationStyles } from "./syles";
import flex from "../../asset/style/flex.style";
import { mb, ml, mr, mt, mx, my, p } from "../../asset/style/utilities.style";
import colors from "../../constants/Colors";
import ModalRequestSeekLeave from "./components/ModalRequestsSeekLeave";
import { isOpenSickLeave } from "./components/vacationCalendar/helper";
import { TextMain, TextMainSmallBold } from "../../components/Texts";
import ModalShowMessage from "../../components/Modal/ModalShowMessage";

import VacationApproval from "./components/vacationUserRequestList/VacationApproval";
import DocViewerModal from "../../components/Modal/DocViewerModal";

const windowHeight = Dimensions.get("window").height;

const VacationPersonalRequestsList = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const state = useSelector((state) => state);
  const vacations = state.vacations;

  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [pagination, setpagination] = useState(0);
  const [myVacationConfiguration, setMyVacationConfiguration] = useState({});
  const [requestApi, setRequestApi] = useState(true);
  const [teams, setTeams] = useState([]);

  const [isSickLeaveModalOpen, setSickLeaveModalOpen] = useState(false);
  const [sickLeaveId, setSickLeaveId] = useState(null);
  const [sickLeaveModalType, setSickLeaveModalType] = useState("start");

  const [canOpenNewRequest, setCanOpenNewRequest] = useState(false);
  const [serverError, setServerError] = useState(null);
  const year = new Date().getFullYear();
  const [webViewUri, setWebViewUri] = useState(null);
  const [showBlockedInfo, setShowBlockedInfo] = useState(false);

  const configureDeclinedTeam = (data) => {
    if (!data) return [];
    return data.map((item) => {
      if (!item.approvalPath || item.approvalPath.length === 0) return item;

      const declinedApproval = item.approvalPath.find(
        (p) => p.approved === false
      );
      const declinedTeam =
        declinedApproval?.assignmentTeamData?.teamName || null;

      return { ...item, declinedTeam };
    });
  };

  const fetchVacationRequests = () => {
    http
      .get(`/vacations/requests${currentPage ? `?page=${currentPage}` : ""}`)
      .then((data) => {
        if (data?.status === 500) {
          setServerError(data.statusText);
        }

        const rawList = Array.isArray(data?.list)
          ? data.list
          : Array.isArray(data)
          ? data
          : [];
        const filteredList = rawList.filter((request) => !request.isDeleted);

        setDataResponse(configureDeclinedTeam(filteredList));

        const hasOpenSickLeave =
          filteredList.filter((request) => isOpenSickLeave(request)).length > 0;
        setCanOpenNewRequest(hasOpenSickLeave);
        setPageIndex(data?.pageIndex ?? null);
        setTotalPages(data?.totalPages ?? null);
        setDataLength(filteredList.length === 0);
      })
      .catch((error) => {
        console.error("Error fetching vacation requests:", error);
        setServerError(
          error?.message || intl.formatMessage({ id: "common.error.generic" })
        );
      })
      .finally(() => {
        setRequestApi(false);
      });
  };

  useEffect(() => {
    const getData = () => {
      setRequestApi(true);
      fetchVacationRequests();
    };
    getData();
  }, [currentPage, vacations]);

  useEffect(() => {
    if (
      myVacationConfiguration.isTeamLeader ||
      myVacationConfiguration.isSupervisor
    ) {
      http.get(`/vacations/teams?pageSize=50`).then((data) => {
        setTeams(data.list);
      });
    }
  }, []);

  useEffect(() => {
    const getData = () => {
      http.get(`/vacations/users/me`).then((data) => {
        setMyVacationConfiguration(data);
      });
    };
    getData();
  }, [vacations]);

  const handleCancelRequestVacation = (id) => {
    setRequestApi(true);

    return dispatch(cancelRequestVacation(id))
      .then((response) => {
        setCurrentPage(1);
        fetchVacationRequests();
      })
      .catch((error) => {
        console.error('Error canceling vacation request:', error);
      })
      .finally(() => {
        setRequestApi(false);
      });
  };

  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(null);
    }
  }, [dataLength, currentPage]);

  const openSickLeaveModal = (type, id) => {
    setSickLeaveId(id);
    setSickLeaveModalType(type);
    setSickLeaveModalOpen(true);
  };

  const closeSickLeaveModal = () => {
    setSickLeaveModalOpen(false);
  };

  function calculateWorkingDays(requestedFrom) {
    const startDate = new Date(requestedFrom);
    if (isNaN(startDate)) throw new Error("Invalid date provided");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate < today ? startDate : today;
    const end = startDate > today ? startDate : today;

    const msPerDay = 86400 * 1000;
    const totalDays = Math.floor((end - start) / msPerDay) + 1;
    const fullWeeks = Math.floor(totalDays / 7);
    let workingDays = fullWeeks * 5;

    let remainingDays = totalDays % 7;
    let dayOfWeek = start.getDay();
    for (let i = 0; i < remainingDays; i++) {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      dayOfWeek = (dayOfWeek + 1) % 7;
    }
    return workingDays;
  }

  const openFile = async (id, vacationRequestDocumentResponse) => {
    try {
      setWebViewUri(vacationRequestDocumentResponse);
    } catch (error) {
      Alert.alert("Error", "Failed to download or open the file.");
      console.error(error);
    }
  };

  const handleDeleteRequestVacation = (id) => {
    // if (window.confirm(intl.formatMessage({ id: 'vacation.delete.confirm' }))) {

    http
      .delete(`/vacations/requests/${id}`)
      .then((data) => {
        setCurrentPage(1);
        fetchVacationRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const sortedRequests = useMemo(() => {
    if (!Array.isArray(dataResponse)) {
      return [];
    }
 
    return [...dataResponse].sort((a, b) => {
      const isOpenA = isOpenSickLeave(a);
      const isOpenB = isOpenSickLeave(b);

      if (isOpenA && !isOpenB) return -1;
      if (!isOpenA && isOpenB) return 1;
      return 0;
    });
  }, [dataResponse]);

  const shouldShowEmptyState = !requestApi && sortedRequests.length === 0;
  const handleBlockedInfo = () => setShowBlockedInfo((prev) => !prev);

  return (
    <>
      <DocViewerModal
        isOpen={webViewUri !== null}
        file={webViewUri}
        toggle={() => setWebViewUri(null)}
      />
      <ModalRequestSeekLeave
        isSickLeaveModalOpen={isSickLeaveModalOpen}
        type={sickLeaveModalType}
        sickLeaveId={sickLeaveId}
        toggleModal={closeSickLeaveModal}
      />
      <View style={vacationStyles.container}>
        <View
          style={[
            vacationStyles.headerRow,
            flex.d_flex_center,
            flex.d_flex_between,
          ]}
        >
          <View style={[flex.d_flex_center, { columnGap: 8 }]}>
            <Text style={[globalStyles.screenTitle, { fontSize: 18 }]}>
              <FormattedMessage id="My.Requests.Vacation.List" />{" "}
            </Text>

              <TouchableOpacity
                onPress={handleBlockedInfo}
                style={[flex.d_flex_center]}
              >
                <Feather name="info" size={24} color={colors.blue_200} />
              </TouchableOpacity>
         
          </View>
      
        </View>
        <View>
        <View style={[flex.d_flex_center, flex.flex_end, { columnGap: 10 }]}>
            <ModalRequestVacation
              myVacationConfiguration={myVacationConfiguration}
              disabled={canOpenNewRequest}
            />
            <TouchableOpacity
              disabled={canOpenNewRequest}
              onPress={() => {
                if (canOpenNewRequest) {
                  return;
                }
                setSickLeaveModalOpen(true);
              }}
              style={[
                modalStyle.btnVacation,
                canOpenNewRequest && styles.disabledButton,
              ]}
            >
              <FontAwesome name="heartbeat" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>
        {canOpenNewRequest && (
  
  <View style={[my[4], flex.d_flex_center, flex.flex_wrap]}>
  <TextMain isPlaintext text={"*"} customStyles={{ color: colors.warning_400 }} />
  <TextMain
    customStyles={[mx[3], { color: colors.warning_400 }]}
    numberOfLines={2}
    text="you.cannot.open.new.request.until.sick.leave.is.closed"
  />
</View>

        )}
        {showBlockedInfo && (
          <View style={[vacationStyles.ViewInfoDay, my[3]]}>
       <Text>
              <FormattedMessage id="Available.Days.Off" />:{" "}
              <Text style={{ color: "#28a745", marginInline: 10 }}>
                {myVacationConfiguration?.availableDaysOff}
              </Text>
            </Text>
            <Text>
              <FormattedMessage id="available.hours.Off" />:{" "}
              <Text style={{ color: "#28a745", marginInline: 10 }}>
                {myVacationConfiguration?.availableHoursOff}
              </Text>
            </Text>
            <View style={[flex.d_flex_center, flex.flex_start]}>
              <Text>
                <FormattedMessage id="hours.working.day" />:{" "}
                <Text style={{ color: "#28a745", marginInline: 10 }}>
                  {myVacationConfiguration?.hoursPerWorkingDay}
                </Text>
              </Text>
              <MaterialCommunityIcons
                name="hand-pointing-right"
                style={[mx[4]]}
                size={25}
              />
              <Text>{year}</Text>
            </View>
            <Text>
              <FormattedMessage id="requested.Days.Off" />:{" "}
              <Text style={{ color: colors.error_100, marginInline: 10 }}>
                {myVacationConfiguration?.requestedDaysOff || 0}
              </Text>
            </Text>
            <Text>
              <FormattedMessage id="requested.Hours.Off" />:{" "}
              <Text style={{ color: colors.error_100, marginInline: 10 }}>
                {myVacationConfiguration?.requestedHoursOff || 0}
              </Text>
            </Text>
          </View>
        )}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20}}
        >
          {requestApi && (
            <ActivityIndicator size="large" color="#6c757d" />
          )}
          <ModalShowMessage
            message={serverError}
            isPlaintext
            showModal={serverError !== null}
            close={() => setServerError(null)}
          />
          {sortedRequests.map((data, index) => (
              <View
                style={{
                  marginVertical: 5,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "#fff",
                }}
                key={data.id ? `vacation-${data.id}` : `vacation-index-${index}`}
              >
                <View style={[vacationStyles.headerRow, { padding: 10 }]}>
                  <View
                    style={{
                      backgroundColor: "#ebf0f3",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    {data.requestType !== 2 && (
                      <FontAwesome5
                        name="umbrella-beach"
                        size={24}
                        color="#6c757d"
                      />
                    )}
                    {data.requestType === 2 && (
                      <FontAwesome name="heartbeat" size={24} color="#6c757d" />
                    )}
                  </View>

                  {data.requestType === 0 || data.requestType === 2 ? (
                    <>
                      <View style={{ padding: 10 }}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialCommunityIcons
                            name="calendar"
                            size={24}
                            color="#6c757d"
                          />
                          <Text style={{ fontSize: 16 }}>
                            <FormatDateTime
                              datevalue={data.requestedFrom}
                              type={1}
                            />
                          </Text>
                          {!isOpenSickLeave(data) && (
                            <>
                              <Text style={{ fontSize: 16 }}>
                                {" "}
                                -{" "}
                                <FormatDateTime
                                  datevalue={data.requestedTo}
                                  type={1}
                                />
                              </Text>
                            </>
                          )}
                        </View>
                        <Text style={[{ fontSize: 16 }, mt[2]]}>
                          <FormattedMessage id="Day" />:{" "}
                          <Text style={{ fontSize: 16, color: "#28a745" }}>
                            {isOpenSickLeave(data)
                              ? calculateWorkingDays(data.requestedFrom)
                              : data.daysOff}
                          </Text>
                        </Text>
                        {data.substituteUserFirstName &&
                          data.substituteUserLastName && (
                            <View>
                              <Text
                                className="text-center"
                                style={[{ fontSize: 12 }, mt[2]]}
                              >
                                <FormattedMessage id="vacation.selected.replacment" />{" "}
                                <Text style={{ fontWeight: "bold" }}>
                                  {data.substituteUserFirstName}{" "}
                                  {data.substituteUserLastName}
                                </Text>
                              </Text>
                            </View>
                          )}
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={{ padding: 10 }}>
                        <Text style={{ fontSize: 16 }}>
                          {" "}
                          <MaterialCommunityIcons
                            name="calendar"
                            size={24}
                            color="#6c757d"
                          />{" "}
                          <FormatDateTime
                            datevalue={data.requestedFrom}
                            type={1}
                          />
                        </Text>
                        <Text style={[{ fontSize: 16 }, mt[2]]}>
                          {" "}
                          <Feather
                            name="clock"
                            size={22}
                            color="#6c757d"
                          />{" "}
                          <FormatDateTime
                            datevalue={data.requestedFrom}
                            type={0}
                          />{" "}
                          -{" "}
                          <FormatDateTime
                            datevalue={data.requestedTo}
                            type={0}
                          />
                        </Text>
                        {data.hoursOff && (
                          <Text style={[{ fontSize: 16 }, mt[2]]}>
                            {" "}
                            <FormattedMessage id="Hour" />:{" "}
                            <Text style={[{ color: "#28a745" }]}>
                              {data.hoursOff}
                            </Text>
                          </Text>
                        )}
                      </View>
                    </>
                  )}
                </View>
                <View
                  style={{
                    width: "100%",
                    borderColor: "#ccc",
                    borderTopWidth: 1,
                  }}
                >
                  {data.approved &&
                    !isOpenSickLeave(data) &&
                    data.requestType === 2 && (
                      <>
                        {data.vacationRequestDocumentResponse?.name && (
                          <View
                            style={[
                              flex.d_flex_center,
                              flex.flex_start,
                              p[3],
                              { width: "100%" },
                            ]}
                          >
                            <Text style={[{ width: "40%" }]}>
                              <FormattedMessage id="medical.document" />:
                            </Text>

                            <TouchableOpacity
                              onPress={() => {
                                openFile(
                                  data.id,
                                  data.vacationRequestDocumentResponse
                                );
                              }}
                              style={[
                                {
                                  backgroundColor: colors.gray_150,
                                  width: "60%",
                                },
                                p[2],
                                flex.d_flex_center,
                                flex.d_flex_between,
                              ]}
                            >
                              <TextMainSmallBold
                                isPlaintext
                                text={
                                  data.vacationRequestDocumentResponse?.name
                                }
                                customStyles={{ width: "70%" }}
                              />
                              <AntDesign
                                name="arrowright"
                                color={colors.white}
                                size={20}
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                        {isOpenSickLeave(data) && (
                          <Text>
                            <FormattedMessage id="sick.leave.request.is.still.open" />
                          </Text>
                        )}
                      </>
                    )}

                  {data.requesterComment ? (
                    <View style={[p[3]]}>
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>
                          {data.requesterFirstName} {data.requesterLastName}
                        </Text>
                        : {data.requesterComment}
                      </Text>
                    </View>
                  ) : (
                    <></>
                  )}
                  <VacationApproval
                    data={data}
                    handleCancelRequestVacation={handleCancelRequestVacation}
                    handleDeleteRequestVacation={handleDeleteRequestVacation}
                    isOpenSickLeave={isOpenSickLeave}
                    openSickLeaveModal={openSickLeaveModal}
                  />
                </View>
              </View>
          ))}
          {shouldShowEmptyState && (
            <Text style={{ paddingTop: 10, textAlign: "center" }}>
              <FormattedMessage id="vacation.list.noItems" />{" "}
            </Text>
          )}
        </ScrollView>
        {!shouldShowEmptyState ? (
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 999,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default VacationPersonalRequestsList;
