// /* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { FormattedMessage } from "react-intl";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { taskCount } from "../../redux/actions/Task/task.actions";

// Redux
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";

import ItemContacts from "./components/contacts/ItemContacts";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { Entypo } from "@expo/vector-icons";
import colors from "../../constants/Colors";
import { globalStyles } from "../../asset/style/globalStyles";
import flex from "../../asset/style/flex.style";
import { my } from "../../asset/style/utilities.style";
import ContactForm from "./components/contacts/ContactForm";

const UsersTeamsContacts = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const teamsRequest = state.teams.teamsRequest;
  const contact = state.contact;

  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (contact) {
      setRequestApi(true);
      setDataResponse([]);
        http
          .get(
            `/contacts${
              currentPage ? `?page=${currentPage}` : ""
            }${search ? `&search=${search}` : ""}`
          )
          .then((data) => {
            if (data.list) {
              setRequestApi(false);
              setDataResponse(data.list);
              setPageIndex(data.pageIndex);
              setTotalPages(data.totalPages);
              setDataLength(data.list.length === 0);
              dispatch(taskCount(data.list.length));
            }
          })
          .catch((error) => {
            console.error('Error fetching contacts:', error);
            setRequestApi(false);
            setDataResponse([]);
            setDataLength(true);
            dispatch(taskCount(0));
          });
    }
  }, [contact, search, currentPage, teamsRequest]);

  const closeModal = () => {
    setShowModal(false);
  };


  return (
    <>
      <View
        style={{
          backgroundColor: "#ebf0f3",
          padding: 15,
          borderRadius: 5,
          height: "auto",
        }}
      >
        <View style={[flex.d_flex_center, flex.flex_start, my[3]]}>
          <Text style={globalStyles.screenTitle}>
            <FormattedMessage id="users.contacts" />{" "}
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={modalStyle.btnCircle}
          >
            <Entypo name="plus" size={24} color={colors.gray_400} />
          </TouchableOpacity>
          {showModal && (
            <ContactForm showModal={showModal} closeModal={closeModal} />
          )}
        </View>
        <Search
          onSearch={(value) => {
            setSearch(value);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          placeholder={"users.filter.contacts"}
        />
        <ScrollView
          style={{ maxHeight: 500 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {requestApi ? (
            <ActivityIndicator size="large" color="#6c757d" />
          ) : (
            <></>
          )}
          {dataResponse?.map((data, index) => (
            <View key={data.id ? `contact-${data.id}` : `contact-index-${index}`}>
              <ItemContacts data={data} />
            </View>
          ))}
          {dataLength ? (
            <Text style={{ paddingTop: 10 }}>
              <FormattedMessage id="users.contacts.noItems" />{" "}
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
        </ScrollView>
      </View>
    </>
  );
};

export default UsersTeamsContacts;
