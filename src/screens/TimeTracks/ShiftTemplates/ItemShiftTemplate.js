import React from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { FormattedMessage } from 'react-intl';

import { NavigationService } from "../../../navigator";
import ModalModalMoreShiftTemplate from "./ModalModalMoreShiftTemplate";

const ItemShiftTemplate = ({ data }) => {
    function addLeadingZeros(num) {
        return String(num).padStart(2, '0');

    }
    return (
        <>
            <TouchableOpacity onPress={() => { NavigationService.navigate('Time', { locationActive: "0", id: data.id }); }}>
                <View style={{ marginVertical: 5, padding: 10, borderWidth: 2, borderColor: "#ccc", borderRadius: 5, backgroundColor: '#fff' }}>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 15, paddingTop: 10 }}>
                        <Text style={{ fontSize: 18 }}>{data.name}</Text>
                        <View style={{ width: 20 }}>
                            <ModalModalMoreShiftTemplate name={data.name} id={data.id} />
                        </View>
                    </View>
                    <View  >
                        {data.days.sort((a, b) => a.dayOfWeek - b.dayOfWeek)?.map((day, index) =>
                            <View key={`day-${day.dayOfWeek}-${index}`} style={{ padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 }}>
                                <Text style={{ fontSize: 15 }}><FormattedMessage id={`Day${day.dayOfWeek}`} /></Text>
                                <Text style={{ fontSize: 15 }}>{addLeadingZeros(day.fromHour)}:{addLeadingZeros(day.fromMin)} - {addLeadingZeros(day.toHour)}:{addLeadingZeros(day.toMin)}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </>
    )
}

export default ItemShiftTemplate
