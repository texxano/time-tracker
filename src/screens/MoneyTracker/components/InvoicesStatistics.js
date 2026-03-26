import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Platform,
  Dimensions,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";

import http from "../../../services/http";
import { auth } from "../../../utils/statusUser";
import colors from "../../../constants/Colors";
import flex from "../../../asset/style/flex.style";
import { mb } from "../../../asset/style/utilities.style";

const { width } = Dimensions.get("window");

const InvoicesStatistics = ({ invoiceId }) => {
  const intl = useIntl();

  const state = useSelector((state) => state);
  const moneyTrackerIsSupervisor =
    state.userDataModule?.moneyTrackerIsSupervisor;

  const [totalInvCount, setTotalInvCount] = useState(0);
  const [data, setData] = useState([]);
  const [typeStatistics, setTypeStatistics] = useState(0);

  useEffect(() => {
    const getData = async () => {
      let path1 = `/moneytracker/invoices/project/${invoiceId}/statistics/all`;
      let path2 = `/moneytracker/invoices/project/${invoiceId}/statistics`;
      http.get(`${typeStatistics ? path1 : path2}`).then((data) => {
        setTotalInvCount(data.totalInvoicesCount);
        setData(convertStatisticData(data));
      });
    }
    getData()
  }, [invoiceId]);

  function convertStatisticData(data) {
    const projects = [
      {
        name: `${intl.formatMessage({ id: "money-tracker.invoice.unpaid" })} (${
          data?.totalInvoicesBilled[0]?.currencyCode || ""
        })`,
        population: data?.totalInvoicesBilled.length
          ? data?.totalInvoicesBilled[0]?.amountValue
          : 0,
        color: colors.error_200,
        legendFontColor: colors.gray_600,
        legendFontSize: 13,
      },
      {
        name: `${intl.formatMessage({ id: "money-tracker.invoice.paid" })} (${
          data?.totalInvoicesPaid[0]?.currencyCode || ""
        })`,
        population: data?.totalInvoicesPaid.length
          ? data?.totalInvoicesPaid[0]?.amountValue
          : 0,
        color: colors.success_200,
        legendFontColor: colors.gray_600,
        legendFontSize: 13,
      },
    ];

    return projects;
  }
  return (
    <View style={styles.container}>
      {moneyTrackerIsSupervisor && (
        <View style={[styles.viewSubPrject, flex.d_flex_center, mb[3]]}>
          <Text style={[styles.textSubPrject]}>
            <FormattedMessage id="Including.Sub.Projects" />:{" "}
          </Text>
          <View style={{ width: "20%" }}>
            <Switch
              trackColor={{ false: colors.gray_600, true: colors.blue_100 }}
              thumbColor={typeStatistics ? colors.blue_200 : colors.gray_60}
              ios_backgroundColor={colors.gray_600}
              onValueChange={() => setTypeStatistics(!typeStatistics)}
              value={typeStatistics}
            />
          </View>
        </View>
      )}
      <Text>
        <FormattedMessage id="money-tracker.invoice.total.invoiced" />:{" "}
        <Text style={{ fontWeight: "500" }}>{totalInvCount}</Text>
      </Text>
      {data?.length ? (
        <View style={[{ position: "relative" }]}>
          <PieChart
            data={data}
            width={width - width / 6.5}
            height={120}
            paddingLeft={-35}
            chartConfig={{
 
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={{ paddingTop: 10 }}
            accessor="population"
            backgroundColor="transparent"
            yAxisLabel="rtet"
            // absolute
          />
        </View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray_150,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: colors.gray_150,
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
    padding: 10,
  },
  viewSubPrject: {
    flexDirection: "row",
    alignItems: "center",
  },
  textSubPrject: {
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "500" : "400",
    width: "80%",
  },
});
export default InvoicesStatistics;
