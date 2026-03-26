import React from 'react'
import { View, Text } from 'react-native';
import { FormattedMessage } from 'react-intl';

import HeaderInfo from './components/HeaderInfo';
import AppContainerClean from '../../components/AppContainerClean';

const Overview = (route) => {
    const location = route.navigation.state.params.location;
    return (
        <AppContainerClean location={location} >
            <HeaderInfo location={location} locationActive={"Overview"} />
            <View style={{ backgroundColor: "#f8f9fa", }}>
                <View style={{ paddingHorizontal: 20, backgroundColor: "#fff", borderWidth: 1, borderRadius: 10, borderColor: "#ccc", paddingVertical: 10, marginHorizontal: 10, }}>
                    <Text style={{ fontSize: 20, marginVertical: 10, color: "#dc3545" }}><FormattedMessage id="how.it.works" /></Text>
                    <Text style={{ fontSize: 18, marginVertical: 10, color: "#007bff" }}> <FormattedMessage id="client.management" /></Text>
                    <Text style={{ fontSize: 15, paddingLeft: 20 }}> <FormattedMessage id="client.description" /></Text>
                    <Text style={{ fontSize: 18, marginVertical: 10, color: "#007bff" }}> <FormattedMessage id="project.management" /></Text>
                    <Text style={{ fontSize: 15, paddingLeft: 20 }}> <FormattedMessage id="project.description" /></Text>
                    <Text style={{ fontSize: 18, marginVertical: 10, color: "#007bff" }}> <FormattedMessage id="progress" /></Text>
                    <Text style={{ fontSize: 18, marginVertical: 10, color: "#007bff" }}> <FormattedMessage id="teamInteraction" /></Text>
                    <Text style={{ fontSize: 15, paddingLeft: 20 }}> <FormattedMessage id="interaction.team1" /></Text>
                    <Text style={{ fontSize: 15, paddingLeft: 20 }}> <FormattedMessage id="interaction.team2" /></Text>
                    <Text style={{ fontSize: 15, paddingLeft: 20 }}> <FormattedMessage id="interaction.team3" /></Text>
                </View>
            </View>
        </AppContainerClean>
    )
}

export default Overview
