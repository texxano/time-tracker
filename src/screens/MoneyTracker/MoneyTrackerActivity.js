import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Text, ActivityIndicator, View, ScrollView } from "react-native";

// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";
import { auth } from "../../utils/statusUser";
// Redux

// Components
import InitialUser from "../../components/InitialUser";
import FormatDateTime from "../../components/FormatDateTime";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
// Components
import { globalStyles } from "../../asset/style/globalStyles";
import { styles } from "../../asset/style/Project/activity";

const MoneyTrackerActivity = ({ projectId }) => {
  const state = useSelector((state) => state);
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (currentPage) {
        http
          .get(
            `/moneytracker/activities${
              projectId ? `?projectId=${projectId}` : ""
            }${
              currentPage ? `${projectId ? `&` : "?"}page=${currentPage}` : ""
            }${search ? `&search=${search}` : ""}`
          )
          .then((data) => {
            setRequestApi(false);
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
      <View
        style={[globalStyles.rowSpaceBetweenAlignItems, globalStyles.minHeight]}
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
        style={[styles.div, { maxHeight: 400 }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {dataResponse.map((data, index) => (
          <View
            style={
              index === dataResponse.length - 1 ? styles.View12 : styles.View
            }
            key={data.id ? `money-activity-${data.id}` : `money-activity-index-${index}`}
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
      {dataLength ? (
        <Text style={styles.dataLength}>
          <FormattedMessage id="activity.list.noItems" />
        </Text>
      ) : (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
        />
      )}
    </>
  );
};

export default MoneyTrackerActivity;
