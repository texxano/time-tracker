import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { View } from "react-native";
import flex from "../../../../asset/style/flex.style";
import { useIntl } from "react-intl";

export const handleDataRes = (data) => {
  const grouped = Object.values(
    data.reduce((acc, request) => {
      const email = request.requesterEmail;
      if (!acc[email]) {
        acc[email] = [];
      }
      acc[email].push(request);
      return acc;
    }, {})
  );

  return grouped;
};
export const getCellStyle = (request) => {
  // Convert to Date objects (in case they're strings)
  const from = new Date(request.requestedFrom);
  const to = new Date(request.requestedTo);

  // A simple check: Are they on the same calendar day?
  const isSameDay =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth() &&
    from.getDate() === to.getDate();

  // If it's sick time (requestType = 2), skip the hour/day logic
  if (request.requestType === 2) {
    return "sick-request";
  }

  // Not approved yet, so it's pending
  if (!request.approved) {
    return isSameDay ? "pending-request-hours" : "pending-request";
  }

  // Approved request
  return isSameDay ? "approved-request-hours" : "approved-request";
};

export const isOpenSickLeave = (request) => {
  return (
    !request.vacationRequestDocumentResponse?.name &&
    request.requestType === 2 &&
    request.requestedTo === "9999-12-31T23:59:59.9999999+00:00"
  );
};

export const calculateWorkingDays = (requestedFrom) => {
  const requestedDate = new Date(requestedFrom);
  if (isNaN(requestedDate)) {
    throw new Error("Invalid date provided");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  requestedDate.setHours(0, 0, 0, 0);

  if (requestedDate > today) {
    return 0; // No working days if the request is in the future
  }

  let workingDays = 0;
  let currentDate = new Date(requestedDate); // Create a new Date object to avoid mutation

  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

export const getCardCalculations = (groupUserCard) => {
  let totalVacationDays = 0;
  let totalVacationHours = 0;
  let totalOpenSickDays = 0;
  let totalSickDays = 0;
  let totalPendingDays = 0;
  let totalPendingHours = 0;

  groupUserCard.forEach((request) => {
    switch (getCellStyle(request)) {
      case "approved-request":
        totalVacationDays += request.daysOff;
        break;
      case "approved-request-hours":
        // For partial-day or hour requests
        totalVacationHours += request.hoursOff;
        break;

      case "sick-request":
        if (isOpenSickLeave(request)) {
          totalOpenSickDays += calculateWorkingDays(request.requestedFrom);
        } else {
          totalSickDays += request.daysOff;
        }
        break;

      case "pending-request":
        totalPendingDays += request.daysOff;
        break;
      case "pending-request-hours":
        // For partial-day or hour requests
        totalPendingHours += request.hoursOff;
        break;

      default:
        break;
    }
  });
  return {
    totalVacationDays,
    totalVacationHours,
    totalOpenSickDays,
    totalSickDays,
    totalPendingDays,
    totalPendingHours,
  };
};

export const getUiCardStyle = (request) => {
  const intl = useIntl();
  let bgColor, icon, label;
  switch (getCellStyle(request)) {
    // Full-day approved
    case "approved-request":
      bgColor = "rgba(67, 102, 69, 0.9)";
      icon = <MaterialCommunityIcons name="walk" size={30} />;
      label = "vacation.tilte"
      break;

    // ** Hour-based approved **
    case "approved-request-hours":
      bgColor = "rgba(24, 130, 30, 1)";
      icon = <MaterialCommunityIcons name="walk" size={30} color="#3d3d3d" />;
      label = "vacation.hours"
      break;

    // Full-day sick
    case "sick-request":
      bgColor = "rgba(209, 61, 17, 1)";
      icon = <FontAwesome name="heartbeat" size={28} />;
      label = isOpenSickLeave(request)
        ? "sick.leave.is.still.open"
        : "sick.leave"
      break;

    // Full-day pending
    case "pending-request":
      bgColor = "rgba(254, 207, 0, 1)";
      icon = <AntDesign name="clockcircleo" size={30} color="#3d3d3d" />;
      label = "waiting.for.approval"
      break;

    // ** Hour-based pending **
    case "pending-request-hours":
      bgColor = "rgba(254, 207, 0, 1)";
      icon = (
        <View style={[flex.d_flex_center]}>
          <MaterialCommunityIcons name="walk" size={30} color="#3d3d3d" />
          <FontAwesome
            name="arrow-right"
            size={15}
            color="#3d3d3d"
            style={{ marginLeft: -4 }}
          />
        </View>
      );
      label = "waiting.for.approval.hours"
      break;

    default:
      bgColor = "rgba(200, 200, 200, 1)";
      icon = null;
      label = "N/A";
      break;
  }

  return { bgColor, icon, label };
};
