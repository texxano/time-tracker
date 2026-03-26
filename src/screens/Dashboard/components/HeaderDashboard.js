import React from "react"
import { NavigationService } from "../../../navigator";
import { View, Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector } from "react-redux";
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { styles } from "../../../asset/style/components/header"
import { check } from '../../../utils/statusUser'

const HeaderDashboard = ({ location }) => {
    const state = useSelector(state => state)
    return (
        <>
            <View style={styles.viewHeader}>
                <TouchableOpacity style={location === 'Dashboard' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('Dashboard', { navigateRefresh: check() });
                }}>
                    <View style={styles.flexDirectionRow}>
                        <MaterialCommunityIcons name="folder-home-outline" size={24} color={location === 'Dashboard' ? "#007bff" : "#6c757d"} />
                    </View>
                    <Text style={location === 'Dashboard' ? styles.title : styles.title2} >
                        <FormattedMessage id="dashboard.title" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={location === 'FavoriteProject' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('FavoriteProject', {});
                }}>
                    <View style={styles.flexDirectionRow}>
                        <MaterialCommunityIcons name="folder-outline" size={24} color={location === 'FavoriteProject' ? "#007bff" : "#6c757d"} />
                        <MaterialCommunityIcons name="pin" size={10} color={location === 'FavoriteProject' ? "#007bff" : "#6c757d"} style={{ marginLeft: -15, marginTop: 9 }} />
                    </View>
                    <Text style={location === 'FavoriteProject' ? styles.title : styles.title2}>
                        <FormattedMessage id="favorite.project.title" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={location === 'DueDate' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('DueDate', {});
                }}>
                    <View style={styles.flexDirectionRow}>
                    <MaterialCommunityIcons name="calendar"  size={24} color={location === 'DueDate' ? "#007bff" : "#6c757d"} />
                    </View>
                    <Text style={location === 'DueDate' ? styles.title : styles.title2}>
                        <FormattedMessage id="Due.Date.Title" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={location === 'GlobalSearch' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('GlobalSearch', {});
                }}>
                    <View style={styles.flexDirectionRow}>
                        {/* <SimpleLineIcons name="globe" size={24} color={location === 'GlobalSearch' ? "#007bff" : "#6c757d"}  /> */}
                        <Feather name="search" size={24} color={location === 'GlobalSearch' ? "#007bff" : "#6c757d"} />
                    </View>
                    <Text style={location === 'GlobalSearch' ? styles.title : styles.title2}>
                        <FormattedMessage id="search" />
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

export default HeaderDashboard
