import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { FormattedMessage } from "react-intl";
import { Feather } from "@expo/vector-icons";
import flex from "../../../../asset/style/flex.style";
import { ml, mr, mt, p, px } from "../../../../asset/style/utilities.style";
import ContactsDefault from "./ContactsDefault";
import ContactForm from "./ContactForm";
import ModalDelete3 from "../../../../components/Modal/ModalDelete3";
import { deleteContact } from "../../../../redux/actions/UsersTeams/contacts.actions";
import { useDispatch } from "react-redux";
import useDebounce from "../../../../hooks/useDebounce";

const ItemContacts = ({ data }) => {
  const dispatch = useDispatch();
  const [showDefaultModalContent, setDefaultShowModalContent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [debouncedFunction] = useDebounce(showEdit, 400);
  const closeModal = () => {
    setDefaultShowModalContent(false);
    setShowDeleteModal(false);
    setShowEditModal(false);
  };
  const handleDelete = (id) => {
    dispatch(deleteContact(id));
    closeModal();
  };

  function showEdit () { 
    setDefaultShowModalContent(false);
    setShowDeleteModal(false);
    setShowEditModal(true);
  }

  return (
    <View style={[{position:'relative'}]}>
      <ContactsDefault
        data={data}
        closeModal={closeModal}
        showModal={showDefaultModalContent}
        showEdit={debouncedFunction}
        showDelete={() => {
          setDefaultShowModalContent(false);
          setShowDeleteModal(true);
          setShowEditModal(false);
        }}
      />

      <ContactForm
        editMode={true}
        data={data}
        closeModal={closeModal}
        showModal={showEditModal}
      />

      <ModalDelete3
        id={data.id}
        showModal={showDeleteModal}
        closeModal={closeModal}
        deleted={handleDelete}
        description="users.contacts.delete"
      />

      <View
        style={{
          backgroundColor: "#fff",
          marginBottom: 8,
          padding: 10,
          marginVertical: 5,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          flexDirection: "row",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <View style={{ width: "100%" }}>
          <View style={[flex.d_flex_center, flex.d_flex_between]}>
            <Text style={{ fontSize: 18, width: "70%" }}>{data.name}</Text>

            <Text
              style={[
                {
                  fontSize: 12,
                  backgroundColor: "#0097A7",
                  color: "white",
                  borderRadius: 15,
                  fontWeight: "bold",
                },
                mr[2],
                p[1],
                px[2],
              ]}
            >
              {data?.type === 0 && (
                <FormattedMessage id="users.contacts.company" />
              )}

              {data?.type === 1 && (
                <FormattedMessage id="users.contacts.person" />
              )}
            </Text>
          </View>

          {data.email && (
            <View style={[mt[2], flex.flex_start, flex.flex_direction_row]}>
              <Text style={{ fontWeight: "bold" }}>
                <FormattedMessage id="projects.form.users.email.placeholder" />:
              </Text>
              <Text style={[ml[2]]}>{data.email}</Text>
            </View>
          )}
          {data.phoneNumber && (
            <View style={[mt[2], flex.flex_start, flex.flex_direction_row]}>
              <Text style={{ fontWeight: "bold" }}>
                <FormattedMessage id="projects.form.users.phoneNumber.placeholder" />
                :
              </Text>
              <Text style={[ml[2]]}>{data.phoneNumber}</Text>
            </View>
          )}
          {data.address && (
            <View style={[mt[2], flex.flex_start, flex.flex_direction_row]}>
              <Text style={{ fontWeight: "bold" }}>
                <FormattedMessage id="projects.form.address.placeholder" />:
              </Text>
              <Text style={[ml[2]]}>{data.address}</Text>
            </View>
          )}
          {data.uniqueCountryNumber && (
            <View style={[mt[2], flex.flex_start, flex.flex_direction_row]}>
              <Text style={{ fontWeight: "bold" }}>
                <FormattedMessage id="unique.country.number" />:
              </Text>
              <Text style={[ml[2]]}>{data.uniqueCountryNumber}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: "50%",
          right: 5,
          zIndex: 999,
          elevation: 8,
        }}
        onPress={() => {
          setDefaultShowModalContent(true);
          setShowDeleteModal(false);
          setShowEditModal(false);
        }}
      >
        <Text>
          <Feather name="more-vertical" size={24} color="#6c757d" />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ItemContacts;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background for modal
  },
});
