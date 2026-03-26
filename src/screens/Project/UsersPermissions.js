import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { FormattedMessage } from "react-intl";
import { Ionicons } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { NavigationService } from "../../navigator";
import { getProject } from "../../redux/actions/Project/project.actions";

// Redux

// Components
import InitialUser from "../../components/InitialUser";
import ModalRegisterUser from "../UsersTeams/components/ModalRegisterUser";
import SelectPermissionsUser from "./components/ItemProject/SelectPermissionsUser";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
// Components

import { globalStyles } from "../../asset/style/globalStyles";
import HeaderProject from "./components/HeaderProject";
import AppContainerClean from "../../components/AppContainerClean";

const UsersPermissions = (route) => {
  const { projectId, parentId, permissionCode, projectName, navigateFrom } =
    route.navigation.state.params;
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  const permissionsState = state.permissions;
  const user = state.user;
  const isAdministrator = state.userDataRole?.isAdministrator;
  const [dataUserJson, setDataUserJson] = useState([]);
  const [dataUserGlobal, setDataUserGlobal] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [requestApi, setRequestApi] = useState(true);
  const [pagination, setpagination] = useState(0);
  const [notAuthorized, setNotAuthorized] = useState(false);
  useEffect(() => {
    const getData = async () => {
      http
        .get(
          `/permissions?projectId=${projectId}${
            currentPage ? `&page=${currentPage}` : ""
          }${searchUser ? `&search=${searchUser}` : ""}`
        )
        .then((data) => {
          setRequestApi(false);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataUserJson(data.list);
          setNotAuthorized(false);
        })
        .catch(() => {
          setRequestApi(false);
          setNotAuthorized(true);
        });
    };
    getData();
  }, [projectId, searchUser, currentPage, permissionsState, user]);

  useEffect(() => {
    if (searchUser.length >= 3) {
      http
        .get(
          `/users/search${currentPage ? `?page=${currentPage}` : ""}${
            searchUser ? `&search=${searchUser}` : ""
          }`
        )
        .then((data) => {
          setDataUserGlobal(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
        })
        .catch(() => {
          setDataUserGlobal([]);
        });
    } else {
      setDataUserGlobal([]);
    }
  }, [searchUser, currentPage]);

  useEffect(() => {
    if (parentId) {
      dispatch(getProject(projectId, parentId));
    }
  }, [navigateFrom, dispatch]);

  function filterBypermissionCode(item) {
    if (item.permissionCode === 3) {
      return true;
    }
    return false;
  }
  let arrpermissionCode = dataUserJson.filter(filterBypermissionCode);

  return (
    <>
      <AppContainerClean
        location={navigateFrom}
        pagination={pagination}
        notAuthorized={notAuthorized}
      >
        {parentId ? (
          <HeaderProject
            location={navigateFrom}
            projectId={projectId}
            parentId={parentId}
            permissionCode={permissionCode}
          />
        ) : (
          <></>
        )}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 2,
              borderBottomColor: "#dee2e6",
              minHeight: 37,
            }}
          >
            <Text style={globalStyles.projectParentTitle}>{projectName}</Text>
            <TouchableOpacity
              onPress={() => {
                NavigationService.navigate(navigateFrom, {
                  projectId: parentId,
                  parentId: parentId,
                  permissionCode: permissionCode,
                  projectName: projectName,
                });
              }}
              style={globalStyles.rowSpaceBetweenAlignItems}
            >
              <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
              <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[globalStyles.rowSpaceBetweenAlignItems, { paddingTop: 10 }]}
          >
            <Text>
              <FormattedMessage id="projects.form.users.modal.title" />
            </Text>
            {parentId === null ? (
              <View style={globalStyles.rowSpaceBetweenAlignItems}>
                <Text style={{ paddingRight: 10 }}>
                  <FormattedMessage id="projects.form.users.modal.add.title" />
                </Text>
                <ModalRegisterUser rootId={projectId} />
              </View>
            ) : (
              <></>
            )}
          </View>

          <Search
            onSearch={(value) => {
              setSearchUser(value);
            }}
            onPageChange={(page) => setCurrentPage(page)}
            placeholder={"projects.form.users.filter.title"}
          />
          <View style={[styles.boxUser, { height: 500 }]}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              nestedScrollEnabled={true}
            >
            {dataUserJson.map((data, index) => (
              <View
                key={`project-${data.userId}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  // width: "100%",
                  marginBottom: 20,
                  ...Platform.select({
                    ios: {
                      zIndex: 999 - index,
                    },
                  }),
                }}
              >
                <View
                  style={{
                    width: "60%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {dataUserJson.length ? (
                    <InitialUser
                      FirstName={data.userFirstName}
                      LastName={data.userLastName}
                      email={data.userEmail}
                      color={data.userColor}
                    />
                  ) : (
                    <></>
                  )}
                  <View>
                    <Text style={{ marginLeft: 10, fontSize: 16 }}>
                      {data.userFirstName} {data.userLastName}
                    </Text>
                    <Text style={{ marginLeft: 10, fontSize: 12 }}>
                      {data.userEmail}
                    </Text>
                  </View>
                </View>
                <View>
                  <SelectPermissionsUser
                    select={data.permissionCode || null}
                    userId={data.userId}
                    projectId={projectId}
                    idPermissions={data.id}
                    length={20000 - index}
                    disableUpdateOwner={arrpermissionCode.length === 0}
                    parentId={parentId}
                  />
                </View>
              </View>
            ))}
            {dataUserGlobal.length ? (
              <View style={styles.boxUserslengthView}>
                <Text style={globalStyles.dataLength}>
                  <FormattedMessage id="projects.form.users.noItems" />
                </Text>
              </View>
            ) : (
              <></>
            )}
            {dataUserGlobal.length ? (
              <View
                style={[styles.boxUserslengthView, { borderBottomWidth: 0 }]}
              >
                <Text style={globalStyles.dataLength}>
                  <FormattedMessage id="user.another.project.texxano" />
                </Text>
              </View>
            ) : (
              <></>
            )}

            {dataUserGlobal.map((data, index) => (
              <View
                key={`global-${data.id}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  ...Platform.select({
                    ios: {
                      zIndex: 999 - index,
                    },
                  }),
                }}
                >
                <View
                  style={{
                    width: "70%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {dataUserGlobal.length ? (
                    <InitialUser
                      FirstName={data.firstName}
                      LastName={data.lastName}
                      email={data.email}
                      color={data.color}
                    />
                  ) : (
                    <></>
                  )}
                  <View>
                    <Text style={{ marginLeft: 10, fontSize: 16 }}>
                      {data.firstName} {data.lastName}
                    </Text>
                    <Text style={{ marginLeft: 10, fontSize: 12 }}>
                      {data.email}
                    </Text>
                  </View>
                </View>
                <View>
                  <SelectPermissionsUser
                    select={data.permissionCode || null}
                    userId={data.id}
                    projectId={projectId}
                    idPermissions={data.permissionId || null}
                    length={1000 - index}
                    disableUpdateOwner={arrpermissionCode.length === 0}
                    parentId={parentId}
                  />
                </View>
              </View>
            ))}
            <Pagination
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={pageIndex}
              total={totalPages}
            />
            {requestApi ? (
              <ActivityIndicator size="large" color="#6c757d" />
            ) : (
              <></>
            )}
            </ScrollView>
          </View>
        </View>
      </AppContainerClean>
    </>
  );
};
const styles = StyleSheet.create({
  boxUser: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },

  boxUserslengthView: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    paddingBottom: 20,
  },
});

export default UsersPermissions;
