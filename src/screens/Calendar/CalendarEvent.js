import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons, Entypo, AntDesign } from "@expo/vector-icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Calendar } from "react-native-big-calendar";
import { Checkbox } from "native-base";
import DropDownPicker from "react-native-dropdown-picker";

import { NavigationService } from "../../navigator";
import http from "../../services/http";
import { auth, check } from "../../utils/statusUser";
import { dateFormat } from "../../utils/dateFormat";

import ViewEventModal from "./components/ViewEventModal";
import AddGuests from "./components/AddGuests";
import InitialUser from "../../components/InitialUser";
import { pickColor } from "../../components/InitialUser";
import { globalStyles } from "../../asset/style/globalStyles";
import { styles } from "./Calendar.Styles";
import { modalStyle } from "../../asset/style/components/modalStyle";
import flex from "../../asset/style/flex.style";
import { generateUUID } from "../../utils/variousHelpers";
import colors from "../../constants/Colors";

// headerHeight = 80
// viewHeader 40

const CalendarView = (route) => {
  const { height } = useWindowDimensions();
  const navigateFrom = route?.navigation?.state?.params?.location;
  const state = useSelector((state) => state);
  const countryCode = state.userData?.countryCode;
  const calendarState = state.calendar;
  const [requestApi, setRequestApi] = useState(true);
  const [moreOption, setMoreOption] = useState(false);
  const userId = state.userDataRole.userId;

  const [calendarMode, setCalendarMode] = useState("week");
  const intl = useIntl();

  const calendarOptions = [
    { label: intl.formatMessage({ id: "Calendar.Month" }), value: "month" },
    { label: intl.formatMessage({ id: "Calendar.Week" }), value: "week" },
    { label: intl.formatMessage({ id: "Calendar.Days" }), value: "3days" },
  ];
  const [open, setOpen] = useState(false);

  const [showHolidays, setShowHolidays] = useState(false);
  const [modalViewEvent, setModalViewEvent] = useState(false);
  const [idEvent, setIdEvent] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const [onNavigateStart, setOnNavigateStart] = useState(
    new Date(firstDayOfMonth)
  );
  const [onNavigateStop, setOnNavigateStop] = useState(
    new Date(lastDayOfMonth)
  );
  const [events, setEvents] = useState([]);
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let nameMonth = month[onNavigateStart.getMonth()];
  let year = onNavigateStart.getFullYear();

  const colorEvent = (event) => {
    if (event.nationalHolidayOfCountry) {
      return "#fa002d";
    } else if (event.isPrivate) {
      return "#0084e5";
    } else {
      return "#00a882";
    }
  };

  const getEventsInRange = (start, end, removeGuest = false) => {
    if (start && end) {
      setOnNavigateStart(new Date(start));
      setOnNavigateStop(new Date(end));
      setRequestApi(true);
      try {
        http
          .get(
            `/calendarm/events?From=${dateFormat(start)}&To=${dateFormat(end)}${
              showHolidays
                ? `&ShowUsersCountryNationalHolidays=true${
                    countryCode ? `&CountryCode=${countryCode}` : ""
                  }`
                : ""
            }`
          )
          .then((data) => {
            const eventsWithDateObjects = data?.map((event) => ({
              start: new Date(event.start),
              end: new Date(event.end),
              title: event.title,
              id: event.id,
              color: colorEvent(event),
            }));

            const updatedEvents = removeGuest
              ? []
              : events.filter((x) => x.id !== userId);
            const combine = [...updatedEvents, ...eventsWithDateObjects]
            setEvents(combine.filter((event, index, self) =>
              index === self.findIndex((e) => e.id === event.id)
            ));
            

            setRequestApi(false);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getGuestEvent = (start, end, guestId, color) => {
    http
      .get(
        `/calendarm/events/${guestId}/users/?From=${dateFormat(
          start
        )}&To=${dateFormat(end)}${
          showHolidays
            ? `&ShowUsersCountryNationalHolidays=true${
                countryCode ? `&CountryCode=${countryCode}` : ""
              }`
            : ""
        }`
      )
      .then((data) => {
        const eventsWithDateObjects = data.map((event) => ({
          ...event,
          id: guestId,
          isGuestCalendarEvent: true,
          start: new Date(
            event.isAllDay
              ? new Date(event.start).toISOString().split("T")[0] +
                "T00:00:00.000"
              : event.start
          ),
          end: new Date(
            event.isAllDay
              ? new Date(event.end).toISOString().split("T")[0] +
                "T00:00:00.000"
              : event.end
          ),
          color: color,
        }));
        setEvents((prevEvents) => [
          ...prevEvents.filter(
            (event) => !event.isGuestCalendarEvent || event.id !== guestId
          ),
          ...eventsWithDateObjects,
        ]);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  };

  useEffect(() => {


      getEventsInRange(onNavigateStart, onNavigateStop, true);
    
  }, [calendarState, showHolidays]);

  const onPressDateByMonth = (type) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        type ? prevDate.getMonth() + 1 : prevDate.getMonth() - 1,
        1
      );
      setOnNavigateStart(
        new Date(newDate.getFullYear(), newDate.getMonth(), 1)
      );
      setOnNavigateStop(
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)
      );
      getEventsInRange(
        newDate,
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)
      );
      return newDate;
    });
  };
  

  const onPressEvent = (data) => {
    setIdEvent(data.id);
    setModalViewEvent(true);
  };

  // day
  // week
  // month

  const onPressDateByDays = (type) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + (type ? 3 : -3));
      setOnNavigateStart(newDate);
      setOnNavigateStop(newDate);
      getEventsInRange(newDate, newDate);
      return newDate;
    });
  };

  const onPressDateByWeek = (type) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + (type === 1 ? 7 : -7));

      const startDate = new Date(newDate);
      const stopDate = new Date(startDate);
      stopDate.setDate(startDate.getDate() + 6); // Set end date to 6 days ahead

      setOnNavigateStart(startDate);
      setOnNavigateStop(stopDate);
      getEventsInRange(startDate, stopDate);
      return newDate;
    });
  };

  const handlenavigation = (type) => {
    console.log(type,'type')
    if (calendarMode === "3days") {
      onPressDateByDays(type);
    } else if (calendarMode === "week") {
      onPressDateByWeek(type);
    } else {
      onPressDateByMonth(type);
    }
  };

  const handleChangeCalendarMode = (type) => {

    setCalendarMode(type);
    // handlenavigation(type);
  };

  const [guests1, setGuests1] = useState([]);

  const guestsPush = (value) => {
    let itemState = guests1.map((x) => {
      return x.id;
    });
    let existItem = itemState.find((x) => x === value.id);
    if (!existItem) {
      setGuests1([...guests1, value]);
      getGuestEvent(
        onNavigateStart,
        onNavigateStop,
        value.id,
        pickColor(value.firstName, value.lastName)
      );
    }
  };
  const handleRemoveguests = (id) => {
    let index = guests1
      .map((x) => {
        return x.id;
      })
      .indexOf(id);
    guests1.splice(index, 1);
    setGuests1([...guests1]);
  };
  const handleMoreOption = () => {
    setMoreOption(false);
  };
  const today = new Date();
  // Function to check if the current date is today
  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const renderEvent = (event, touchableOpacityProps) => (
    <TouchableOpacity {...touchableOpacityProps}>
      <View style={{backgroundColor:event.color, margin:-5, padding:5}} >
        <Text style={{color:colors.white}}>{event.title}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <>
      <ViewEventModal
        idEvent={idEvent}
        modalViewEvent={modalViewEvent}
        close={() =>setModalViewEvent(false)}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="calendar.tilte" />
        </Text>
        <View>
          <TouchableOpacity
            onPress={() => {
              NavigationService.navigate(navigateFrom || "Dashboard");
            }}
            style={globalStyles.rowSpaceBetweenAlignItems}
          >
            <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
            <Text style={{ fontSize: 20, color: "#6c757d" }}>
              <FormattedMessage id="money-tracker.scan.form.goBack" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 18 }}>
            {nameMonth} {year}
          </Text>
          <TouchableOpacity
            onPress={() => setMoreOption(!moreOption)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 17 }}>
              <FormattedMessage id="more.option.event.calendar" />
            </Text>
            <View style={globalStyles.btnCircle}>
              <AntDesign
                name={moreOption ? "up" : "down"}
                size={24}
                color="#6c757d"
              />
            </View>
          </TouchableOpacity>
        </View>
        {moreOption && (
          <View
            style={{
              minHeight: 300,
              backgroundColor: "#fff",
              paddingBottom: 5,
              borderRadius: 8,
              marginTop: 10,
              borderWidth: 0.5,
              borderColor: "#6c757d",
            }}
          >
            <View style={styles.itemMoreOption}>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate("Calendar", {
                    locationActive: "3",
                    id: "create",
                  });
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 17 }}>
                  <FormattedMessage id="create.new.event" />
                </Text>
                <View style={globalStyles.btnCircle}>
                  <Entypo name="plus" size={24} color="#6c757d" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={[styles.itemMoreOption, { height: open ? 200 : 70 }]}>
              <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={calendarMode}
                items={calendarOptions}
                setValue={(val) => handleChangeCalendarMode(val)}
                zIndex={999999999}
                style={{
                  fontSize: 13,
                  borderColor: "#dee2e6",
                  borderRadius: 5,
                  backgroundColor: "#fff",
                }}
                dropDownContainerStyle={{
                  borderColor: "#dee2e6",
                }}
                listItemLabelStyle={{
                  fontWeight: "500",
                  fontSize: 15,
                }}
                textStyle={{
                  fontWeight: "500",
                  fontSize: 15,
                }}
                dropDownDirection="AUTO"
              />
            </View>
            <View
              style={[
                styles.itemMoreOption,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 10,
                },
              ]}
            >
              <Text style={{ paddingRight: 5 }}>
                <FormattedMessage id="show.holidays" />
              </Text>
              <Checkbox
                onChange={() => setShowHolidays((prev) => !prev)}
                isChecked={showHolidays}
                colorScheme="green"
                size="sm"
              />
            </View>
            <View style={styles.itemMoreOption}>
              {guests1?.length ? (
                <>
                  <Text>
                    <FormattedMessage id="Guests" />
                  </Text>
                  {guests1?.map((data, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        borderColor: "#ccc",
                        marginVertical: 5,
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        paddingHorizontal: 8,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                        }}
                      >
                        <InitialUser
                          FirstName={data.firstName}
                          LastName={data.lastName}
                          email={data.email}
                          color={data.color}
                        />
                        <View>
                          <Text
                            style={{
                              fontSize: 16,
                              paddingLeft: 20,
                              fontWeight: "500",
                            }}
                          >
                            {data.firstName} {data.lastName}
                          </Text>
                          <Text style={{ fontSize: 13, paddingLeft: 20 }}>
                            {data.email}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveguests(data.id)}
                      >
                        <AntDesign
                          name="closecircleo"
                          size={24}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              ) : null}
              <AddGuests
                addGuests={(value) => {
                  guestsPush(value);
                }}
                dataSelect={guests1}
              />
            </View>
            <View style={[styles.itemMoreOption, { borderBottomWidth: 0 }]}>
              <TouchableOpacity
                onPress={() => handleMoreOption()}
                style={[modalStyle.button, modalStyle.buttonGreeanOutline]}
              >
                <Text style={modalStyle.textGreeanOutline}>
                  <FormattedMessage id="common.button.confirm" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View
          style={{
            backgroundColor: "#fff",
            paddingBottom: 5,
            borderRadius: 8,
            marginTop: 10,
            borderWidth: 0.5,
            borderColor: "#6c757d",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              margin: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => handlenavigation(0)}
              style={[globalStyles.btnCircle, { marginLeft: 0 }]}
              // disabled={requestApi}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}
              >
                {"<"} <FormattedMessage id="Previous" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlenavigation(1)}
              style={[globalStyles.btnCircle, { margin: 0 }]}
              // disabled={requestApi}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}
              >
                <FormattedMessage id="Next" /> {">"}
              </Text>
            </TouchableOpacity>
          </View>

          <Calendar
            events={events}
            mode={calendarMode}
            height={height - 320} // 260 is the approximately height of all headers together
            zIndex={1}
            showAdjacentMonths={false}
            swipeEnabled={false}
            showAllDayEventCell={true}
            isEventOrderingEnabled={false}
            scrollViewProps={{ nestedScrollEnabled: true }}
            date={currentDate} // Ensure this updates dynamically
            onPressEvent={onPressEvent}
            dayHeaderStyle={{
              backgroundColor: colors.white, // Header background color
              // padding: 10, // Padding inside the header
              borderRadius: 50, // Rounded corners
              justifyContent: "center", // Centering text
              alignItems: "center", // Centering text
            }}
            calendarContainerStyle={{ borderRadius: 25, elevation: 5 }}
            onStartShouldSetResponder={() => true}
            dayHeaderHighlightColor={colors.blue_200}
            weekDayHeaderHighlightColor={colors.blue_200}
            renderEvent={renderEvent}
            // renderEvent={(event, touchableOpacityProps) => (
            //   <TouchableOpacity
            //     // key={event.id}
            //     // {...touchableOpacityProps}
            //     style={{
            //        backgroundColor: event.color,

            //       padding: 5,
            //       borderRadius: 4,
            //       marginVertical: 2,
            //       flexShrink: 0,
            //     }}
            //   >
            //     <Text numberOfLines={1} style={{ color: "#fff" }}>
            //       {event.title}
            //     </Text>
            //   </TouchableOpacity>
            // )}
          />
        </View>
      </View>
    </>
  );
};

export default CalendarView;
