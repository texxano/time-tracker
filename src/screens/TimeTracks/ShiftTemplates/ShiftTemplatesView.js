import React, { useEffect, useState, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

import DateTimePickerModal from "react-native-modal-datetime-picker";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../../services/http";
import { NavigationService } from "../../../navigator";

import {
  createDayInShiftTemplate,
  deleteDayShiftTemplate,
} from "../../../redux/actions/TimeTracks/timeShiftTemplates.actions";
import FormatDateTime from "../../../components/FormatDateTime";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import { styles } from "../../Calendar/Calendar.Styles";

export const ShiftTemplatesDays = ({ day, dayNr, id }) => {
  const dispatch = useDispatch();

  console.log(`📋 ShiftTemplatesDays rendered for day ${dayNr}:`, day ? `Has day (ID: ${day.id}, dayOfWeek: ${day.dayOfWeek})` : 'No day');

  const [startDate, setStartDate] = useState(
    new Date().setHours(day?.fromHour, day?.fromMin, 0, 0)
  );
  const [endDate, setEndDate] = useState(
    new Date().setHours(day?.toHour, day?.toMin, 0, 0)
  );
  useEffect(() => {
    console.log(`🔄 useEffect for day ${dayNr} triggered, day:`, day ? `ID: ${day.id}` : 'undefined');
    if (day) {
      setStartDate(new Date().setHours(day?.fromHour, day?.fromMin, 0, 0));
      setEndDate(new Date().setHours(day?.toHour, day?.toMin, 0, 0));
      // Reset create state when day exists (day was created)
      const today = new Date();
      setStartDate2(new Date(today.getFullYear(), today.getMonth(), today.getDate(), day.fromHour || 9, day.fromMin || 0, 0, 0));
      const endHours = day.toHour || 17;
      const endMinutes = day.toMin || 0;
      setEndDate2(new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHours, endMinutes, 0, 0));
    } else {
      // Reset to default when no day exists
      const today = new Date();
      setStartDate2(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0, 0));
      setEndDate2(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0, 0));
    }
  }, [day, dayNr]);

  const [startDate2, setStartDate2] = useState(new Date());
  const [endDate2, setEndDate2] = useState(new Date());

  const handleCreateDayInShift = () => {
    console.log('➕ handleCreateDayInShift called');
    console.log('➕ Template ID:', id);
    console.log('➕ Day number:', dayNr);
    console.log('➕ Start date:', startDate2);
    console.log('➕ End date:', endDate2);
    
    if (!startDate2 || !endDate2) {
      console.error('❌ Start or end date is undefined');
      return;
    }
    if (!id) {
      console.error('❌ Template ID is missing, cannot create day');
      return;
    }
    const payload = {
      dayOfWeek: dayNr,
      fromHour: startDate2.getHours(),
      fromMin: startDate2.getMinutes(),
      toHour: endDate2.getHours(),
      toMin: endDate2.getMinutes(),
    };
    console.log('➕ Payload:', JSON.stringify(payload, null, 2));
    console.log('➕ Dispatching createDayInShiftTemplate');
    dispatch(createDayInShiftTemplate(id, payload));
  };

  const handleDisableDay = (dayId) => {
    console.log('🗑️ handleDisableDay called with dayId:', dayId);
    if (!dayId) {
      console.log('❌ Day ID is missing, cannot delete');
      return;
    }
    console.log('🗑️ Dispatching deleteDayShiftTemplate with ID:', dayId);
    dispatch(deleteDayShiftTemplate(dayId));
  };
  function addLeadingZeros(num) {
    return String(num).padStart(2, "0");
  }

  const [isTimeStartVisible, setTimeStartVisible] = useState(false);
  const [isTimeEndVisible, setTimeEndVisible] = useState(false);

  const hideDatePicker = () => {
    setTimeStartVisible(false);
    setTimeEndVisible(false);
  };

  const handleConfirmTimeStart = (date) => {
    // Extract hours and minutes from the selected date to avoid timezone conversion issues
    const selectedDate = new Date(date);
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    
    // Create a new date with today's date but the selected time (local time)
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);
    setStartDate2(startTime);
    
    // Auto-set end time to 1 hour later
    const endHours = minutes + 60 >= 60 ? (hours + 1) % 24 : hours;
    const endMinutes = (minutes + 60) % 60;
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHours, endMinutes, 0, 0);
    setEndDate2(endTime);
    
    setTimeStartVisible(false);
  };
  const onChangeHoursOff = (date) => {
    // Extract hours and minutes from the selected date to avoid timezone conversion issues
    const selectedDate = new Date(date);
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    
    // Create a new date with today's date but the selected time (local time)
    const today = new Date();
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);
    setEndDate2(endTime);
    setTimeEndVisible(false);
  };
  return (
    <View
      style={{
        backgroundColor: "#fff",
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: dayNr === 0 ? 20 : 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ width: 40, marginRight: 15 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#333" }}>
          {(() => {
            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            return dayNames[dayNr];
          })()}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "center" }}>
        <DateTimePickerModal
          isVisible={isTimeStartVisible}
          mode="time"
          onConfirm={handleConfirmTimeStart}
          onCancel={hideDatePicker}
          date={startDate2}
        />
        <DateTimePickerModal
          isVisible={isTimeEndVisible}
          mode="time"
          onConfirm={onChangeHoursOff}
          onCancel={hideDatePicker}
          date={endDate2}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
        {day?.dayOfWeek ? (
          <TouchableOpacity
            onPress={() => setTimeStartVisible(true)}
            style={[styles.inputDate, { 
              width: 55, 
              height: 36, 
              backgroundColor: "#f8f9fa",
              marginBottom: 0,
              marginRight: 2,
              alignItems: "center",
              justifyContent: "center"
            }]}
          >
            <Text style={{ fontSize: 14, fontWeight: "500" }}>
              {addLeadingZeros(day?.fromHour)}:{addLeadingZeros(day?.fromMin)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setTimeStartVisible(true)}
            style={[styles.inputDate, { 
              width: 55, 
              height: 36, 
              marginBottom: 0,
              marginRight: 2,
              alignItems: "center",
              justifyContent: "center"
            }]}
          >
            <Text style={{ fontSize: 14, color: "#6c757d" }}>
              <FormatDateTime datevalue={startDate2} type={0} />
            </Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 14, color: "#6c757d", fontWeight: "500", paddingHorizontal: 15 }}>
          -
        </Text>
        {day?.dayOfWeek ? (
          <TouchableOpacity
            onPress={() => setTimeEndVisible(true)}
            style={[styles.inputDate, { 
              width: 55, 
              height: 36, 
              backgroundColor: "#f8f9fa",
              marginBottom: 0,
              marginLeft: 2,
              alignItems: "center",
              justifyContent: "center"
            }]}
          >
            <Text style={{ fontSize: 14, fontWeight: "500" }}>
              {addLeadingZeros(day?.toHour)}:{addLeadingZeros(day?.toMin)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setTimeEndVisible(true)}
            style={[styles.inputDate, { 
              width: 55, 
              height: 36, 
              marginBottom: 0,
              marginLeft: 2,
              alignItems: "center",
              justifyContent: "center"
            }]}
          >
            <Text style={{ fontSize: 14, color: "#6c757d" }}>
              <FormatDateTime datevalue={endDate2} type={0} />
            </Text>
          </TouchableOpacity>
        )}
        </View>

      </View>
      <View style={{}}>
        {day && typeof day.dayOfWeek === 'number' ? (
          <TouchableOpacity
            style={[modalStyle.button, modalStyle.buttonDeny]}
            onPress={() => {
              console.log('🔴 Delete button clicked for day:', dayNr);
              console.log('🔴 Day object:', JSON.stringify(day, null, 2));
              console.log('🔴 Day ID:', day?.id);
              if (day?.id) {
                console.log('🔴 Calling handleDisableDay with ID:', day.id);
                handleDisableDay(day.id);
              } else {
                console.log('❌ Day ID is missing:', day);
              }
            }}
          >
            <AntDesign name="closesquareo" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[modalStyle.button, modalStyle.buttonApprove]}
            onPress={() => {
              console.log('🟢 Create button clicked for day:', dayNr);
              console.log('🟢 Template ID:', id);
              console.log('🟢 Start date:', startDate2);
              console.log('🟢 End date:', endDate2);
              if (id) {
                console.log('🟢 Calling handleCreateDayInShift');
                handleCreateDayInShift();
              } else {
                console.log('❌ Template ID is missing:', id);
              }
            }}
          >
            <AntDesign name="checksquareo" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ShiftTemplatesView = ({ id }) => {
  const [name, setName] = useState("");
  const [idTemplete, setIdTemplete] = useState("");
  const state = useSelector((state) => state);
  const isAdministrator = state.userDataRole?.isAdministrator;
  const trackingState = state.timeTracks;
  const timeTracksRequest = state.timeTracks.timeTracksRequest;

  const [dataResDays, setDataResDays] = useState([]);
  const [requestApi, setRequestApi] = useState(!isAdministrator);
  const prevTrackingStateRef = useRef(trackingState);

  const fetchTemplateData = () => {
    if (!isAdministrator && id) {
      console.log('📥 Fetching template data for ID:', id);
      setRequestApi(true);
      http
        .get(`/timetracker/templates/${id}`)
        .then((data) => {
          console.log('✅ Template data fetched:', data);
          setRequestApi(false);
          setName(data.name);
          setIdTemplete(data.id);
          setDataResDays(data.days || []);
        })
        .catch((error) => {
          console.log('❌ Error fetching template data:', error);
          setRequestApi(false);
        });
    }
  };

  useEffect(() => {
    fetchTemplateData();
  }, [isAdministrator, id]);

  // Refetch when trackingState changes (after create/delete operations)
  useEffect(() => {
    const prevState = prevTrackingStateRef.current;
    const currentState = trackingState;
    
    console.log('🔄 useEffect triggered');
    console.log('🔄 Previous trackingState:', prevState);
    console.log('🔄 Current trackingState:', currentState);
    console.log('🔄 timeTracksRequest:', timeTracksRequest);
    console.log('🔄 id:', id);
    
    // Check if state actually changed
    const stateChanged = JSON.stringify(prevState) !== JSON.stringify(currentState);
    
    // When request completes (no longer requesting) and state changed, refetch
    if (id && !timeTracksRequest && stateChanged && prevState) {
      console.log('🔄 State changed and request completed, refetching template data');
      // Small delay to ensure backend has processed the change
      const timer = setTimeout(() => {
        fetchTemplateData();
      }, 500);
      
      // Update ref for next comparison
      prevTrackingStateRef.current = currentState;
      
      return () => clearTimeout(timer);
    } else {
      // Update ref even if we don't refetch
      prevTrackingStateRef.current = currentState;
    }
  }, [trackingState, timeTracksRequest, id]);

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          NavigationService.navigate("Time", { locationActive: "0", id: "" });
        }}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
        <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
      </TouchableOpacity>
      <ScrollView
        style={{
          backgroundColor: "#ebf0f3",
          borderRadius: 5,
          maxHeight: 600,
        }}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text
            style={{ fontSize: 20, marginVertical: 10, borderBottomWidth: 1 }}
          >
            <FormattedMessage id="Time.Shift.form.name.placeholder" /> :{" "}
            {name}
          </Text>
        </View>

          {requestApi ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>Loading template data...</Text>
            </View>
          ) : (
            <>
              {(() => {
                const day0 = dataResDays?.filter((x) => x.dayOfWeek === 0).sort((a, b) => b.id.localeCompare(a.id))[0];
                console.log('📅 Day 0 (Sunday) selected:', day0 ? `ID: ${day0.id}, Time: ${day0.fromHour}:${day0.fromMin} - ${day0.toHour}:${day0.toMin}` : 'No day found');
                return (
                  <ShiftTemplatesDays
                    key={`day-0-${day0?.id || 'none'}-${dataResDays?.filter((x) => x.dayOfWeek === 0).length || 0}`}
                    day={day0}
                    dayNr={0}
                    id={idTemplete}
                  />
                );
              })()}
              <ShiftTemplatesDays
                key={`day-1-${dataResDays?.filter((x) => x.dayOfWeek === 1)[0]?.id || 'none'}`}
                day={dataResDays?.filter((x) => x.dayOfWeek === 1).sort((a, b) => b.id.localeCompare(a.id))[0]}
                dayNr={1}
                id={idTemplete}
              />
              <ShiftTemplatesDays
                key={`day-2-${dataResDays?.filter((x) => x.dayOfWeek === 2)[0]?.id || 'none'}`}
                day={dataResDays?.filter((x) => x.dayOfWeek === 2).sort((a, b) => b.id.localeCompare(a.id))[0]}
                dayNr={2}
                id={idTemplete}
              />
              <ShiftTemplatesDays
                key={`day-3-${dataResDays?.filter((x) => x.dayOfWeek === 3)[0]?.id || 'none'}`}
                day={dataResDays?.filter((x) => x.dayOfWeek === 3).sort((a, b) => b.id.localeCompare(a.id))[0]}
                dayNr={3}
                id={idTemplete}
              />
              <ShiftTemplatesDays
                key={`day-4-${dataResDays?.filter((x) => x.dayOfWeek === 4)[0]?.id || 'none'}`}
                day={dataResDays?.filter((x) => x.dayOfWeek === 4).sort((a, b) => b.id.localeCompare(a.id))[0]}
                dayNr={4}
                id={idTemplete}
              />
              <ShiftTemplatesDays
                key={`day-5-${dataResDays?.filter((x) => x.dayOfWeek === 5)[0]?.id || 'none'}`}
                day={dataResDays?.filter((x) => x.dayOfWeek === 5).sort((a, b) => b.id.localeCompare(a.id))[0]}
                dayNr={5}
                id={idTemplete}
              />
              <ShiftTemplatesDays
                key={`day-6-${dataResDays?.filter((x) => x.dayOfWeek === 6)[0]?.id || 'none'}`}
                day={dataResDays?.filter((x) => x.dayOfWeek === 6).sort((a, b) => b.id.localeCompare(a.id))[0]}
                dayNr={6}
                id={idTemplete}
              />
            </>
          )}
      </ScrollView>
    </View>
  );
};

export default ShiftTemplatesView;
