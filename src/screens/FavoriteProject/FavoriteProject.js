import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, FlatList } from "react-native";
import { FormattedMessage } from "react-intl";

// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";
// Redux

// Components
import HeaderDashboard from "../Dashboard/components/HeaderDashboard";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import ItemProject from "../Project/components/ItemProject/ItemProject";
// Components

import { globalStyles } from "../../asset/style/globalStyles";
import AppContainerClean from "../../components/AppContainerClean";

const FavoriteProject = (route) => {
  const state = useSelector((state) => state);
  const favoriteProject = state.favoriteProject;

  const [dataResponse, setDataResponse] = useState([]);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setpagination] = useState(0);
  useEffect(() => {
    const getData = async () => {
      http
        .get(`/projects/favorites?page=${currentPage}&search=${search}`)
        .then((data) => {
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setRequestApi(false);
          setDataLength(data.list.length === 0);
        });
    };
    getData();
  }, [currentPage, favoriteProject, search]);
  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(-1);
    }
  }, [dataLength, currentPage]);
  return (
    <>
      <AppContainerClean
        location={"FavoriteProject"}
        pagination={pagination}
      >
        <HeaderDashboard location={"FavoriteProject"} />
        <View
          style={{ flexDirection: "row", alignItems: "center", minHeight: 37 }}
        >
          <Text style={globalStyles.screenTitle}>
            <FormattedMessage id="favorite.project.title" />
          </Text>
        </View>
        <Search
          onSearch={(value) => {
            setSearch(value);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          placeholder={"projects.filter.title"}
        />
        <View style={globalStyles.box}>
          <FlatList
            data={dataResponse}
            renderItem={({ item, index }) => {
              return (
                <View key={index}>
                  <ItemProject
                    data={item}
                    navigateFrom={"FavoriteProject"}
                  />
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
          />
          {requestApi ? (
            <ActivityIndicator size="large" color="#6c757d" />
          ) : (
            <></>
          )}
          {dataLength ? (
            <Text style={globalStyles.dataLength}>
              <FormattedMessage id="projects.list.noItems" />{" "}
            </Text>
          ) : (
            <></>
          )}
        </View>
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
        />
      </AppContainerClean>
    </>
  );
};

export default FavoriteProject;
