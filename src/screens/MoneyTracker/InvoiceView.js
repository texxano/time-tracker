/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";
// Redux
import { NavigationService } from "../../navigator";

// import InitialUser from "../../components/InitialUser";
import FormatDateTime from "../../components/FormatDateTime";
import ItemPayment from "./components/ItemPayment";
import ModalMoreMoney from "./components/ModalMoreMoney";
import { statusInvoice } from "./components/statusInvoice";
import MoneyTrackerActivity from "./MoneyTrackerActivity";

import { styles as styles } from "./MoneyTracker.Styles";
import { styles as stylesHeader } from "../../asset/style/components/header";

const InvoiceView = ({ id, projectViewMode, dataNavigate }) => {
  const state = useSelector((state) => state);
  const moneyTrackerRequest = state.moneyTracker.moneyTrackerRequest;

  const [dataResponse, setDataResponse] = useState({});
  const [requestApi, setRequestApi] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const getData = async () => {
      if (!moneyTrackerRequest) {
        setRequestApi(true);
        http.get(`/moneytracker/invoices/${id}`).then((data) => {
          setRequestApi(false);
          setDataResponse(data);
        });
      }
    };
    getData();
  }, [moneyTrackerRequest]);

  const handleNavigateBack = () => {
    if (projectViewMode) {
      NavigationService.navigate("MoneyProject", {
        projectId: dataNavigate.projectId,
        parentId: dataNavigate.parentId,
        permissionCode: dataNavigate.permissionCode,
        invoicesId: null,
      });
    } else {
      NavigationService.navigate("MoneyTracker", {
        locationActive: "",
      });
    }
  };
  return (
    <>
      <View>
        <TouchableOpacity
          onPress={() => handleNavigateBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 10,
          }}
        >
          <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
        </TouchableOpacity>
        {dataResponse?.projectId ? (
          <View style={stylesHeader.viewHeader}>
            <TouchableOpacity
              onPress={() => setTab(0)}
              style={!tab ? stylesHeader.box : stylesHeader.box2}
            >
              <Text style={!tab ? stylesHeader.title : stylesHeader.title2}>
                <FormattedMessage id="invoice.tab.title" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab(1)}
              style={tab ? stylesHeader.box : stylesHeader.box2}
            >
              <Text style={tab ? stylesHeader.title : stylesHeader.title2}>
                <FormattedMessage id="projects.tabs.activity.title" />
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {!tab ? (
          <>
            {requestApi ? (
              <ActivityIndicator size="large" color="#6c757d" />
            ) : (
              <>
                <View
                  style={[
                    styles.boxItem,
                    {
                      borderTopColor: statusInvoice(
                        dataResponse?.paidAmount,
                        dataResponse?.billedAmount
                      ),
                      marginTop: 15,
                    },
                  ]}
                >
                  <View style={{ marginBottom: 10 }}>
                    <View style={styles.flexRowSpaBet}>
                      <View>
                        <Text style={{ fontSize: 20, fontWeight: "500" }}>
                          {dataResponse?.title}
                        </Text>
                      </View>
                      <ModalMoreMoney data={dataResponse} />
                    </View>
                    <Text style={{ fontSize: 17 }}>
                      {dataResponse?.description}
                    </Text>
                    <View style={{ marginBottom: 10 }}>
                      {dataResponse?.dueDate && (
                        <Text style={styles.text16500}>
                          <FormattedMessage id="money-tracker.invoice.duedate" />
                          :{" "}
                          <FormatDateTime
                            datevalue={dataResponse?.dueDate}
                            type={1}
                          />
                        </Text>
                      )}
                    </View>
                  </View>
                  {dataResponse?.payments?.map((data, index) => (
                    <View key={index}>
                      <ItemPayment data={data} />
                    </View>
                  ))}
                  <View style={{ marginBottom: 10 }}>
                    {dataResponse?.fullyPaid && (
                      <Text style={styles.text16500}>
                        <FormattedMessage id="money-tracker.invoice.completed.on" />
                        :
                        <FormatDateTime
                          datevalue={dataResponse?.fullyPaidOn}
                          type={2}
                        />
                      </Text>
                    )}
                  </View>

                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.text17500}>
                      <FormattedMessage id="money-tracker.invoice.total.paid" />
                      :{" "}
                      {dataResponse?.paidAmount
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      {dataResponse?.currencyCode}
                    </Text>
                    <Text style={styles.text17500}>
                      <FormattedMessage id="money-tracker.invoice.total.invoiced" />
                      :{" "}
                      {dataResponse?.billedAmount
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      {dataResponse?.currencyCode}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 10 }}>
                    <View>
                      <Text style={styles.text16500}>
                        <FormattedMessage id="money-tracker.invoice.in.percentage" />
                        :{" "}
                        {(
                          (dataResponse?.paidAmount /
                            dataResponse?.billedAmount) *
                          100
                        ).toFixed(2)}
                        %
                      </Text>
                    </View>
                  </View>
                  {/* <View style={{ flexDirection: "row", marginTop: 10 }}>
                        {dataResponse?.firstName && <View><InitialUser FirstName={dataResponse?.firstName} LastName={dataResponse?.lastName} color={dataResponse?.color} /></View>}
                        <Text style={{ fontSize: 20, paddingLeft: 20, fontWeight: '500' }}>{dataResponse?.firstName} {dataResponse?.lastName} </Text>
                    </View> */}
                </View>
              </>
            )}
          </>
        ) : (
          <MoneyTrackerActivity projectId={dataResponse?.projectId} />
        )}
      </View>
    </>
  );
};

export default InvoiceView;
