import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  calculateWorkingDays,
  getUiCardStyle,
  isOpenSickLeave,
} from "./helper";
import { AntDesign } from "@expo/vector-icons";
import colors from "../../../../constants/Colors";
import { ml, mt, my, p, pl, pt } from "../../../../asset/style/utilities.style";
import flex from "../../../../asset/style/flex.style";
import { useIntl } from "react-intl";
import { TextMain, TextMainSmallBold } from "../../../../components/Texts";

export const EmployeeCard = ({
  request,
  openFile,
}) => {
  const intl = useIntl();
  const { bgColor, icon, label } = getUiCardStyle(request);

  return (
    <View style={[styles.container, my[2], pl[3]]}>
      {/* Colored bar on the left */}
      <View style={[styles.coloredBar, { backgroundColor: bgColor }]} />
      <View style={[flex.d_flex_center, flex.flex_start, { minHeight: 95 }]}>
        {/* Icon */}
        <View style={[ml[4]]}>{icon}</View>
        <View
          style={[
            flex.d_flex_center,
            flex.flex_start,
            request.substituteUserFirstName &&
              request.substituteUserLastName &&
              flex.flex_direction_column,
            p[6],
          ]}
        >
          {/* Replacement user info, if any */}
          {request.substituteUserFirstName &&
            request.substituteUserLastName && (
              <View>
                <TextMain isPlaintext text="vacation.selected.replacment" />
                <TextMain
                isPlaintext
                  text={`${request.substituteUserFirstName}{" "}
                  ${request.substituteUserLastName}`}
                />
              </View>
            )}

          {/* If request is "sick-request" with a doc */}
          {request.requestType === 2 && (
            <>
              {request.vacationRequestDocumentResponse?.name && (
                <TouchableOpacity
                  onPress={() => {
                    openFile(
                      request.id,
                      request.vacationRequestDocumentResponse
                    );
                  }}
                  style={[
                    { backgroundColor: colors.gray_150 },
                    p[2],
                    flex.d_flex_center,
                    flex.d_flex_between,
                  ]}
                >
                  <TextMainSmallBold
                    isPlaintext
                    text={request.vacationRequestDocumentResponse?.name}
                    customStyles={{ width: "80%" }}
                  />
                  <AntDesign name="arrowright" color={colors.white} size={20} />
                </TouchableOpacity>
              )}
              {isOpenSickLeave(request) && (
                <TextMain text="sick.leave.request.is.still.open" />
              )}
            </>
          )}
        </View>
      </View>

      <View style={[pl[4], pt[4]]}>
        {/* Info about from/to, daysOff, etc. */}
        <View>
          <View />
          <View>
            <TextMainSmallBold  text={label} />
            <View>
              {isOpenSickLeave(request) ? (
                <>
                  <Text>
                    {`${intl.formatMessage({
                      id: "from",
                    })}: ${new Intl.DateTimeFormat("en-GB").format(
                      new Date(request.requestedFrom)
                    )} - ${intl.formatMessage({
                      id: "tu",
                    })}: ${new Intl.DateTimeFormat("en-GB").format(
                      new Date()
                    )}`}
                  </Text>
                  <Text>
                    {`${intl.formatMessage({
                      id: "open.sick.leave.days",
                    })}: ${calculateWorkingDays(request.requestedFrom)}`}
                  </Text>
                </>
              ) : (
                <>
                  {request.daysOff && (
                    <>
                      <Text>
                        {`${intl.formatMessage({
                          id: "from",
                        })}: ${new Intl.DateTimeFormat("en-GB").format(
                          new Date(request.requestedFrom)
                        )} - ${intl.formatMessage({
                          id: "tu",
                        })}: ${new Intl.DateTimeFormat("en-GB").format(
                          new Date(request.requestedTo)
                        )}`}
                      </Text>
                      <Text>
                        {`${intl.formatMessage({
                          id: "number.of.days",
                        })}: ${request.daysOff}`}
                      </Text>
                    </>
                  )}
                  {request.hoursOff && (
                    <>
                      <Text>
                        {`${intl.formatMessage({
                          id: "for",
                        })}: ${new Intl.DateTimeFormat("en-GB").format(
                          new Date(request.requestedFrom)
                        )}`}
                      </Text>
                      <Text>
                        {`${intl.formatMessage({
                          id: "number.of.hours",
                        })}: ${request.hoursOff}`}
                      </Text>
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: 200,
    borderWidth: 1,
    borderColor: colors.gray_100,
    borderRadius: 9,
    backgroundColor: colors.white,
    position: "relative",
    width: "100%",
  },
  coloredBar: {
    position: "absolute",
    left: 0,
    width: 10,
    height: 200,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
});
