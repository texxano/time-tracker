import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Text, ActivityIndicator, View, ScrollView } from "react-native";

// Redux
import { useDispatch, useSelector } from "react-redux";
import http from "../../services/http";
import { activitiesCount } from "../../redux/actions/Project/activities.actions";
// Redux

// Components
import HeaderProject from "./components/HeaderProject";
import InitialUser from "../../components/InitialUser";
import FormatDateTime from "../../components/FormatDateTime";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
// Components
import { globalStyles } from "../../asset/style/globalStyles";
import { styles } from "../../asset/style/Project/activity";
import AppContainerClean from "../../components/AppContainerClean";

const Activity = (route) => {
  const { projectId, parentId, permissionCode } = route.navigation.state.params;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const activitiesCountState = state.activitiesCount.count;
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [pagination, setpagination] = useState(0);
  const [notAuthorized, setNotAuthorized] = useState(false);
  useEffect(() => {
    const getData = async () => {
      if (currentPage) {
        http
          .get(
            `/activities?projectId=${projectId}${
              currentPage ? `&page=${currentPage}` : ""
            }${search ? `&search=${search}` : ""}`
          )
          .then((data) => {
            setRequestApi(false);
            if (search.length === 0) {
              dispatch(activitiesCount(data.totalItems));
            }
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            setDataResponse(data.list);
            setDataLength(data.list.length === 0);
            setNotAuthorized(false);
          })
          .catch(() => {
            setRequestApi(false);
            setNotAuthorized(true);
          });
      }
    };
    getData();
  }, [projectId, currentPage, search]);
  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [dataLength, currentPage]);

  return (
    <>
      <AppContainerClean
        location={"Activity"}
        pagination={pagination}
        notAuthorized={notAuthorized}
      >
        <View style={{ height: "auto", minHeight: 36 }}>

        <HeaderProject
          location={"Activity"}
          projectId={projectId}
            parentId={parentId}
            permissionCode={permissionCode}
          />
        </View>
        <View
          style={[
            globalStyles.rowSpaceBetweenAlignItems,
            globalStyles.minHeight,
          ]}
        >
          <Text style={globalStyles.screenTitle}>
            <FormattedMessage id="projects.tabs.activity.title" />
          </Text>
        </View>
        <Search
          onSearch={(value) => {
            setSearch(value);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          placeholder={"activity.filter.title"}
        />
        <ScrollView 
          style={styles.div}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {dataResponse.map((data, index) => (
            <View
              style={
                index === dataResponse.length - 1 ? styles.View12 : styles.View
              }
              key={data.id ? `activity-${data.id}` : `activity-index-${index}`}
            >
              <InitialUser
                FirstName={data.userFirstName}
                LastName={data.userLastName}
                email={data.userEmail}
                color={data.userColor}
              />
              <View style={{ marginLeft: 20, paddingRight: 8 }}>
                <View style={styles.View2}>
                  <Text style={styles.baseText}>
                    {data.userFirstName} {data.userLastName}
                  </Text>
                  <Text style={styles.text}>
                    <FormattedMessage id={data.message} />
                  </Text>
                  <Text
                    style={{
                      paddingRight: 5,
                      fontWeight: "400",
                      color: "#6c757d",
                    }}
                  >
                    {data.messageArgument}
                  </Text>
                </View>
                <Text style={{ fontWeight: "400", color: "#6c757d" }}>
                  <FormatDateTime datevalue={data.date} type={2} />
                </Text>
              </View>
            </View>
          ))}
          {requestApi ? (
            <ActivityIndicator size="large" color="#6c757d" />
          ) : (
            <></>
          )}
        </ScrollView>
        {activitiesCountState === 0 || dataLength ? (
          <Text style={styles.dataLength}>
            <FormattedMessage id="activity.list.noItems" />
          </Text>
        ) : (
          <View style={{ width: "80%" }}>
          <Pagination
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={pageIndex}
            total={totalPages}
            checkTokenExpPagination={(e) => setpagination(e)}
            height={10}
          />
          </View>
        )}
      </AppContainerClean>
    </>
  );
};

export default Activity;
