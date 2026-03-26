import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { NavigationService } from "../../../navigator";

// Components
import FormatDateTime from "../../../components/FormatDateTime";
// import InitialUser from "../../../components/InitialUser";
import ModalMoreMoney from "./ModalMoreMoney";
import { statusInvoice } from "./statusInvoice";
import { styles } from "../MoneyTracker.Styles";

const ItemInvoice = ({ data, projectViewMode, dataNavigate }) => {

  const handleNavigate = () => {
    if (projectViewMode) {
      NavigationService.navigate("MoneyProject", {
        projectId: dataNavigate.projectId,
        parentId: dataNavigate.parentId,
        permissionCode: dataNavigate.permissionCode,
        invoicesId: data.id,
      });
    } else {
      NavigationService.navigate("MoneyTracker", {
        locationActive: "2",
        id: data.id,
      });
    }
  };

  return (
    <View
      style={[
        styles.boxItem,
        { borderTopColor: statusInvoice(data?.paidAmount, data?.billedAmount) },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={() => handleNavigate()}
          style={{ width: "90%" }}
        >
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "500" }}>
              {data?.title}
            </Text>
            <Text style={{ fontSize: 17 }}>{data?.description}</Text>
            {data?.dueDate && (
              <Text style={styles.text16500}>
                <FormattedMessage id="money-tracker.invoice.duedate" />:{" "}
                <FormatDateTime datevalue={data?.dueDate} type={1} />
              </Text>
            )}
          </View>
          {data?.fullyPaid && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.text16500}>
                <FormattedMessage id="money-tracker.invoice.completed.on" />:
                <FormatDateTime datevalue={data?.fullyPaidOn} type={2} />
              </Text>
            </View>
          )}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.text17500}>
              <FormattedMessage id="money-tracker.invoice.total.paid" />:{" "}
              {data?.paidAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
              {data?.currencyCode}
            </Text>
            <Text style={styles.text17500}>
              <FormattedMessage id="money-tracker.invoice.total.invoiced" />:{" "}
              {data?.billedAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
              {data?.currencyCode}
            </Text>
            <Text style={styles.text16500}>
              <FormattedMessage id="money-tracker.invoice.in.percentage" />:{" "}
              {((data?.paidAmount / data?.billedAmount) * 100).toFixed(2)}%
            </Text>
            {data?.projectId ? (
              <TouchableOpacity onPress={() => { NavigationService.navigate('Project', { projectId: data.projectId, }) }} style={{ flexDirection: 'row', alignItems: "center", paddingTop: 10 }}>
                <AntDesign name="folderopen" size={24} color={"#6c757d"} />
                <Text> {data.projectTitle}</Text>
              </TouchableOpacity>
            ) : (<></>)}
          </View>
          {/* <View style={{ flexDirection: "row", marginTop: 10 }}>
                        {data?.firstName && <View><InitialUser FirstName={data?.firstName} LastName={data?.lastName} color={data?.color} /></View>}
                        <Text style={{ fontSize: 20, paddingLeft: 20, fontWeight: '500' }}>{data?.firstName} {data?.lastName} </Text>
                    </View> */}
        </TouchableOpacity>
        <ModalMoreMoney data={data} />
      </View>
    </View>
  );
};

export default ItemInvoice;
