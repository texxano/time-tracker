import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // Icons
import { useIntl } from "react-intl"; // For translations
import { mx, my } from "../../../../asset/style/utilities.style";

export const ApprovalPath = ({
  data,
  canApprove,
  userData,
  handleDenyModal,
  handleApproveModal,
}) => {
  const intl = useIntl();


  // console.log(data.approvalPath[0]?.assignmentTeamData, "data")
  const renderApprovalItem = ({ item, index }) => (
    <View>
      <View style={[styles.approvalCard, my[3], mx[4]]}>
        <Text style={styles.teamName}>{item.assignmentTeamData?.teamName}</Text>
        <View style={styles.approvalInfo}>
          {item.approverFirstName && (
            <Text>
              <Text style={styles.bold}>
                {intl.formatMessage({ id: "decider" })}:{" "}
              </Text>
              {item.approverFirstName ? (
                `${item.approverFirstName} ${item.approverLastName}`
              ) : (
                <Text style={styles.pending}>
                  {intl.formatMessage({ id: "pending" })}
                </Text>
              )}
            </Text>
          )}
          <Text>
            <Text style={styles.bold}>
              {intl.formatMessage({ id: "approve.status" })}:{" "}
            </Text>
            {item.approved === null ? (
              item.waitingForTeam === item.assignmentTeamData?.teamName ? (
                intl.formatMessage({ id: "awaiting.approval" })
              ) : (
                <Text style={styles.pending}>
                  {intl.formatMessage({ id: "awaiting.approval.first" })}{" "}
                  {item.waitingForTeam}
                </Text>
              )
            ) : item.approved ? (
              <Text style={styles.approved}>
                {intl.formatMessage({ id: "approved" })}
              </Text>
            ) : (
              <Text style={styles.denied}>
                {intl.formatMessage({ id: "deny" })}
              </Text>
            )}
          </Text>
        </View>

        {/* Approve/Deny Buttons */}
        {item.approved === null &&
          item.waitingForTeam === item.assignmentTeamData?.teamName &&
          canApprove &&
          userData?.team === item.assignmentTeamData.teamName && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.denyButton}
                onPress={() => handleDenyModal(data.id)}
              >
                <Text style={styles.buttonText}>
                  {intl.formatMessage({ id: "Deny.Button" })}{" "}
                  <FontAwesome name="times-circle" size={16} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApproveModal(data.id)}
              >
                <Text style={styles.buttonText}>
                  {intl.formatMessage({ id: "Approve.Button" })}{" "}
                  <FontAwesome name="check-square" size={16} />
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </View>

      {/* Arrow Indicator */}
      {index < data.approvalPath.length - 1 && (
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>➜</Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={data.approvalPath}
      keyExtractor={(item) => item.vacationTeamConfigurationId.toString()}
      renderItem={renderApprovalItem}
    />
  );
};

const styles = StyleSheet.create({
  approvalCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6, // For Android
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  approvalInfo: {
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  pending: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  approved: {
    color: "#28a745",
    fontWeight: "bold",
  },
  denied: {
    color: "#FF4D4D",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  denyButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  arrowContainer: {
    alignItems: "center",
    marginVertical: 5,
  },
  arrow: {
    fontSize: 24,
    color: "#888",
    transform: [{ rotate: "90deg" }],
  },
});
