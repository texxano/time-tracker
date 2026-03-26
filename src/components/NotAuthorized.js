import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationService } from "../navigator";
import { infoStyle } from '../asset/style/infoStyle'
import { FormattedMessage } from 'react-intl';
import { check } from '../utils/statusUser'

const NotAuthorized = () => {
    return (
        <View style={{ backgroundColor: "#f8f9fa", }}>
            <View style={infoStyle.conteinerTitle}>
                <TouchableOpacity onPress={() => { NavigationService.navigate('Dashboard', { navigateRefresh: check() }) }} style={infoStyle.rowSpaceBetweenAlignItems}>
                    <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                    <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, backgroundColor: "#fff", borderWidth: 1, borderRadius: 10, borderColor: "#ccc", paddingVertical: 10, marginHorizontal: 10, }}>
                <Text style={{ fontSize: 20, marginVertical: 10, color: "#dc3545" }}>
                    <FormattedMessage id="User.Not.Authorized" />
                </Text>
            </View>
        </View>
    )
}

export default NotAuthorized
