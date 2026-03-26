import React, { useState } from "react";
import Tooltip from "react-native-walkthrough-tooltip";
import { Text, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function pickColor(firstName, lastName) {
  if (!firstName || !lastName) {
    return colors[0];
  }

  const hashString = firstName + lastName;
  let hash = 0;

  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  const colorIndex = Math.abs(hash + 30000) % colors.length;
  return colors[colorIndex];
}

export const colors = [
  "#9d241e", "#c43e21", "#FBC02D", "#9a5943", "#d96940",
  "#a48851", "#b9a65e", "#cfb602", "#96a151", "#576840",
  "#f56c7d", "#5846ab", "#ad71b8", "#430217", "#AB47BC",
  "#7986CB", "#0097A7", "#00796B", "#78909C", "#A1887F",
  "#8D6E63", "#4E342E", "#C46A6A", "#8B3A3A", "#C2185B",
  "#880E4F", "#6A1B9A", "#311B92", "#1565C0", "#558B2F",
  "#33691E", "#616161"
];

const InitialUser = ({ FirstName, LastName, email }) => {
  const { top } = useSafeAreaInsets();
  const initial = (FirstName ? (FirstName[0]?.toUpperCase() ?? "") : "") + (LastName ? (LastName[0]?.toUpperCase() ?? "") : "");
  const [showTip, setTip] = useState(false);
  return (
    <>{FirstName && LastName &&
      <Tooltip
        isVisible={showTip}
        content={
          <>
            <Text>
              {" "}
              {FirstName} {LastName}{" "}
            </Text>
            {email && <Text>{email} </Text>}
          </>
        }
        onClose={() => setTip(false)}
        placement="top"
        topAdjustment={Platform.OS === "android" ? -top : 0}
      >
        <TouchableOpacity
          onPress={() => setTip(true)}
          style={{
            backgroundColor: pickColor(FirstName, LastName),
            padding: 7,
            paddingVertical: 7.5,
            borderRadius: 8,
            borderLeftWidth: 1,
            borderColor: "#fff",
            marginRight: -6,
          }}
        >
          {showTip && Platform.OS === "android" ? (
            <Text
              style={{ color: "#fff", paddingVertical: 3, fontWeight: "600" }}
            >
              {" "}
              {initial}{" "}
            </Text>
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>{initial}</Text>
          )}
        </TouchableOpacity>
      </Tooltip>}
    </>
  );
};

export default InitialUser;
