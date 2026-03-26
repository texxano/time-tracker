import React from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  MaterialCommunityIcons,
  AntDesign,
  Fontisto,
  Feather,
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Entypo,
  FontAwesome6
} from "@expo/vector-icons";

import {
  logout,
  logoutAll,
} from "../../redux/actions/Authentication/userAuth.actions";
import {
  deleteByIdDevice,
  deleteAllDevice,
} from "../../redux/actions/Notifications/devices.actions";

import { NavigationService } from "../../navigator";
import LanguageSelect from "../LanguageSelect";
import { check } from "../../utils/statusUser";
import { styles } from '../../asset/style/components/sidebar'

const Sidebar = ({ isOpen, toggleDrawer, location }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const refreshToken = state.userToken.refreshToken;

  const userId = state.userDataRole.userId;
  const idDevice = state.idDevice.idDevice;

  const vacationEnabled = state.userDataModule?.vacationEnabled;
  const vacationIsSupervisor = state.userDataModule?.vacationIsSupervisor;
  const timeTrackerEnabled = state.userDataModule?.timeTrackerEnabled;
  const shotgunEnabled = state.userDataModule?.shotgunEnabled;
  const calendarmEnabled = state.userDataModule?.calendarmEnabled;
  const openAiEnabled = state.userDataModule?.openAiEnabled;
  const moneyTrackerEnabled = state.userDataModule?.moneyTrackerEnabled;
  const gpsEnabled = state.userDataModule?.gpsEnabled
  const documentTaskEnabled = state.userDataModule?.documentTaskEnabled;

  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const isEditorForRoot = state.userDataRole.isEditorForRoot;
  const teamId = state.userDataRole.teamId;

  const handleCloseDrawer = () => {
    if (isOpen) {
      toggleDrawer();
    }
  };

  const handleLogoutAll = () => {
    dispatch(deleteAllDevice());
    dispatch(logoutAll());
  };
  const handleLogout = () => {
    if (idDevice) {
      dispatch(deleteByIdDevice(idDevice));
    }
    if (!refreshToken || !userId) {
      dispatch(logout());
      return;
    }

    const payload = {
      token: refreshToken,
      userId,
    };

    dispatch(logout(payload));
  };

  return (
    <View style={[styles.drawerContainer, isOpen ? styles.open : null]}>
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => handleCloseDrawer()}
        />
      )}
      <View style={styles.container}>
        {isOpen && (
          <View style={styles.drawer}>
            <ScrollView>
              <View style={{marginBottom: 250}}>
                {/* Hidden menu items - keeping only: Logout, Logout All, More Info, User Account Settings */}
                {/* 
                <TouchableOpacity
                  onPress={() => {
                    handleCloseDrawer();
                    NavigationService.navigate("Dashboard");
                  }}
                  style={[styles.drawerItem, { backgroundColor: location === 'Dashboard' ? '#ebf0f3' : 'f9fafb' }]}
                >
                  <MaterialCommunityIcons name="folder-home-outline" size={20} color="#6c757d" />
                  <Text style={styles.itemNavigate}>
                    <FormattedMessage id="dashboard.title" />
                  </Text>
                </TouchableOpacity>
                {timeTrackerEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Time", {
                        locationActive: "",
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Time' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <MaterialCommunityIcons
                      name="account-clock-outline"
                      size={20}
                      color="#6c757d"
                    />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="Time.Tracks" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {shotgunEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Task", { locationActive: "" });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Task' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <FontAwesome name="tasks" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="shotgun.task.title" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {documentTaskEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("DocumentTask", { locationActive: "" });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'DocumentTask' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <FontAwesome6 name="file-clipboard" size={20} color="#6c757d" />
                    <Feather name="list" size={9} color="#6c757d" style={{ marginLeft: -12, marginBottom: 2 }} />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="document.task.tilte" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {moneyTrackerEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("MoneyTracker", {
                        locationActive: "",
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'MoneyTracker' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <Ionicons name="cash-outline" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="money-tracker.tab.title" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {calendarmEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Calendar", {
                        location: "Dashboard", locationActive: ""
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Calendar' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <AntDesign name="calendar" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="calendar.tilte" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {gpsEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Gps", {
                        locationActive: ""
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Gps' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <Entypo name="location" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="gps.track.title" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {openAiEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("OpenAi", {
                        locationActive: "",
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'OpenAi' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <AntDesign name="earth" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="openai.mudul.tilte" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {vacationEnabled ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Vacation", {
                        locationActive: vacationIsSupervisor ? "0" : "",
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Vacation' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <Fontisto name="umbrella" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="vacation.tilte" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={() => {
                    handleCloseDrawer();
                    NavigationService.navigate("ChatRoomList");
                  }}
                  style={[styles.drawerItem, { backgroundColor: location === 'ChatRoomList' ? '#ebf0f3' : 'f9fafb' }]}
                >
                  <MaterialCommunityIcons name="chat" size={20} color="#6c757d" />
                  <Text style={styles.itemNavigate}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleCloseDrawer();
                    NavigationService.navigate("Report", {
                      location: "Dashboard",
                    });
                  }}
                  style={[styles.drawerItem, { backgroundColor: location === 'Report' ? '#ebf0f3' : 'f9fafb' }]}
                >
                  <AntDesign name="filetext1" size={20} color="#6c757d" />
                  <Text style={styles.itemNavigate}>
                    <FormattedMessage id="projects.reports" />
                  </Text>
                </TouchableOpacity>
                {!isOwnerForRoot && !isEditorForRoot && teamId ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Users", {
                        locationActive: "2",
                        teamId: teamId,
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Users' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <Feather name="users" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="my.team" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {isOwnerForRoot || isEditorForRoot ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDrawer();
                      NavigationService.navigate("Users", {
                        locationActive: "0",
                      });
                    }}
                    style={[styles.drawerItem, { backgroundColor: location === 'Users' ? '#ebf0f3' : 'f9fafb' }]}
                  >
                    <Feather name="users" size={20} color="#6c757d" />
                    <Text style={styles.itemNavigate}>
                      <FormattedMessage id="projects.tabs.users.title" />
                    </Text>
                  </TouchableOpacity>
                ) : null}
                */}
              </View>
            </ScrollView>
            <View style={styles.bottomContainer}>
              <LanguageSelect />

              <TouchableOpacity
                onPress={() => {
                  handleCloseDrawer();
                  NavigationService.navigate("Profile", { locationActive: "" });
                }}
                style={[styles.drawerItemBottom, { backgroundColor: location === 'Profile' ? '#ebf0f3' : 'f9fafb' }]}
              >
                <MaterialIcons
                  name="manage-accounts"
                  size={20}
                  color="#6c757d"
                />
                <Text style={styles.itemNavigate}>
                  <FormattedMessage id="user.account.settings" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleCloseDrawer();
                  NavigationService.navigate("Overview", {
                    location: "Dashboard",
                  });
                }}
                style={[styles.drawerItemBottom, { backgroundColor: location === 'Overview' ? '#ebf0f3' : 'f9fafb' }]}

              >
                <AntDesign name="infocirlceo" size={20} color="#6c757d" />
                <Text style={styles.itemNavigate}>
                  <FormattedMessage id="more.info" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleCloseDrawer();
                  handleLogout();
                }}
                style={styles.drawerItemBottom}
              >
                <Feather name="log-out" size={20} color="#f44336" />
                <Text style={[styles.itemNavigate, {}]}>
                  <FormattedMessage id="common.button.logout" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleCloseDrawer();
                  handleLogoutAll();
                }}
                style={styles.drawerItemBottom}
              >
                <Feather name="log-out" size={20} color="#f44336" />
                <Text style={[styles.itemNavigate, { fontSize: 14 }]}>
                  <FormattedMessage id="common.button.logout.all" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Sidebar;
