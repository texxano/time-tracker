import React from "react"
import { View, Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { TouchableOpacity } from 'react-native';
import { styles } from "../../../asset/style/components/header"

const HeaderReport = ({ location, onMacroCategoryChange }) => {
    return (
        <>
            <View style={styles.viewHeaderReport}>
                <TouchableOpacity style={location === 20 ? styles.box : styles.box2} onPress={() => {
                    onMacroCategoryChange(20)
                }}>

                    <Text style={location === 20 ? styles.title : styles.title2} >
                    <FormattedMessage id="Reportst.For.Status" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={location === 10 ? styles.box : styles.box2} onPress={() => {
                    onMacroCategoryChange(10)
                }}>

                    <Text style={location === 10 ? styles.title : styles.title2}>
                        <FormattedMessage id="Reports.for.Time" />
                    </Text>
                </TouchableOpacity>

            </View>
        </>
    )
}

export default HeaderReport
