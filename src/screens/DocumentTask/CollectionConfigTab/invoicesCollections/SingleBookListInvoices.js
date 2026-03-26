import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Search from "../../../../components/Search";
import { ButtonCloseCircle } from "../../../../components/buttons/ButtonCloseCirlcle";
import Pagination from "../../../../components/Pagination";
import { RenderCards } from "../../Drafts/invoices/CountryCards/renderCards";
import { useSelector } from "react-redux";
import colors from "../../../../constants/Colors";
import http from "../../../../services/http";
import { SingleInvoice } from "../../Drafts/invoices/CountryCards/mk/renderCard/SingleInvoice";
import { my, p, px } from "../../../../asset/style/utilities.style";
import { TextH2 } from "../../../../components/Texts";
import { FormattedMessage } from "react-intl";

const SingleBookListInvoices = ({ id, type }) => {
  const state = useSelector((state) => state);
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [search, setSearch] = useState("");
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [singleItem, setSingleItem] = useState();

  useEffect(() => {
    if (type === "invoice") {
      if ( !documentTasksRequest) {
        setRequestApi(true);
        http
          .get(
            `/doctask/books/invoices/${id}${search ? `&search=${search}` : ""}`
          )
          .then((data) => {
       
            setRequestApi(false);
            setDataResponse(data.list);
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            setDataLength(data.list.length === 0);
          });
      }
    }
  }, [
    documentTasksRequest,
    currentPage,
    search,
    id,
    type,
  ]);

  const handlePress = (item) => {
    setSingleItem(item);
  };

  return (
    <View style={[styles.container, { flex: 1, position: "relative" }]}>
      <>
        {singleItem !== undefined ? (
          <View style={[p[3]]}>
            <SingleInvoice item={singleItem} close={() => setSingleItem()} />
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Search
                onSearch={(value) => {
                  setSearch(value);
                }}
                onPageChange={(page) => setCurrentPage(page)}
                placeholder={"document.task.collection.filter.title"}
              />
            </View>

            {type && type === "invoice" ? (
              <ScrollView style={[{ minHeight: 400 }]}>
                {dataResponse?.length > 0 &&
                  dataResponse.map((el) => (
                    <RenderCards
                      key={el.id}
                      item={el}
                      handlePress={handlePress}
                      viewMode
                    />
                  ))}
              </ScrollView>
            ) : (
              <Text style={{ paddingTop: 10 }}>
                <FormattedMessage id="notInvoice.Book" />
              </Text>
            )}

            {dataLength ? (
              <Text style={{ paddingTop: 10 }}>
                <FormattedMessage id="document.task.collection.noItems" />
              </Text>
            ) : (
              <></>
            )}
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
        )}
      </>
    </View>
  );
};

export default SingleBookListInvoices;
const styles = StyleSheet.create({
  box: {
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  taskContainer: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    padding: 8,
  },
  cellHeader: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    padding: 8,
  },
  innerTable: {
    borderColor: "#ccc",
    borderWidth: 1,
  },
  separator: {
    backgroundColor: "#efeff0",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  separatorText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});
