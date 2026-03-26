import React, { useEffect, useState } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Text, Modal, TouchableOpacity, View, Pressable } from "react-native";
import { FormattedMessage } from "react-intl";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser,
  lockUser,
  unlockUser,
} from "../../../redux/actions/UsersTeams/user.actions";
import { deleteAllPermissions } from "../../../redux/actions/Permissions/permissions.actions";
// Redux
import { modalStyle } from "../../../asset/style/components/modalStyle";
import ModalEditUser from "./ModalEditUser";
import ModalReport from "../../../components/Modal/ModalReport";
import ModalDelete2 from "../../../components/Modal/ModalDelete2";

const ModalMoreEditUser = ({ dataUser }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const user = state.user;
  const isAdministrator = state.userDataRole?.isAdministrator;
  const permissionsState = state.permissions;
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalDeleteUser, setModalDeleteUser] = useState(false);

  useEffect(() => {
    setModalEditVisible(false);
    setModalDeleteUser(false);
  }, [user, permissionsState]);

  const handleDeleteUser = (id) => {
    dispatch(deleteUser(id));
  };
  const handleLockUser = (id) => {
    dispatch(lockUser(id));
  };
  const handleUnLockUser = (id) => {
    dispatch(unlockUser(id));
  };
  const handleDeleteAllPermissions = (id) => {
    dispatch(deleteAllPermissions(id));
  };
  const handleModalVisible = () => {
    setModalEditVisible(!modalEditVisible);
  };
  const [modalGetReport, setModalGetReport] = useState(false);
  return (
    <>
      <Modal animationType="fade" transparent={true} visible={modalEditVisible}>
        <ModalDelete2
          id={dataUser.id}
          data={`${dataUser.firstName} ${dataUser.lastName}`}
          description={"users.delete.modal.description"}
          deleted={handleDeleteUser}
          modalDelete={modalDeleteUser}
          setModalDelete={setModalDeleteUser}
        />
        <View style={modalStyle.centeredViewSmall}>
          <View style={modalStyle.modalViewEditUser}>
            <View style={modalStyle.modalEditUserClose}>
              <Text
                style={{ fontWeight: "bold", fontSize: 14, color: "#6c757d" }}
              >
                {dataUser.firstName} {dataUser.lastName}
              </Text>
              <Pressable onPress={() => setModalEditVisible(!modalEditVisible)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </Pressable>
            </View>
            {!dataUser.isLocked ? (
              <TouchableOpacity
                style={modalStyle.modalTitleEditView}
                onPress={() => handleLockUser(dataUser.id)}
              >
                <Text style={modalStyle.modalMoreTitlekUser}>
                  <FormattedMessage id="common.button.lock" />
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={modalStyle.modalTitleEditView}
                onPress={() => handleUnLockUser(dataUser.id)}
              >
                <Text style={modalStyle.modalMoreTitlekUser}>
                  <FormattedMessage id="common.button.unLock" />{" "}
                </Text>
              </TouchableOpacity>
            )}
            <ModalEditUser dataUser={dataUser} openFromModal={true} />
            <TouchableOpacity
              style={modalStyle.modalTitleEditView}
              onPress={() => handleDeleteAllPermissions(dataUser.id)}
            >
              <Text style={modalStyle.modalMoreTitlekUser}>
                <FormattedMessage id="users.operation.remove.all.permissions" />
              </Text>
            </TouchableOpacity>
            {!isAdministrator ? (
              <ModalReport
                reportFor={3}
                modalGetReport={modalGetReport}
                setModalGetReport={setModalGetReport}
                userId={dataUser.id}
              />
            ) : (
              <></>
            )}
            <TouchableOpacity
              style={modalStyle.modalTitleEditView}
              onPress={() => setModalDeleteUser(true)}
            >
              <Text style={modalStyle.modalMoreTitlekUserDelete}>
                <FormattedMessage id="users.operation.delete" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={handleModalVisible}>
        <Text>
          <Feather name="more-vertical" size={24} color="#6c757d" />
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default ModalMoreEditUser;
