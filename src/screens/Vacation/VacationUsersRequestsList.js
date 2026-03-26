import React, { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import {
  approveRequestVacation,
  denyRequestVacation,
} from "../../redux/actions/Vacation/vacationRequests.actions";

// Components
import Pagination from "../../components/Pagination";
import InitialUser from "../../components/InitialUser";
import FormatDateTime from "../../components/FormatDateTime";

import ModalApproveDenyVacation from "./components/ModalApproveDenyVacation";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { globalStyles } from "../../asset/style/globalStyles";
import { vacationStyles } from "./syles";
import colors from "../../constants/Colors";
import ModalShowMessage from "../../components/Modal/ModalShowMessage";
import { ApprovalPath } from "./components/vacationUserRequestList/ApprovalPath";
import { TextMain } from "../../components/Texts";
import flex from "../../asset/style/flex.style";
import { mr, my } from "../../asset/style/utilities.style";

// 0 vacation in days
// 1 vacation in hours
// 2 seak

const VacationUsersRequestsList = ({ canApprove }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const vacations = state.vacations;
  const userData = state.userData;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;

  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [pagination, setpagination] = useState(0);
  const [requestApi, setRequestApi] = useState(true);
  const [serverError, setServerError] = useState(null);

  const [modalVacation, setModalVacation] = useState(false);
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");

  const configureWaitingForTeam = (data) => {
    const updatedData = data.map((item) => {
      item.approvalPath = item.approvalPath.map((path) => {
        const waitingTeamPath = item.approvalPath.find(
          (p) => p.approved === null
        );
        path.waitingForTeam =
          waitingTeamPath?.assignmentTeamData?.teamName ?? null;
        return path;
      });
      return item;
    });

    return updatedData;
  };

  useEffect(() => {
    const getData = () => {
      setRequestApi(true);
      http
        .get(
          `/vacations/requests/approvable/${
            currentPage ? `?page=${currentPage}` : ""
          }`
        )
        .then((data) => {
          if (data.status === 500) {
            setServerError(data.statusText);
          }
          setRequestApi(false);
          setDataResponse(configureWaitingForTeam(data.list));
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);

          setDataLength(data.list.length === 0);
        })
        .catch(() => {});
    }
    getData();
  }, [ currentPage,  vacations]);

  const handleApproveRequestVacation = (id, approverComment) => {
    const payload = { id, approverComment };
    dispatch(approveRequestVacation(payload));
  };
  const handleDenyRequestVacation = (id, approverComment) => {
    const payload = { id, approverComment };
    dispatch(denyRequestVacation(payload));
  };
  const handleDenyModal = (id) => {
    setId(id);
    setModalVacation(true);
    setStatus(0);
  };
  const handleApproveModal = (id) => {
    setId(id);
    setModalVacation(true);
    setStatus(1);
  };
  return (
    <View style={[vacationStyles.container, {}]}>
      <View>
        <Text style={globalStyles.screenTitle}>
          <FormattedMessage id="Users.Requests.List" />
        </Text>
      </View>
      <View>
        {requestApi ? (
          <ActivityIndicator size="large" color="#6c757d" />
        ) : (
          <></>
        )}
        <ModalShowMessage
          message={serverError}
          isPlaintext
          showModal={serverError !== null}
          close={() => setServerError(null)}
        />
        {dataResponse.map((data, index) => (
          <Fragment key={data.id}>
            {data.requestType !== 2 && (
              <View style={vacationStyles.listItem}>
                <View>
                  <View style={vacationStyles.userInfoContainer}>
                    <View>
                      <InitialUser
                        FirstName={data.requesterFirstName}
                        LastName={data.requesterLastName}
                        color={data.requesterColor}
                      />
                    </View>
                    <Text
                      style={{
                        ...vacationStyles.text,
                        ...{
                          fontSize: 20,
                          paddingLeft: 20,
                          fontWeight: Platform.OS === "ios" ? "500" : "400",
                        },
                      }}
                    >
                      {data.requesterFirstName} {data.requesterLastName}
                    </Text>
                  </View>
                  {data.requestType === 0 ? (
                    <>
                      <View style={vacationStyles.userInfoContainer}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={24}
                          color="#6c757d"
                        />
                        <Text style={vacationStyles.text}>
                          <FormatDateTime
                            datevalue={data.requestedFrom}
                            type={1}
                          />{" "}
                          -
                        </Text>
                        <Text style={vacationStyles.text}>
                          <FormatDateTime
                            datevalue={data.requestedTo}
                            type={1}
                          />
                        </Text>
                      </View>
                      <Text
                        style={[
                          vacationStyles.text,
                          { paddingHorizontal: 10, paddingBottom: 10 },
                        ]}
                      >
                        <FormattedMessage id="Day" />:{" "}
                        <Text style={{ color: colors.success_100 }}>
                          {data.daysOff}
                        </Text>
                      </Text>
                    </>
                  ) : (
                    <>
                      <View style={vacationStyles.userInfoContainer}>
                        <View style={vacationStyles.userInfoDateContainer}>
                          <MaterialCommunityIcons
                            name="calendar"
                            size={24}
                            color="#6c757d"
                          />
                          <Text style={vacationStyles.text}>
                            <FormatDateTime
                              datevalue={data.requestedFrom}
                              type={1}
                            />
                          </Text>
                        </View>
                        <View style={vacationStyles.userInfoDateContainer}>
                          <Feather name="clock" size={22} color="#6c757d" />
                          <Text style={vacationStyles.text}>
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
                        </View>
                      </View>
                      <Text
                        style={[
                          vacationStyles.text,
                          { paddingHorizontal: 10, paddingBottom: 10 },
                        ]}
                      >
                        <FormattedMessage id="Hour" />: {data.hoursOff}
                      </Text>
                    </>
                  )}
                  {data?.substituteUserFirstName && (
                    <View style={{ padding: 10 }}>
                      <Text>
                        <FormattedMessage id="Vacation.Proposed.Substitute" />
                      </Text>
                      <View style={{ addingVertical: 8 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                          }}
                        >
                          <InitialUser
                            FirstName={data?.substituteUserFirstName}
                            LastName={data.substituteUserLastName}
                            email={data.substituteUserEmail}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 16,
                                paddingLeft: 20,
                                fontWeight: "500",
                              }}
                            >
                              {data.substituteUserFirstName}{" "}
                              {data.substituteUserLastName}
                            </Text>
                            <Text style={{ fontSize: 13, paddingLeft: 20 }}>
                              {data.substituteUserEmail}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  {data.approvalPath?.length !== 0 && (
                    <ApprovalPath
                      data={data}
                      canApprove={canApprove}
                      userData={userData}
                      handleDenyModal={handleDenyModal}
                      handleApproveModal={handleApproveModal}
                    />
                  )}
                </View>
                {isOwnerForRoot && (
                  <View style={[vacationStyles.buttonContainer, flex.flex_direction_column]}>
                    <TextMain text="approve.or.deny.all.the.steps" />
                    <View style={[flex.d_flex_center, flex.flex_between,{width:"80%"}, my[3]]}>
                      <TouchableOpacity
                        style={[modalStyle.button, modalStyle.buttonDeny, flex.d_flex_center]}
                        onPress={() => handleDenyModal(data.id)}
                      >
                        <TextMain text="reject.event" customStyles={[{color:colors.white}, mr[1]]} />
                        <AntDesign name="closesquareo" size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[modalStyle.button, modalStyle.buttonApprove, flex.d_flex_center]}
                        onPress={() => handleApproveModal(data.id)}
                      >
                          <TextMain text="Approve.Button" customStyles={[{color:colors.white}, mr[1]]} />
                        <AntDesign name="checksquareo" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </Fragment>
        ))}
      </View>
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="vacation.list.noItems" />{" "}
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
      <ModalApproveDenyVacation
        id={id}
        modalVacation={modalVacation}
        setModalVacation={setModalVacation}
        status={status}
        deny={handleDenyRequestVacation}
        approve={handleApproveRequestVacation}
      />
    </View>
  );
};

export default VacationUsersRequestsList;
