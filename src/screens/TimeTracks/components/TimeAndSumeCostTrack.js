import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, } from 'react-native';
import { FormattedMessage } from 'react-intl';
import FormatDateTime from "../../../components/FormatDateTime";

import TotalWorkTimeTrack from "./TotalWorkTimeTrack";
// Components

export const TimeAndSumeCostTrack = ({ dataCharge, data }) => {
    return (
        <View>
            <Text style={{ fontSize: 17, paddingBottom: 5 }}>
                <FormattedMessage id="Start" />: <Text style={{ fontWeight: "500" }}><FormatDateTime datevalue={dataCharge?.start} type={2} /></Text>
            </Text>
            { }
            <View style={{ flexDirection: "row", paddingVertical: 5 }}>
                <Text style={{ fontSize: 17 }}><FormattedMessage id="Total" />: </Text>
                <Text style={{ fontSize: 17, fontWeight: "500" }}>
                    <TotalWorkTimeTrack startDate={dataCharge?.start} stopDate={dataCharge?.stop || new Date()} />
                </Text>
                {(() => {
                    let minWork = Math.round(new Date().getTime() / 1000) - Math.round(new Date(dataCharge?.start).getTime() / 1000);
                    let sumCurrency = (minWork * (data?.pricePerHour / 3600)).toFixed(2)
                    return (
                        <Text style={{ fontSize: 17, fontWeight: "500" }}>{sumCurrency} {data.currencyCode} </Text>
                    )
                })()}
            </View>
            {dataCharge?.isTracking ? (
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 16, color: "#28a745", paddingRight: 10 }}>
                        <FormattedMessage id="projects.form.status.progress" />
                    </Text>
                    <ActivityIndicator size="small" color="#28a745" />
                </View>
            ) : ""}
        </View>
    )
}
