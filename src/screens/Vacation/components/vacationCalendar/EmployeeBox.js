import React, { Fragment, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import colors from "../../../../constants/Colors";
import { TextMain } from "../../../../components/Texts";
import { mb, mt, my, p, px, py } from "../../../../asset/style/utilities.style";
import { EmployeeCard } from "./EmployeeCard";
import { getCardCalculations, isOpenSickLeave } from "./helper";
import { FormattedMessage, useIntl } from "react-intl";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import { getMimeType } from "../../../../utils/variousHelpers";
import DocViewerModal from "../../../../components/Modal/DocViewerModal";

export const EmployeeBox = ({ groupUserCard }) => {
  const intl = useIntl();
  const [userName, setUserName] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDocViewerModalOpen, setIsDocViewerModalOpen] = useState(false);
  const [webViewUri, setWebViewUri] = useState(null);
  const {
    totalVacationDays,
    totalVacationHours,
    totalOpenSickDays,
    totalSickDays,
    totalPendingDays,
    totalPendingHours,
  } = getCardCalculations(groupUserCard);

  useEffect(() => {
    if (groupUserCard) {
      const { requesterFirstName, requesterLastName } = groupUserCard[0];
      const connectNames = `${requesterFirstName} ${requesterLastName}`;

      setUserName(connectNames);
    }
  }, [groupUserCard]);

  const [downloadUri, setDownloadUri] = useState(null);

  const openFile = async (id, vacationRequestDocumentResponse) => {
    try {
      setWebViewUri(vacationRequestDocumentResponse);
    } catch (error) {
      Alert.alert("Error", "Failed to download or open the file.");
      console.error(error);
    }
  };

  return (
    <>
      <DocViewerModal
        isOpen={webViewUri !== null}
        file={webViewUri}
        toggle={() => setWebViewUri(null)}
      />
      <View style={[styles.container, p[2], my[4]]}>
        {userName && (
          <TextMain
            isPlaintext
            text={userName}
            customStyles={[my[2], { fontWeight: "bold", fontSize: 22 }]}
          />
        )}

        {groupUserCard.length > 0 &&
          groupUserCard
            .sort((a, b) => {
              // Keep your open-sick-leave sorting logic here
              const isOpenA = isOpenSickLeave(a);
              const isOpenB = isOpenSickLeave(b);

              if (isOpenA && !isOpenB) return -1;
              if (!isOpenA && isOpenB) return 1;
              return 0;
            })
            .map((request) => (
              <Fragment key={request.id}>
                {isOpenSickLeave(request) && (
                  <Text style={[{ color: "black" }, mb[4]]}>
                    <FormattedMessage id="employee.has.open.sick.leave" />
                  </Text>
                )}
                <EmployeeCard openFile={openFile} request={request} />
              </Fragment>
            ))}

        <View style={[py[8], px[4], { backgroundColor: colors.gray_60 }]}>
          {totalVacationDays !== 0 && (
            <TextMain
              customStyles={[mt[2], { fontSize: 16 }]}
              isPlaintext
              numberOfLines={3}
              text={`${intl.formatMessage({
                id: "total.vacation.days",
              })}: ${totalVacationDays} ${intl.formatMessage({ id: "days" })}`}
            />
          )}
          {totalVacationHours !== 0 && (
            <TextMain
              isPlaintext
              numberOfLines={3}
              customStyles={[mt[2], { fontSize: 16 }]}
              text={`${intl.formatMessage({
                id: "total.vacation.hours",
              })}: ${totalVacationHours}`}
            />
          )}
          {totalSickDays !== 0 && (
            <TextMain
              isPlaintext
              numberOfLines={3}
              customStyles={[mt[2], { fontSize: 16 }]}
              text={`${intl.formatMessage({
                id: "total.sick.leave.days",
              })}: ${totalSickDays} ${intl.formatMessage({
                id: "Calendar.Days",
              })}`}
            />
          )}
          {totalPendingDays !== 0 && (
            <TextMain
              isPlaintext
              numberOfLines={3}
              customStyles={[mt[2], { fontSize: 16 }]}
              text={`${intl.formatMessage({
                id: "total.pending.days",
              })}: ${totalPendingDays} ${intl.formatMessage({
                id: "Calendar.Days",
              })}`}
            />
          )}
          {totalPendingHours !== 0 && (
            <TextMain
              numberOfLines={3}
              isPlaintext
              customStyles={[mt[2], { fontSize: 16 }]}
              text={`${intl.formatMessage({
                id: "total.pending.hours",
              })}: ${totalPendingHours}`}
            />
          )}
          {totalOpenSickDays !== 0 && (
            <TextMain
              isPlaintext
              numberOfLines={3}
              customStyles={[mt[2], { fontSize: 16 }]}
              text={`${intl.formatMessage({
                id: "total.open.sick.leave.days",
              })}: ${totalOpenSickDays} ${intl.formatMessage({
                id: "Calendar.Days",
              })}`}
            />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.gray_100,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
});
