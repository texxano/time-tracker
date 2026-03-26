// /* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { FormattedMessage } from "react-intl";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { deleteMember } from "../../redux/actions/UsersTeams/teams.actions";
import { NavigationService } from "../../navigator";

import InitialUser from "../../components/InitialUser";
import ModalDelete2 from "../../components/Modal/ModalDelete2";
import { modalStyle } from "../../asset/style/components/modalStyle";
import { globalStyles } from "../../asset/style/globalStyles";

export const ItemMember = ({ data, teamId, teamLeadId }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const teams = state.teams;
  const userId = state.userDataRole.userId;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const isEditorForRoot = state.userDataRole?.isEditorForRoot;

  const [modalDelete, setModalDelete] = useState(false);
  const handleDeletedById = (id) => {
    const payload = { id, teamId };
    if (data.id && id) {
      dispatch(deleteMember(payload));
    }
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
        description={"team.members.delete.modal.description.this"}
        deleted={handleDeletedById}
        modalDelete={modalDelete}
        setModalDelete={setModalDelete}
        data={`${data.firstName} ${data.lastName}`}
      />
      {teamLeadId !== data.id ? (
        <View
          style={{
            backgroundColor: "#fff",
            marginBottom: 8,
            padding: 8,
            marginVertical: 5,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", paddingTop: 3 }}>
            <InitialUser
              FirstName={data.firstName}
              LastName={data.lastName}
              email={data.email}
              color={data.color}
            />
            <View style={{ paddingLeft: 10 }}>
              <Text>
                {data.firstName} {data.lastName}
              </Text>
              <Text>{data?.email}</Text>
            </View>
            {/* <ModalLeadMember type={1} teamId={dataResponse.id} /> */}
          </View>
          {teamLeadId === userId || isOwnerForRoot || isEditorForRoot ? (
            <TouchableOpacity
              onPress={() => setModalDelete(true)}
              style={modalStyle.btnCircle}
            >
              <MaterialIcons name="delete" size={20} color="#6c757d" />
            </TouchableOpacity>
          ) : (
            ""
          )}
        </View>
      ) : null}
    </>
  );
};
const TeamsUserList = ({ teamId }) => {
  const state = useSelector((state) => state);
  const teamsRequest = state.teams.teamsRequest;
  const teams = state.teams;
  const [dataResponse, setDataResponse] = useState(null);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    if (!teamsRequest) {
      setRequestApi(true);
      http
        .get(`/teams/${teamId}`)
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data);
        })
        .catch((error) => {
          console.error("Error fetching team data:", error);
          setRequestApi(false);
          setDataResponse(null);
        });
    }
  }, [teamsRequest, teamId, teams]);

  return (
    <>
      <View style={{ alignItems: "flex-end", paddingBottom: 10 }}>
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate("Users", {
              locationActive: "1",
              teamId: "",
            });
          }}
          style={globalStyles.rowSpaceBetweenAlignItems}
        >
          <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: "#ebf0f3",
          padding: 15,
          borderRadius: 5,
          height: "auto",
        }}
      >
        {requestApi ? (
          <ActivityIndicator size="large" color="#6c757d" />
        ) : (
          <></>
        )}
        {dataResponse?.name ? (
          <>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  paddingBottom: 10,
                  marginBottom: 10,
                  color: "#6c757d",
                  fontWeight: "600",
                }}
              >
                <FormattedMessage id="team.name" />: {dataResponse?.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#fff",
                marginBottom: 10,
                padding: 8,
                marginVertical: 5,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
              }}
            >
              <InitialUser
                FirstName={dataResponse?.teamLeadFirstName}
                LastName={dataResponse?.teamLeadLastName}
                email={dataResponse?.teamLeadEmail}
                color={dataResponse?.teamLeadColor}
              />
              <View style={{ paddingLeft: 10 }}>
                <Text>
                  {dataResponse?.teamLeadFirstName}{" "}
                  {dataResponse?.teamLeadLastName} (
                  <FormattedMessage id="team.leader" />)
                </Text>
                <Text>{dataResponse?.teamLeadEmail}</Text>
              </View>
              <FontAwesome
                name="star"
                size={24}
                color="#ffca00"
                style={{ paddingLeft: 10 }}
              />
              {/* <ModalLeadMember type={1} teamId={dataResponse.id} /> */}
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: "#ccc",
                paddingTop: 15,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  paddingBottom: 10,
                  color: "#6c757d",
                  fontWeight: "600",
                }}
              >
                <FormattedMessage id="team.members" />
              </Text>
              {/* <ModalLeadMember type={0} teamId={dataResponse.id} /> */}
            </View>
            <View style={{ height: 400 }}>
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 20 }}
                nestedScrollEnabled={true}
              >
                {dataResponse?.teamMembers?.map((data, index) => (
                  <View key={data.id ? `member-${data.id}` : `member-index-${index}`}>
                    <ItemMember
                      data={data}
                      teamId={dataResponse?.id}
                      teamLeadId={dataResponse.teamLeadId}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <></>
        )}
      </View>
    </>
  );
};

export default TeamsUserList;
