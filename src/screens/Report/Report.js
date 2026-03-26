import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";

import { Radio } from "native-base";
// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { auth } from "../../utils/statusUser";
import { deleteByIdReport } from "../../redux/actions/Reports/reports.actions";
// Redux
import { NavigationService } from "../../navigator";
import fileDownloaderIIOS from "../../utils/fileDownloader.ios";
import fileDownloaderAndroid from "../../utils/fileDownloader.android";
import { downloadReport } from "./downloadReport";
// Components
import { check } from "../../utils/statusUser";
import Pagination from "../../components/Pagination";
import ModalDelete from "../../components/Modal/ModalDelete";
import { globalStyles } from "../../asset/style/globalStyles";
import Search from "../../components/Search";
import HeaderReport from "./components/HeaderReport";
import AppContainerClean from "../../components/AppContainerClean";
// Components
const Report = (route) => {
  const params = route.navigation.state.params || {};
  const location = params.location || "Dashboard";
  // Get macroCategoryReport from navigation params (from notification) or default to 20
  const initialMacroCategory = params.macroCategoryReport || 20;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  const reportsState = state.reports.data;
  const datefailure = state.reports.datefailure?.title;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [checkTokenExp, setcheckTokenExp] = useState(0);
  const [search, setSearch] = useState("");
  const [pagination, setpagination] = useState(0);
  const [category, setCategory] = useState("");
  // macroCategoryReport controls which report tab is active:
  // 20 = "Извештај на статусот" (Reports by Status) - first tab
  // 10 = "Извештаи за Време" (Reports by Time) - second tab
  // Default to 20 (first tab) so users see "Reports by Status" when navigating from Sidebar
  // Can be overridden by navigation params (e.g., from notifications)
  const [macroCategoryReport, setmacroCategoryReport] = useState(initialMacroCategory);

  const onMacroCategoryChange = (index) => {
    setmacroCategoryReport(index);
    // Reset category when switching tabs since tab 1 doesn't use category filters
    setCategory("");
  };
 console.log(location,'location')
  useEffect(() => {
    const getData = async () => {
      http
        .get(
          `/reports?page=${currentPage}&search=${search}&macroCategory=${macroCategoryReport}&category=${category}`
        )
        .then((data) => {
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setRequestApi(false);
          setDataLength(data.list.length === 0);
        });
    };
    getData();
  }, [currentPage, search, category, reportsState, macroCategoryReport]);

  const handleDeletedById = (id) => {
    dispatch(deleteByIdReport(id));
  };
  const nameFileType = (name, type) => {
    if (type === 0) {
      return name.replaceAll(".", "") + ".pdf";
    } else if (type === 1) {
      return name.replaceAll(".", "") + ".xlsx";
    } else if (type === 2) {
      return name.replaceAll(".", "") + ".csv";
    } else if (type === 3) {
      return name.replaceAll(".", "") + ".html";
    }
  };
  const handleDownload = (data) => {
    if (Platform.OS === "android") {
      if (data.fileFormat === 3) {
        downloadReport(
          data.id,
          nameFileType(data.name, data.fileFormat),
          data.fileFormat
        );
      } else {
        fileDownloaderAndroid(
          data.id,
          nameFileType(data.name, data.fileFormat),
          1
        );
      }
    } else {
      if (data.fileFormat === 3) {
        downloadReport(data.id, data.name, data.fileFormat);
      } else {
        fileDownloaderIIOS(
          data.id,
          nameFileType(data.name, data.fileFormat),
          1
        );
      }
    }
  };
 console.log(category, 'category')
  return (
    <AppContainerClean
      location="Report"
      checkTokenExp={checkTokenExp}
      pagination={pagination}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#6c757d",
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            <FormattedMessage id="projects.reports" />
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate(location, {
              location: location,

            });
          }}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
        </TouchableOpacity>
      </View>

      {isOwnerForRoot ? (
        <HeaderReport
          location={macroCategoryReport}
          onMacroCategoryChange={onMacroCategoryChange}
        />
      ) : (
        <></>
      )}
      <Search
        onSearch={(value) => {
          setSearch(value);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        placeholder={"reports.filter.title"}
      />
      <View style={{ marginVertical: 10 }}>
        <Radio.Group
          name="myRadioGroup"
          value={category}
          onChange={(val) => {
            setCategory(val);
          }}
        >
          <View style={globalStyles.bottomProjectReport}>
            {macroCategoryReport === 10 ? (
              <>
                {isOwnerForRoot ? (
                  <>
                    <View style={{ flexDirection: "row", paddingRight: 10 }}>
                      <Radio value={100} colorScheme="primary" my={1}>
                        <Text>
                          {" "}
                          <FormattedMessage id="reports.personal" />
                        </Text>
                      </Radio>
                    </View>
                    <View style={{ flexDirection: "row", paddingRight: 10 }}>
                      <Radio value={110} colorScheme="coolGray" my={1}>
                        <Text>
                          {" "}
                          <FormattedMessage id="reports.users" />
                        </Text>
                      </Radio>
                    </View>
                    <View style={{ flexDirection: "row", paddingRight: 10 }}>
                      <Radio value={120} colorScheme="coolGray" my={1}>
                        <Text>
                          {" "}
                          <FormattedMessage id="Category.Single.Report.Time.Track" />
                        </Text>
                      </Radio>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                {/* <View style={{ flexDirection: "row", paddingRight: 10, }}>
                                <Radio value={200} colorScheme="coolGray" my={1}>
                                    <Text> <FormattedMessage id="projects.tabs.projects.title" /></Text>
                                </Radio>
                            </View> */}
              </>
            )}
          </View>
        </Radio.Group>
      </View>
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
          {dataResponse.map((data, index) => (
            <View key={index} style={styles.box}>
              <View style={styles.boxtitle}>
                <View style={styles.icon}>
                  {(() => {
                    if (data.fileFormat === 0) {
                      return (
                        <FontAwesome
                          name="file-pdf-o"
                          size={24}
                          color="#fa0f00"
                        />
                      );
                    } else if (data.fileFormat === 1) {
                      return (
                        <MaterialCommunityIcons
                          name="microsoft-excel"
                          size={24}
                          color="#28a745"
                        />
                      );
                    } else if (data.fileFormat === 2) {
                      return (
                        <FontAwesome5 name="file-csv" size={20} color="#28a745" />
                      );
                    } else if (data.fileFormat === 3) {
                      return (
                        <FontAwesome
                          name="file-pdf-o"
                          size={24}
                          color="#fa0f00"
                        />
                      );
                    }
                  })()}
                </View>
                {data.status === 2 ? (
                  // <TouchableOpacity onPress={() => (Platform.OS === 'android' ? fileDownloaderAndroid(data.id, nameFileType(data.name, data.fileFormat), token, 1) : fileDownloaderIIOS(data.id, nameFileType(data.name, data.fileFormat), token, 1))} >
                  <TouchableOpacity onPress={() => handleDownload(data)}>
                    <Text style={styles.titleReport}>{data.name}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text>{data.name}</Text>
                )}
              </View>
              <ModalDelete
                id={data.id}
                description={"report.delete.modal.description.this"}
                checkTokenExpModal={(e) => setcheckTokenExp(e)}
                deleted={handleDeletedById}
                type={1}
              />
            </View>
          ))}
          {!dataLength ? (
            <View style={{ width: "80%" }}>
              <Pagination
                onPageChange={(page) => setCurrentPage(page)}
                currentPage={pageIndex}
                total={totalPages}
                checkTokenExpPagination={(e) => setpagination(e)}
                height={10}
              />
            </View>
          ) : (
            <></>
          )}
        </ScrollView>
      )}
    </AppContainerClean>
  );
};
const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,

    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6c757d",
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderRadius: 8,
  },
  boxtitle: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
  },
  icon: {
    width: 25,
    alignItems: "center",
  },
  titleReport: {
    color: "#2196F3",
  },
});
export default Report;
