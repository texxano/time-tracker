import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import http from "../../../../services/http";
import { NavigationService } from "../../../../navigator";
import colors from "../../../../constants/Colors";

const InvoicesCollectionList = ({ reloadApi, search, currentPage }) => {
  const state = useSelector((state) => state);
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const [dataResponse, setDataResponse] = useState([]);

  useEffect(() => {
    if ( !documentTasksRequest) {
      // TODO  year
      http
        .get(`/doctask/books/invoices${search ? `&search=${search}` : ""}`)
        .then((data) => {
          setDataResponse(data.list);
        });
    }
  }, [
    documentTasksRequest,
    currentPage,
    search,
    reloadApi,
  ]);
  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        borderRadius: 5,
        height: "auto",
      }}
    >
      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              onPress={() =>
                NavigationService.navigate("DocumentTask", {
                  locationActive: "9",
                  id: item.id,
                  type: "invoice",
                })
              }
              key={index}
              style={[
                styles.box,
                { borderColor: "#ccc", backgroundColor: item.color },
              ]}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: colors.white,
                  fontWeight: "bold",
                }}
              >
                {item.name.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 16, color: colors.white }}>
                {item.creationYear}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.objectID}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  box: {
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default InvoicesCollectionList;
