import React, { Fragment, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Feather, Entypo } from "@expo/vector-icons";

import Tooltip from "react-native-walkthrough-tooltip";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { NavigationService } from "../../../../navigator";
// Components
import InitialUser from "../../../../components/InitialUser";
import ProgressBarProject from "./ProgressBarProject";
import StatusProjectChange from "./StatusProjectChange";
import ModalManagerRootProject from "../ModalManagerRootProject";
import ModalManagerProject from "../ModalManagerProject";
import ModalDueDate from "../../../../components/Modal/ModalDueDate";
// Components
import { globalStyles } from "../../../../asset/style/globalStyles";
import FavoriteProjectComoponent from "./FavoriteProjectComoponent";
import { projectsTypes } from "../../../../redux/type/Project/project.types";
import { Pressable } from "native-base";
import { generateUUID } from "../../../../utils/variousHelpers";

const ItemProject = ({ data, navigateFrom }) => {
  const dispatch = useDispatch();
  const unauthorized = useSelector(
    (state) => state.getProjectData.unauthorized
  );
  const { top } = useSafeAreaInsets();
  const [showTip, setTip] = useState(false);


  const NavigationProject = (data) => {
    try {
      NavigationService.navigate("Project", {
        projectId: data.id,
        parentId: data.parentId,
        permissionCode: data.loggedUserPermissionCode,
        projectName: data.title,
        navigateFrom: navigateFrom,
      });
      if (unauthorized) {
        dispatch(clear("clear"));
      }
    } catch (error) {
      console.error('NavigationProject error:', error);
    }
  };
  function clear(data) {
    return { type: projectsTypes.GET_PROJECT_DATA_REQUEST, data };
  }
  return (
    <Pressable
      onPress={() => {
        try {

          NavigationProject(data);
        } catch (error) {

        }
      }}
      style={{ marginHorizontal: 15 }}
    >
      <ProgressBarProject data={data.percentageCompleted} />
      <View style={globalStyles.project}>
        <View style={globalStyles.rowSpaceBetween}>
          <View style={globalStyles.w86}>
            <View style={globalStyles.projectTitleBox}>
              {data.logoUrl ? (
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                  source={{ uri: data.logoUrl }}
                />
              ) : (
                <></>
              )}
              <Text style={globalStyles.projectTitle}>{data.title}</Text>
            </View>
            <Text>{data.description}</Text>
            {data.address ? (
              <Text>
                <FormattedMessage id="projects.form.address.placeholder" />:{" "}
                {data.address}{" "}
              </Text>
            ) : (
              <></>
            )}
          </View>
          <FavoriteProjectComoponent
            projectId={data.id}
            isFavorite={data.isFavorite}
          />
          {(() => {
            try {

              
              if (data.loggedUserPermissionCode === 3 && data.parentId === null) {
                return (
                  <ModalManagerRootProject
                    projectdata={data}
                  
                  />
                );
              } else {
                return (
                  <ModalManagerProject
                    projectdata={data}
                  />
                );
              }
            } catch (error) {
              console.error('Error rendering modal manager:', error);
              return null;
            }
          })()}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 10,
          }}
        >
          <ModalDueDate
            projectdata={data}
          />
        </View>
        <View style={globalStyles.bottomProject}>
          <View style={globalStyles.flexDirectionRow}>
            <View style={globalStyles.bottomProject2}>
              {data.users && data.users.slice(0, 4).map((dataUsers, index) => (
                <Fragment key={generateUUID(11)}>
                  <InitialUser
                    key={index}
                    style={{ paddingVertical: 0 }}
                    FirstName={dataUsers.firstName}
                    LastName={dataUsers.lastName}
                    email={dataUsers.email}
                    color={dataUsers.color}
                  />
                </Fragment>
              ))}
              {data.users && data.users.length >= 5 ? (
                <Tooltip
                  isVisible={showTip}
                  content={
                    <>
                      {data.users && data.users.slice(4).map((dataUsers) => (
                        <Fragment key={generateUUID(71)}>
                          <Text >
                            {dataUsers.firstName} {dataUsers.lastName}
                          </Text>
                        </Fragment>
                      ))}
                      <Text>...</Text>
                    </>
                  }
                  onClose={() => setTip(false)}
                  placement="top"
                  topAdjustment={Platform.OS === "android" ? -top : 0}
                >
                  <TouchableOpacity
                    onPress={() => setTip(true)}
                    style={globalStyles.morehorizontal}
                  >
                    <Feather name="more-horizontal" size={24} color="#6c757d" />
                  </TouchableOpacity>
                </Tooltip>
              ) : (
                <></>
              )}
            </View>
            {data.loggedUserPermissionCode === 3 ? (
              <TouchableOpacity
                style={globalStyles.btnCircle}
                onPress={() => {
                  NavigationService.navigate("UsersPermissions", {
                    projectId: data.id,
                    parentId: data.parentId,
                    permissionCode: data.loggedUserPermissionCode,
                    projectName: data.title,
                    navigateFrom: navigateFrom || "Project",
                  });
                }}
              >
                <MaterialIcons name="edit" size={22} color="#6c757d" />
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
          <View style={globalStyles.rowSpaceBetweenAlignItems}>
            <View>
              <StatusProjectChange
                projectdata={data}
              />
              {data.completedSubProjects !== "0/0" ? (
                <Text style={globalStyles.completedSubProjects}>
                  {data.completedSubProjects}
                </Text>
              ) : (
                <></>
              )}
            </View>
          </View>
        </View>
        {data.status === 3 && (
          <Text>
            <Entypo name="block" size={18} color="#dc3545" /> {data.blockReason}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default ItemProject;
