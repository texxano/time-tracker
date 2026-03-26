import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Switch,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { FormattedMessage } from "react-intl";
import { Button } from "native-base";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { updateNotifications } from "../../redux/actions/UsersTeams/user.actions";
// Redux

// Components
import HeaderProfile from "./components/HeaderProfile";
// Components
import { profileStyle } from "../../asset/style/Profile/profileStyle";
import AppContainerClean from "../../components/AppContainerClean";

export const NotificationEdit = ({ data }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const [application, setNotifyApplication] = useState(data?.application);
  const [mobile, setNotifyMobile] = useState(data?.mobile);
  const [email, setNotifyEmail] = useState(data?.email);
  const [web, setNotifyWeb] = useState(data?.web);
  const [saveStatus, setSaveStatus] = useState(false);
  const request = state.user.userRequest;

  useEffect(() => {
    setNotifyApplication(data?.application);
    setNotifyEmail(data?.email);
    setNotifyWeb(data?.web);
    setNotifyMobile(data?.mobile);
  }, [data]);
  const handleNotifyGlobal = () => {
    const payload = { id: data.id, application, mobile, email, web };
    dispatch(updateNotifications(payload));
  };
  useEffect(() => {
    if (
      data?.application !== application ||
      data?.email !== email ||
      data?.web !== web ||
      data?.mobile !== mobile
    ) {
      setSaveStatus(true);
    } else {
      setSaveStatus(false);
    }
  }, [data, application, email, web, mobile]);

  return (
    <>
      <View>
        <View style={profileStyle.boxNotifications}>
          <Text style={profileStyle.textNotifications}>
            <FormattedMessage id="application.notification" />
          </Text>
          <Switch
            trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
            thumbColor={application ? "#007bff" : "#f4f3f4"}
            ios_backgroundColor="#7d7d7d"
            onValueChange={() => setNotifyApplication(!application)}
            value={application}
          />
        </View>
        <View style={profileStyle.boxNotifications}>
          <Text style={profileStyle.textNotifications}>
            <FormattedMessage id="mobile.notification" />
          </Text>
          <Switch
            trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
            thumbColor={mobile ? "#007bff" : "#f4f3f4"}
            ios_backgroundColor="#7d7d7d"
            onValueChange={() => setNotifyMobile(!mobile)}
            value={mobile}
          />
        </View>
        <View style={profileStyle.boxNotifications}>
          <Text style={profileStyle.textNotifications}>
            <FormattedMessage id="web.notification" />
          </Text>
          <Switch
            trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
            thumbColor={web ? "#007bff" : "#f4f3f4"}
            ios_backgroundColor="#7d7d7d"
            onValueChange={() => setNotifyWeb(!web)}
            value={web}
          />
        </View>
        <View style={profileStyle.boxNotifications}>
          <Text style={profileStyle.textNotifications}>
            <FormattedMessage id="email.notification" />
          </Text>
          <Switch
            trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
            thumbColor={email ? "#007bff" : "#f4f3f4"}
            ios_backgroundColor="#7d7d7d"
            onValueChange={() => setNotifyEmail(!email)}
            value={email}
          />
        </View>
        {saveStatus ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginVertical: 20,
            }}
          >
            <Button
              style={[profileStyle.button, profileStyle.buttonAdd]}
              w="30%"
              onPress={handleNotifyGlobal}
            >
              {request ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "#fff" }}>
                  <FormattedMessage id="common.button.save" />
                </Text>
              )}
            </Button>
          </View>
        ) : (
          <></>
        )}
      </View>
    </>
  );
};
export const CollapsibleView = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableWithoutFeedback onPress={toggleCollapse}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            backgroundColor: "#fff",
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 20, color: "#111" }}>
            <FormattedMessage id={title} />
          </Text>
        </View>
      </TouchableWithoutFeedback>
      {collapsed ? (
        <View
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: "#ccc",
            borderBottomLeftRadius: 5,
            borderBottomrightRadius: 5,
            backgroundColor: "#fff",
            paddingHorizontal: 15,
            paddingTop: 20
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
};

const NotificationsSettings = () => {
  const state = useSelector((state) => state);
  const user = state.user;
  const userRequest = state.user.userRequest;
  const vacationEnabled = state.userDataModule?.vacationEnabled;
  const timeTrackerEnabled = state.userDataModule?.timeTrackerEnabled;
  const shotgunEnabled = state.userDataModule?.shotgunEnabled;
  const gpsEnabled = state.userDataModule?.gpsEnabled;
  const documentEnabled = state.userDataModule?.documentEnabled;
  const openAiEnabled = state.userDataModule?.openAiEnabled;
  const calendarmEnabled = state.userDataModule?.calendarmEnabled;
  const moneyTrackerEnabled = state.userDataModule?.moneyTrackerEnabled;
  const documentTaskEnabled = state.userDataModule?.documentTaskEnabled;
  const [dataNotifications, setDataNotifications] = useState([]);

  useEffect(() => {
    if (!userRequest) {
      if (user) {
        http.get(`/notifications/preferences`).then((data) => {
          setDataNotifications(data);
        });
      }
    }
  }, [ user]);

  return (
    <AppContainerClean location={"Profile"}>
      <HeaderProfile location={"Settings"} />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, minHeight: 'auto' }}>
      <View style={profileStyle.boxtile}>
        <Text style={profileStyle.title}>
          <FormattedMessage id="Activity.Notifications" />
        </Text>
      </View>
      <CollapsibleView title={"Main.Module"}>
        <NotificationEdit
          data={dataNotifications?.find((x) => x.category === 1000)}
        />
      </CollapsibleView>

      {timeTrackerEnabled ? (
        <CollapsibleView title={"Time.Tracks"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 6000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {shotgunEnabled ? (
        <CollapsibleView title={"shotgun.task.title"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 5000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {documentTaskEnabled ? (
        <CollapsibleView title={"document.task.tilte"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 10000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {moneyTrackerEnabled ? (
        <CollapsibleView title={"money-tracker.tab.title"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 9000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {calendarmEnabled ? (
        <CollapsibleView title={"calendar.tilte"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 8000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {documentEnabled ? (
        <CollapsibleView title={"document.mudul.tilte"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 2000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {openAiEnabled ? (
        <CollapsibleView title={"openai.mudul.tilte"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 4000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      {/* {gpsEnabled ? (
        <CollapsibleView title={"gps.track.title"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 3000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )} */}
      {vacationEnabled ? (
        <CollapsibleView title={"vacation.tilte"}>
          <NotificationEdit
            data={dataNotifications?.find((x) => x.category === 7000)}
          />
        </CollapsibleView>
      ) : (
        <></>
      )}
      </View>
      </ScrollView>
    </AppContainerClean>
  );
};
export default NotificationsSettings;
