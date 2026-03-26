import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";
import { Radio } from "native-base";
// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";

// Redux
import { NavigationService } from "../../navigator";

// Components
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
// Components

import { globalStyles } from "../../asset/style/globalStyles";
import HeaderDashboard from "../Dashboard/components/HeaderDashboard";
import AppContainerClean from "../../components/AppContainerClean";

const GlobalSearch = (route) => {
  const state = useSelector((state) => state);

  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState(0);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(false);
  const [pagination, setpagination] = useState(0);
  const [placeholderSearch, setplaceholderSearch] = useState(
    "projects.filter.title"
  );
  const [dataLengthText, setdataLengthText] = useState("projects.filter.title");

  useEffect(() => {
    if (searchType === 0) {
      setplaceholderSearch("projects.filter.title");
      setdataLengthText("projects.list.noItems");
    } else if (searchType === 1) {
      setplaceholderSearch("documents.filter.title");
      setdataLengthText("documents.list.noItems");
    } else if (searchType === 2) {
      setplaceholderSearch("comments.filter.title");
      setdataLengthText("comments.list.noItems");
    } else {
      setplaceholderSearch("users.filter.title");
      setdataLengthText("users.list.noItems");
    }
  }, [searchType]);

  useEffect(() => {
    if (search) {
      setRequestApi(true);
      http
        .get(
          `/projects/globalsearch/?searchType=${searchType}&search=${search}&page=${currentPage}`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        })
        .catch(() => {
          setNotAuthorized(true);
          setRequestApi(false);
        });
    }
  }, [currentPage, search, searchType]);

  return (
    <AppContainerClean
      location={"GlobalSearch"}
      pagination={pagination}
      notAuthorized={notAuthorized}
    >
      <HeaderDashboard location={"GlobalSearch"} />
      <View
        style={[globalStyles.rowSpaceBetweenAlignItems, globalStyles.minHeight]}
      >
        <View style={globalStyles.rowSpaceBetweenAlignItems}>
          <Text style={globalStyles.screenTitle}>
            <FormattedMessage id="global.search" />
          </Text>
        </View>
      </View>
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={placeholderSearch}
      />
      <Radio.Group
        name="myRadioGroup"
        value={searchType}
        onChange={(val) => {
          setSearchType(val);
        }}
      >
        <View style={globalStyles.bottomProjectReport}>
          <View style={{ flexDirection: "row", paddingRight: 10 }}>
            <Radio value={0} colorScheme="coolGray" my={1}>
              <Text>
                {" "}
                <FormattedMessage id="projects.tabs.projects.title" />
              </Text>
            </Radio>
          </View>
          <View style={{ flexDirection: "row", paddingRight: 10 }}>
            <Radio value={1} colorScheme="coolGray" my={1}>
              <Text>
                {" "}
                <FormattedMessage id="projects.tabs.documents.title" />
              </Text>
            </Radio>
          </View>
          <View style={{ flexDirection: "row", paddingRight: 10 }}>
            <Radio value={2} colorScheme="coolGray" my={1}>
              <Text>
                {" "}
                <FormattedMessage id="projects.tabs.comments.title" />
              </Text>
            </Radio>
          </View>
          {/* <View style={{ flexDirection: "row", paddingRight: 10, }}>
                        <Radio value={3} colorScheme="coolGray" my={1}>
                            <Text>  <FormattedMessage id="projects.tabs.users.title" /></Text>
                        </Radio>
                    </View> */}
        </View>
      </Radio.Group>
      {search ? (
        <>
          <View style={globalStyles.box}>
            {requestApi ? (
              <ActivityIndicator size="small" color="#6c757d" />
            ) : (
              <></>
            )}
            {dataResponse?.map((data) => (
              <View key={data.id}>
                {(() => {
                  if (data.searchType === 0) {
                    return (
                      <TouchableOpacity
                        style={styles.box}
                        onPress={() => {
                          NavigationService.navigate("Project", {
                            projectId: data.projectId,
                            projectName: data.content,
                            navigateFrom: undefined,
                          });
                        }}
                      >
                        <Text style={styles.title17}>{data.content}</Text>
                        <View style={styles.boxFlex}>
                          <MaterialCommunityIcons
                            name="folder-upload-outline"
                            size={24}
                            color={"#6c757d"}
                          />
                          <Text style={styles.title15}>{data.project}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  } else if (data.searchType === 1) {
                    return (
                      <TouchableOpacity
                        style={styles.box}
                        onPress={() => {
                          NavigationService.navigate("Documents", {
                            projectId: data.projectId,
                            fromNotifications: true,
                          });
                        }}
                      >
                        <Text style={styles.title17}>{data.content}</Text>
                        <View style={styles.boxFlex}>
                          <AntDesign
                            name="folderopen"
                            size={24}
                            color={"#6c757d"}
                          />
                          <Text style={styles.title15}>{data.project}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  } else if (data.searchType === 2) {
                    return (
                      <TouchableOpacity
                        style={styles.box}
                        onPress={() => {
                          NavigationService.navigate("Comments", {
                            projectId: data.projectId,
                            fromNotifications: true,
                          });
                        }}
                      >
                        <Text style={styles.title17}>{data.content}</Text>
                        <View style={styles.boxFlex}>
                          <AntDesign
                            name="folderopen"
                            size={24}
                            color={"#6c757d"}
                          />
                          <Text style={styles.title15}>{data.project}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  } else if (data.searchType === 3) {
                    return (
                      <View style={styles.box}>
                        <Text style={styles.title17}>{data.content}</Text>
                      </View>
                    );
                  }
                })()}
              </View>
            ))}
            {dataLength && !requestApi ? (
              <Text style={globalStyles.dataLength}>
                <FormattedMessage id={dataLengthText} />{" "}
              </Text>
            ) : (
              <></>
            )}
          </View>
          {!dataLength ? (
            <Pagination
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={pageIndex}
              total={totalPages}
            />
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </AppContainerClean>
  );
};
export const styles = StyleSheet.create({
  title17: {
    fontSize: 17,
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  title15: {
    fontSize: 15,
    fontWeight: Platform.OS === "ios" ? "500" : "400",
    paddingLeft: 10,
  },
  box: {
    marginTop: 10,
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderRadius: 8,
  },
  boxFlex: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
  },
});

export default GlobalSearch;
