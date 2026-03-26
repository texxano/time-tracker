import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";

import http from "../../services/http";

import {
  getProject,
  projectCount,
} from "../../redux/actions/Project/project.actions";

// Components
import HeaderProject from "./components/HeaderProject";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import RoleInProject from "./components/ItemProject/RoleInProject";
import ModalCreateProject from "./components/ModalCreateProject";
import ItemProject from "./components/ItemProject/ItemProject";
import Breadcrumb from "./components/Breadcrumb";
import ProjectsStatistics from "./components/ProjectsStatistics";
// Components
import { documentTaskCount } from "../../redux/actions/DocumentTask/documentTask.actions";
import { moneyTrackerCount } from "../../redux/actions/MoneyTracker/moneyTracker.actions";
import { taskCount } from "../../redux/actions/Task/task.actions";

import { globalStyles } from "../../asset/style/globalStyles";
import AppContainerClean from "../../components/AppContainerClean";

const Project = (route) => {
  const { projectId, parentId, permissionCode, projectName, navigateFrom } =
    route.navigation.state.params;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  const isAdministrator = state.userDataRole?.isAdministrator;
  const getProjectDataState = state.getProjectData;
  const projectState = state.project;
  const projectSuccess = state.project.success;
  const favoriteProject = state.favoriteProject;
  const refreshScreen = state.refreshScreen.refresh;
  const idStateRootProject = state.idRootProject.id;
  const muteUnMuteNotifications = state.muteUnMuteNotifications;
  const permissionsState = state.permissions;
  const moneyTrackerEnabled = state.userDataModule?.moneyTrackerEnabled;
  const documentTaskEnabled = state.userDataModule?.documentTaskEnabled;
  const shotgunEnabled = state.userDataModule?.shotgunEnabled;

  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [titleProject, setTitleProject] = useState(projectName);
  const [loggedUserPermissionCode, setloggedUserPermissionCode] =
    useState(permissionCode);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(!isAdministrator);

  const [pagination, setpagination] = useState(0);
  const [showStatistics, setShowStatistics] = useState(false);
  useEffect(() => {
    if (!isAdministrator) {
      setRequestApi(true);
      if (
        projectSuccess ||
        refreshScreen ||
        muteUnMuteNotifications ||
        currentPage
      ) {
        http
          .get(
            `/projects/${projectId}/projects?page=${currentPage}&search=${search}`
          )
          .then((data) => {
            setRequestApi(false);
            setDataResponse(data.list);
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            if (search.length === 0) {
              dispatch(projectCount(data.totalItems));
            }
            setDataLength(data.list.length === 0);
          })
          .catch(() => {
            setRequestApi(false);
            setNotAuthorized(true);
          });
      }
    } else if (!navigateFrom) {
      setRequestApi(true);
    }
  }, [
    projectId,
    projectSuccess,
    favoriteProject,
    muteUnMuteNotifications,
    currentPage,
    search,
    permissionsState,
  ]);
  useEffect(() => {
    if (projectId) {
      setSearch("");
    }
  }, [projectId]);

  useEffect(() => {
    const getData = async () => {
      const refreshNr = getProjectDataState.id === projectId;
      dispatch(getProject(projectId, navigateFrom, refreshNr));
    };
    getData();
  }, [projectId, projectState]);

  useEffect(() => {
    if (!navigateFrom || navigateFrom !== "Dashboard") {
      setTitleProject(getProjectDataState.title);
      setloggedUserPermissionCode(getProjectDataState.loggedUserPermissionCode);
    }
    if (getProjectDataState.unauthorized) {
      setNotAuthorized(true);
    }
    if (dataLength && currentPage > 1) {
      setCurrentPage(-1);
    }
  }, [
    getProjectDataState.title,
    getProjectDataState.unauthorized,
    navigateFrom,
    dataLength,
  ]);

  useEffect(() => {
    if (shotgunEnabled) {
      http.get(`/shotgun/tasks/project/${projectId}/count`).then((data) => {
        dispatch(taskCount(data));
      });
    }
  }, [projectId]);

  useEffect(() => {
    if (moneyTrackerEnabled) {
      http
        .get(`/moneytracker/invoices/project/${projectId}/count`)
        .then((data) => {
          dispatch(moneyTrackerCount(data));
        });
    }
  }, [projectId]);

  useEffect(() => {
    if (documentTaskEnabled) {
      http.get(`/doctask/tasks/project/${projectId}/count`).then((data) => {
        dispatch(documentTaskCount(data));
      }).catch;
    }
  }, [projectId]);

  return (
    <AppContainerClean
      location={"Project"}
      pagination={pagination}
      notAuthorized={notAuthorized}
    >
      <View style={{ height: "auto", minHeight: 36 }}>
        <HeaderProject
          location={"Project"}
          projectId={projectId}
          parentId={parentId}
          permissionCode={loggedUserPermissionCode}
        />
      </View>
      <Breadcrumb
        projectId={projectId}
        data={{
          idStateRootProject,
          projectId,
          parentId,
          permissionCode,
          titleProject,
          navigateFrom,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[globalStyles.screenTitle, { fontSize: 14 }]}>
            {/* <FormattedMessage id="projects.add.title" /> */}
            <FormattedMessage id="projects.tabs.projects.title" />
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {loggedUserPermissionCode >= 2 && !isAdministrator ? (
              <ModalCreateProject parentId={projectId} />
            ) : (
              <></>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowStatistics(!showStatistics)}
          style={{
            backgroundColor: "#28a745",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
            marginRight: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
           <FormattedMessage id="projects.show.statistics">
             {(msg) => (
               <Text
                 style={{
                   color: "#fff",
                   fontSize: 12,
                   fontWeight: "500",
                   marginRight: 4,
                 }}
               >
                 {msg}
               </Text>
             )}
           </FormattedMessage>
          <Ionicons
            name={showStatistics ? "chevron-up" : "chevron-down"}
            size={14}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {showStatistics && (
        <ProjectsStatistics
          projectId={projectId}
          permissionCode={loggedUserPermissionCode}
          parentId={parentId}
        />
      )}
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={"projects.filter.title"}
      />
      <View style={[globalStyles.box, { flex: 1 }]}>
        <View
          style={[
            globalStyles.rowSpaceBetweenAlignItems,
            { paddingHorizontal: 15 },
          ]}
        >
          <Text style={globalStyles.projectParentTitle}>{titleProject}</Text>
          <RoleInProject loggedUserPermissionCode={loggedUserPermissionCode} />
        </View>
        {requestApi ? (
          <ActivityIndicator size="small" color="#6c757d" />
        ) : (
          <></>
        )}
        <FlatList
          data={dataResponse}
          renderItem={({ item, index }) => {
            return (
              <View key={index}>
                <ItemProject
                  data={item}
                  navigateFrom={navigateFrom}
 
                />
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flex: 1 }}
        />
        {dataLength && !requestApi ? (
          <Text style={globalStyles.dataLength}>
            <FormattedMessage id="projects.list.noItems" />{" "}
          </Text>
        ) : (
          <></>
        )}
      </View>
      <View style={{ width: "80%" }}>
      {!dataLength ? (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
        />
      ) : (
          <></>
        )}
      </View>
    </AppContainerClean>
  );
};

export default Project;
