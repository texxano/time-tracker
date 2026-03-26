import React, { useEffect, useState } from "react";

import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";

// Redux
import { useDispatch, useSelector } from "react-redux";

import http from "../../services/http";
import { userCount } from "../../redux/actions/UsersTeams/user.actions";
import {
  lockAllUser,
  unlockAllUser,
} from "../../redux/actions/UsersTeams/user.actions";
// Redux

// Components
import ModalEditUser from "./components/ModalEditUser";
import ModalMoreEditUser from "./components/ModalMoreEditUser";
import ModalRegisterUser from "./components/ModalRegisterUser";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import ModalReport from "../../components/Modal/ModalReport";
// Components
import { styles } from "../../asset/style/Project/document";
import { globalStyles } from "../../asset/style/globalStyles";

const AllUsers = ({ projectId }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const userIdState = state.userData.userId;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const isEditorForRoot = state.userDataRole.isEditorForRoot;
  const isAdministrator = state.userData?.isAdministrator;
  const timeTrackerIsSupervisor = state.userDataModule?.timeTrackerIsSupervisor;
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const user = state.user;
  const userRequest = state.user.userRequest;
  const userdelete = state.user.data;
  const userCountState = state.userCount.count;
  const refreshScreen = state.refreshScreen.refresh;

  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [checkTokenExp, setcheckTokenExp] = useState(0);
  const [pagination, setpagination] = useState(0);
  const [notAuthorized, setNotAuthorized] = useState(false);
  useEffect(() => {
    setDataResponse([]);
    if (user || userdelete || refreshScreen) {
      http
        .get(
          `/users?rootId=${projectId}${
            currentPage ? `&page=${currentPage}` : ""
          }${search ? `&search=${search}` : ""}`
        )
        .then((data) => {
          setRequestApi(false);
          if (search.length === 0) {
            dispatch(userCount(data.totalItems));
          }
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataResponse(data.list);
          setDataLength(data.list.length === 0);
          setNotAuthorized(false);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setRequestApi(false);
          setNotAuthorized(true);
          setDataResponse([]);
          setDataLength(true);
        });
    }
  }, [user, userdelete, projectId, currentPage, search]);
  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(-1);
    }
  }, [dataLength, currentPage]);
  const handleLockUser = () => {
    dispatch(lockAllUser(projectId));
  };
  const handleUnLockUser = () => {
    dispatch(unlockAllUser(projectId));
  };

  const lockStatus = dataResponse[0]?.isLocked;
  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 15,
        borderRadius: 5,
        flex: 1,
      }}
    >
      {/* <AppContainer location={'Users'} checkTokenExp={checkTokenExp} pagination={pagination} notAuthorized={notAuthorized} searchChange={search.length > 3 && search.length < 128}  > */}
      {/* <HeaderProject location={'Users'} projectId={projectId} parentId={parentId} permissionCode={permissionCode} /> */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", minHeight: 37 }}
        >
          <Text style={globalStyles.screenTitle}>
            <FormattedMessage id="projects.tabs.users.title" />{" "}
          </Text>
          <ModalRegisterUser
            rootId={projectId}
            setcheckTokenExp={(e) => setcheckTokenExp(e)}
          />
          {isAdministrator ? (
            <>
              {!lockStatus ? (
                <TouchableOpacity
                  style={globalStyles.btnCircle}
                  onPress={() => handleLockUser()}
                >
                  <MaterialIcons name="lock" size={24} color="#6c757d" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={globalStyles.btnCircle}
                  onPress={() => handleUnLockUser()}
                >
                  <MaterialIcons name="lock-open" size={24} color="#6c757d" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <></>
          )}
        </View>
        {(!isAdministrator && timeTrackerIsSupervisor) ||
        isEditorForRoot ||
        isOwnerForRoot ? (
          <View>
            <ModalReport projectId={projectId} reportFor={2} />
          </View>
        ) : (
          <></>
        )}
      </View>
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={"users.filter.title"}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View>
          {dataResponse.map((data, index) => (
            <View key={index} style={styles.box}>
              <View style={styles.box2}>
                <ModalEditUser
                  dataUser={data}
                  setcheckTokenExp={(e) => setcheckTokenExp(e)}
                  openFromModal={false}
                />
                <>
                  {data.isLocked ? (
                    <MaterialIcons name="lock" size={20} color="#6c757d" />
                  ) : null}
                </>
              </View>
              <View>
                {userIdState !== data.id ? (
                  <ModalMoreEditUser
                    dataUser={data}
                    setcheckTokenExp={(e) => setcheckTokenExp(e)}
                  />
                ) : (
                  <></>
                )}
              </View>
            </View>
          ))}
          {userCountState === 0 || dataLength ? (
            <Text style={globalStyles.dataLength}>
              <FormattedMessage id="users.list.noItems" />
            </Text>
          ) : (
            <Pagination
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={pageIndex}
              total={totalPages}
              checkTokenExpPagination={(e) => setpagination(e)}
            />
          )}
        </View>
      </ScrollView>
      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      {/* </AppContainer> */}
    </View>
  );
};

export default AllUsers;
