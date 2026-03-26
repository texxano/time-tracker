import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import http from "../../../../services/http";
import { my } from "../../../../asset/style/utilities.style";
import { TextH2 } from "../../../../components/Texts";
import colors from "../../../../constants/Colors";
import { ButtonCloseCircle } from "../../../../components/buttons/ButtonCloseCirlcle";
import Pagination from "../../../../components/Pagination";
import Search from "../../../../components/Search";
import { SingleInvoice } from "./CountryCards/mk/renderCard/SingleInvoice";
import { RenderCards } from "./CountryCards/renderCards";


const DraftsInvoices = ({ setLocationActive }) => {
  const state = useSelector((state) => state);
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [search, setSearch] = useState("");
  const [dataLength, setDataLength] = useState(false);

  const [singleItem, setSingleItem] = useState();
  useEffect(() => {
    const getData = async () => {
      http
        .get(
          `/doctask/books/invoices/entries${search ? `&search=${search}` : ""}`
        )
        .then((data) => {
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        });
    };
    getData();
  }, [documentTasksRequest, currentPage, search]);

  const handlePress = (item) => {
    setSingleItem(item);
  };
  return (
    <View style={[styles.container, { flex: 1, position: "relative" }]}>
      <>
        {singleItem !== undefined ? (
          <SingleInvoice item={singleItem} close={() => setSingleItem()} />
        ) : (
          <>
            <View style={[ my[10]]}>
              <TextH2 text="document.task.collection.drafts.invoices.unalocated"/>
            </View>
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
            <ButtonCloseCircle
              handleClick={() => setLocationActive("0")}
              customStyles={{ position: "absolute", top: 5, right: 5 }}
            />
            <ScrollView style={[{ minHeight: 400 }]}>
              {dataResponse?.length > 0 &&
                dataResponse.map((el) => (
                  <RenderCards
                    key={el.id}
                    item={el}
                    handlePress={handlePress}
                  />
                ))}
            </ScrollView>
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

export default DraftsInvoices;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    backgroundColor: colors.gray_70,
  },
});
