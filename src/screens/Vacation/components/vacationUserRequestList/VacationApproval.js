import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FormattedMessage, useIntl } from "react-intl"; // Assuming you are using intl for translations
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../../constants/Colors";
import ModalDelete3 from "../../../../components/Modal/ModalDelete3";
import flex from "../../../../asset/style/flex.style";

const VacationApproval = ({
  data,
  handleCancelRequestVacation,
  handleDeleteRequestVacation,
  openSickLeaveModal,
  isOpenSickLeave,
}) => {
  const intl = useIntl();
  const isPendingStep = (step) => step.approved === null;
  const [showModal, setShowModal] = useState(false);

  if (data.approvalPath.length === 0) {
    // Old API behavior (approvalPath is empty)
    if (data.approved) {
      return (
        <View style={styles.container}>
          <ModalDelete3
            showModal={showModal}
            closeModal={() => setShowModal(false)}
            id={data.id}
            deleted= {(id) =>{
                handleDeleteRequestVacation(id);
                setShowModal(false);
                return;
            }}
            data={intl.formatMessage({ id: 'vacation.delete.confirm' })}
          />
          <Text style={styles.vacationApproved}>
            {data.requestType === 2 ? (
              <FormattedMessage id="sick.period.finished" />
            ) : (
              <FormattedMessage id="vacation.approved" />
            )}
          </Text>
  
          {new Date(data.requestedFrom).getTime() >
            new Date().getTime() + 3600000 && isOpenSickLeave(data) ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelRequestVacation(data.id)}
            >
              <Text style={styles.buttonText}>
                {data.requestType === 2 ? (
                  <FormattedMessage id="cancel.sick.period" />
                ) : (
                  <FormattedMessage id="cancel.vacation" />
                )}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { width: 40, alignSelf: "flex-end" },
              ]}
              onPress={() => setShowModal(true)}
            >
              <Ionicons name="trash" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (data.approved === false && !isOpenSickLeave(data)) {
      return (
        <View style={styles.container}>
          <Text style={styles.vacationDenied}>
            <FormattedMessage id="vacation.denied" />
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequestVacation(data.id)}
          >
            <Text style={styles.buttonText}>
              <FormattedMessage id="common.button.delete" />
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else if (isOpenSickLeave(data)) {
      return (
        <View style={[styles.container]}>
          <TouchableOpacity
            style={[styles.cancelButton,flex.d_flex_center]}
            onPress={() => {
              openSickLeaveModal("close", data.id);
            }}
          >
            <Text style={styles.buttonText}>
              <FormattedMessage id="close.sick.leave" />
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.vacationPending}>
            <FormattedMessage id="vacation.pending" />
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequestVacation(data.id)}
          >
            <Text style={styles.buttonText}>
              <FormattedMessage id="cancel.vacation" />
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  } else {
    // New API behavior (approvalPath is not empty)
    return (
      <View style={styles.container}>
        {data.approvalPath.map((item, index) => (
          <View
            key={item.vacationTeamConfigurationId}
            style={styles.approvalCard}
          >
            <Text style={styles.teamName}>
              {item.assignmentTeamData?.teamName}
            </Text>
            <View style={styles.approvalInfo}>
              {item.approverFirstName && (
                <Text style={styles.approverText}>
                  <FormattedMessage id="decider" />:{" "}
                  {`${item.approverFirstName} ${item.approverLastName}`}
                </Text>
              )}
              <Text style={styles.approvalStatus}>
                <FormattedMessage id="approve.status" />:{" "}
                {item.approved === null ? (
                  item.declinedTeam ? (
                    <Text style={styles.deniedText}>
                      {intl.formatMessage({ id: "declined.by" })}{" "}
                      {item.declinedTeam}
                    </Text>
                  ) : (
                    <Text style={styles.pending}>
                      <FormattedMessage id="awaiting.approval" />
                    </Text>
                  )
                ) : item.approved ? (
                  <Text style={styles.approved}>
                    <FormattedMessage id="approved" />
                  </Text>
                ) : (
                  <Text style={styles.denied}>
                    <FormattedMessage id="deny" />
                  </Text>
                )}
              </Text>
            </View>
            {index < data.approvalPath.length - 1 && (
              <Text style={styles.arrow}>→</Text>
            )}
          </View>
        ))}

        {(data.approved === null ||
          new Date(data.requestedFrom) >
            new Date(Date.now() + 60 * 60 * 1000)) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequestVacation(data.id)}
          >
            <Text style={styles.buttonText}>
              <FormattedMessage id="cancel.vacation" />
            </Text>
          </TouchableOpacity>
        )}

        {data.approved === false && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequestVacation(data.id)}
          >
            <Text style={styles.buttonText}>
              <FormattedMessage id="common.button.delete" />
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  vacationApproved: {
    color: "green",
    fontSize: 16,
  },
  vacationDenied: {
    color: "red",
    fontSize: 16,
  },
  vacationPending: {
    color: "orange",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff6347",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
  icon: {
    fontSize: 24,
    textAlign: "center",
  },
  approvalCard: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  teamName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  approvalInfo: {
    marginTop: 5,
  },
  approverText: {
    fontSize: 14,
  },
  approvalStatus: {
    fontSize: 14,
  },
  approved: {
    color: "green",
  },
  denied: {
    color: "red",
  },
  deniedText: {
    color: "red",
    fontStyle: "italic",
  },
  pending: {
    color: "orange",
  },
  arrow: {
    textAlign: "center",
    fontSize: 24,
    marginTop: 10,
  },
});

export default VacationApproval;
