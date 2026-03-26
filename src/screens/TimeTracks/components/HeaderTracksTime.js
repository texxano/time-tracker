import React from 'react'
import { NavigationService } from "../../../navigator";
import { View, Text, TouchableOpacity } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector } from "react-redux";
import { styles } from "../../../asset/style/components/header"

const HeaderTracksTime = ({ locationActive, userId }) => {
    const state = useSelector(state => state)
    const timeTrackerIsSupervisor = state.userDataModule?.timeTrackerIsSupervisor
    return (

        <View style={styles.viewHeader}>
            <TouchableOpacity style={locationActive === '' ? styles.box : styles.box2} onPress={() => {
                NavigationService.navigate('Time', { locationActive: "", id: "" });
            }}>
                <Text style={locationActive === '' ? styles.title : styles.title2}  >
                    <FormattedMessage id="My.Time.Tracks" />
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={locationActive === '5' && !userId ? styles.box : styles.box2} onPress={() => {
                NavigationService.navigate('Time', { locationActive: "5", id: "" });
            }}>
                <Text style={locationActive === '5' && !userId ? styles.title : styles.title2}  >
                    <FormattedMessage id="My.Time.Sheet" />
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={locationActive === '2' ? styles.box : styles.box2} onPress={() => {
                NavigationService.navigate('Time', { locationActive: "2", id: "" });
            }}>
                <Text style={locationActive === '2' ? styles.title : styles.title2}  >
                    <FormattedMessage id="My.Time.Shift" />
                </Text>
            </TouchableOpacity>
            {timeTrackerIsSupervisor ? (
                <>
                    <TouchableOpacity style={locationActive === '0' ? styles.box : styles.box2} onPress={() => {
                        NavigationService.navigate('Time', { locationActive: "0", id: "" });
                    }}>
                        <Text style={locationActive === '0' ? styles.title : styles.title2} >
                            <FormattedMessage id="Shift.Templates.List" />
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={locationActive === '1' && !userId ? styles.box : styles.box2} onPress={() => {
                        NavigationService.navigate('Time', { locationActive: "1", id: "" });
                    }}>
                        <Text style={locationActive === '1' && !userId ? styles.title : styles.title2}>
                            <FormattedMessage id="Users.Configurations.List" />
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (<></>)}
        </View>
    )
}

export default HeaderTracksTime
