import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { generateUUID } from "../../../../../utils/variousHelpers";
import { my, px, py } from "../../../../../asset/style/utilities.style";
import colors from "../../../../../constants/Colors";
import flex from "../../../../../asset/style/flex.style";
import { addTaxInfoPayload, countTaxValues } from "./helperLineItems";
import { useSelector } from "react-redux";

export const LineItemsTotalValues = ({
  lineItems,
  lineItemsTaxRates,
  setIsInnerScrollActive,
  totalPrices,
  setTotalPrices,
  setTaxInfo
}) => {

  const intl = useIntl();
  const state = useSelector((state) => state);
  const [rows, setRows] = useState([]);
  const mainCurrency = state.currencies.mainCurrency;
  useEffect(() => {
    if (lineItems.length > 0) {
      const { total, totalTax, totalPriceExcTax, rows } = countTaxValues(
        lineItems,
        lineItemsTaxRates
      );

      setRows(rows);
      const taxInfoPayload = addTaxInfoPayload(rows);

      setTaxInfo(taxInfoPayload)
      setTotalPrices({
        total, totalTax, totalPriceExcTax
      })
    }else {
      setTotalPrices({
        total: "",
        totalTax: "",
        totalPriceExcTax: "",
      })
      setRows([])
    }
  }, [lineItems]);

  
  const headers = [
    "money-tracker.scan.form.lineItems.taxRate",
    "money-tracker.scan.form.lineItems.tax",
    "money-tracker.scan.form.lineItems.excTal",
    "money-tracker.scan.form.lineItems.inclTal",
    "money-tracker.scan.form.lineItems.currency",
  ];
  const totalStr = intl
    .formatMessage({
      id: "money-tracker.scan.form.lineItems.totalPriceInclTax",
    })
    .substring(0, 11);
  return (
    <View style={{ maxHeight: 300 }}>
      <ScrollView
    horizontal
    scrollEnabled={true}
    nestedScrollEnabled={true}
    contentContainerStyle={{ flexGrow: 1 }}
    showsHorizontalScrollIndicator={true}
    onTouchStart={() => setIsInnerScrollActive(true)}
    onTouchEnd={() => setIsInnerScrollActive(false)}
    onScrollEndDrag={() => setIsInnerScrollActive(false)}
    style={[styles.container]}
      >
        <View >
          {/* Render Headers */}
          <View style={styles.row}>
            {rows.length > 0 &&
              headers.map((header) => (
                <Text
                  key={generateUUID(14)}
                  style={[styles.cell, styles.header]}
                >
                  <FormattedMessage id={header} />
                </Text>
              ))}
          </View>
          {/* Render Rows */}
          {rows.length > 0 &&
            rows.map((row, rowIndex) => (
              <View key={generateUUID(23)} style={styles.row}>
                {row &&
                  row.length > 0 &&
                  row.map((cell, index) => (
                    <Text key={generateUUID(16)} style={[ styles.cell,
                      index === row.length -1 && cell !== mainCurrency && { color:colors.error_100}
                    ]}>
                      {cell}
                    </Text>
                  ))}
              </View>
            ))}
        </View>
      </ScrollView>
      {totalPrices?.total !== "" ? (
        <View
          style={[
            flex.d_flex_center,
            flex.flex_between,
            {
              borderTopWidth: 2,
              borderColor: colors.black,
              backgroundColor: colors.gray_80,
            },
            my[2],
            py[3],
            px[2],
          ]}
        >
          {totalStr && mainCurrency && (
            <Text style={[{ fontSize: 18, fontWeight: "bold" }]}>
              {totalStr}
              {` (${mainCurrency})`}
            </Text>
          )}
          <Text style={[{ fontSize: 18, fontWeight: "bold" }]}>
            {totalPrices.total}
          </Text>
        </View>
      ) : (
        <View
          style={[
            flex.d_flex_center,
            flex.flex_between,
            {
              borderTopWidth: 2,
              borderColor: colors.black,
              backgroundColor: colors.gray_80,
            },
            my[2],
            py[3],
            px[2],
          ]}
        >
          {totalStr && mainCurrency && (
            <Text style={[{ fontSize: 18, fontWeight: "bold" }]}>
              {totalStr}
              {` (${mainCurrency})`}
            </Text>
          )}
          <Text style={[{ fontSize: 18, fontWeight: "bold" }]}>0</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    // maxHeight:250
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderWidth: 1,
    borderColor: colors.gray_100,
    padding: 10,
    width: 130,
    textAlign: "center",
  },
  header: {
    backgroundColor: colors.gray_80,
    fontWeight: "bold",
  },
});
