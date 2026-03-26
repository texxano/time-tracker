import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSelector } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { NavigationService } from "../../navigator";
import { styles } from "../../asset/style/components/header"
// import LoaderLine from '../LoadingLine';

const Header = ({ location, toggleDrawer }) => {
    const state = useSelector(state => state)

    const isAdministrator = state.userDataRole?.isAdministrator
    const notificationsCountState = state.notificationsCount.count

    const timeTrackerEnabled = state.userDataModule?.timeTrackerEnabled
    const isTrackingState = state.isTimeTracks.isTracking
    const isChargingPerHourState = state.isChargingPerHour.isTracking
    const allowMobileTimeTracking = state.userData?.allowMobileTimeTracking

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { NavigationService.navigate('Dashboard') }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={styles.logo} source={require('../../asset/image/logo.png')} />
                        <Text style={{ fontSize: 24, paddingLeft: 5, color: '#0c0d0e' }}>texxano</Text>
                    </View>

                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
   
                    <TouchableOpacity onPress={toggleDrawer} style={styles.toggle}>
                        <Ionicons name="menu" size={30} color="#6c757d" />
                    </TouchableOpacity>
                </View>

                
                
            </View>
            {/* {!requestRefreshToken && <LoaderLine />} */}
        </>
    )
}

export default Header
