import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import {
  approveRequestVacation,
  denyRequestVacation,
} from "../../redux/actions/Vacation/vacationRequests.actions";

// Components
import FormatDateTime from "../../components/FormatDateTime";
import { dateFormat } from "../../utils/dateFormat";
import ModalApproveDenyVacation from "./components/ModalApproveDenyVacation";

import { globalStyles } from "../../asset/style/globalStyles";
import { vacationStyles } from "./syles";
import { handleDataRes } from "./components/vacationCalendar/helper";
import { EmployeeBox } from "./components/vacationCalendar/EmployeeBox";
import { generateUUID } from "../../utils/variousHelpers";

const windowWidth = Dimensions.get("window").width;

const VacationCalendar = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const isAdministrator = state.userDataRole?.isAdministrator;
  const vacations = state.vacations;

  const [dataResponse, setDataResponse] = useState([]);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

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
      getVacationRequestsList(
        newDate,
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)
      );
      return newDate;
    });
  };
  const getVacationRequestsList = (start, end) => {
    if (start && end) {
      setOnNavigateStart(new Date(start));
      setOnNavigateStop(new Date(end));
      setRequestApi(true);
      http
        .get(
          `/vacations/requests/all?From=${dateFormat(start)}&To=${dateFormat(
            end
          )}`
        )
        .then((data) => {
          const editData = handleDataRes(data);

          setRequestApi(false);
          setDataResponse(editData);
          setDataLength(data.length === 0);
        })
        .catch(() => {});
    }
  };
  useEffect(() => {
    getVacationRequestsList(onNavigateStart, onNavigateStop);
  }, [isAdministrator, vacations]);

  const [modalVacation, setModalVacation] = useState(false);
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");

  const handleApproveRequestVacation = (id, approverComment) => {
    const payload = { id, approverComment };
    dispatch(approveRequestVacation(payload));
  };
  const handleDenyRequestVacation = (id, approverComment) => {
    const payload = { id, approverComment };
    dispatch(denyRequestVacation(payload));
  };
  const handleDenyModal = (id) => {
    setId(id);
    setModalVacation(true);
    setStatus(0);
  };
  const handleApproveModal = (id) => {
    setId(id);
    setModalVacation(true);
    setStatus(1);
  };

  return (
    <View style={vacationStyles.container}>
      <View>
        <Text style={globalStyles.screenTitle}>
          <FormattedMessage id="Users.Requests.List" />
        </Text>
      </View>

      <View style={vacationStyles.navigationDate}>
        <TouchableOpacity
          onPress={() => onPressDateByMonth(0)}
          style={[globalStyles.btnCircle, { marginLeft: 0 }]}
          disabled={requestApi}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}>
            {"<"} Previous
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: windowWidth < 430 ? 15 : 17 }}>
          <FormatDateTime datevalue={onNavigateStart} type={1} /> -{" "}
          <FormatDateTime datevalue={onNavigateStop} type={1} />{" "}
        </Text>
        <TouchableOpacity
          onPress={() => onPressDateByMonth(1)}
          style={[globalStyles.btnCircle, { margin: 0 }]}
          disabled={requestApi}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}>
            Next {">"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View>
          
        {requestApi ? (
          <ActivityIndicator size="large" color="#6c757d" />
        ) : (
          <></>
        )}
        {dataResponse.length > 0 &&
          dataResponse.map((el) => (
            <EmployeeBox key={generateUUID(88)} groupUserCard={el} />
          ))}
        </View>
      </ScrollView>
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="vacation.list.noItems" />{" "}
        </Text>
      ) : (
        <></>
      )}
      <ModalApproveDenyVacation
        id={id}
        modalVacation={modalVacation}
        setModalVacation={setModalVacation}
        status={status}
        deny={handleDenyRequestVacation}
        approve={handleApproveRequestVacation}
      />
    </View>
  );
};

export default VacationCalendar;
