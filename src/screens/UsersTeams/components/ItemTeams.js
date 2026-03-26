import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import { AntDesign } from "@expo/vector-icons";

import { deleteTeams } from "../../../redux/actions/UsersTeams/teams.actions";

import ModalDelete2 from "../../../components/Modal/ModalDelete2";
import { NavigationService } from "../../../navigator";
import InitialUser from "../../../components/InitialUser";
import { modalStyle } from "../../../asset/style/components/modalStyle";

const ItemTeams = ({ data }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const teams = state.teams;
  const [modalDelete, setModalDelete] = useState(false);

  const handleDeletedById = (id) => {
    dispatch(deleteTeams(id));
  };
  useEffect(() => {
    if (teams) {
      setModalDelete(false);
    }
  }, [teams]);

  return (
    <>
      <ModalDelete2
        id={data.id}
        description={"team.delete.modal.description.this"}
        deleted={handleDeletedById}
        modalDelete={modalDelete}
        setModalDelete={setModalDelete}
        data={data.name}
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
        }}
      >
        <TouchableOpacity
          style={{ width: "85%" }}
          onPress={() => {
            NavigationService.navigate("Users", {
              locationActive: "1",
              teamId: data.id,
            });
          }}
        >
          <Text style={{ fontSize: 20 }}>{data.name}</Text>
          <View style={{ flexDirection: "row", paddingTop: 10 }}>
            <InitialUser
              FirstName={data.teamLeadFirstName}
              LastName={data.teamLeadLastName}
              email={data.teamLeadEmail}
              color={data.teamLeadColor}
            />
            <View style={{ paddingLeft: 10 }}>
              <Text>
                {data?.teamLeadFirstName} {data?.teamLeadLastName} (
                <FormattedMessage id="team.leader" />)
              </Text>
              <Text>{data?.teamLeadEmail}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalDelete(true)}>
          <View style={[modalStyle.btnCircle, { marginTop: 10 }]}>
            <AntDesign name="delete" size={20} color="#6c757d" />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ItemTeams;
