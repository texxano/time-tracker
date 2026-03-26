/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from 'react-intl';
import { Text, View, TouchableOpacity, Image } from 'react-native';
// Redux 
import { useSelector } from "react-redux";
// Redux
import { NavigationService } from "../../navigator";

// Components

import OpenAiSearchView from "./OpenAiSearchView";
import OpenAiSearchList from "./OpenAiSearchList";
import OpenAiUserConfigList from './OpenAiUserConfigList';

import { styles } from "../../asset/style/components/header"
import AppContainerClean from "../../components/AppContainerClean";

const OpenAiContainer = (route) => {
    const { locationActive, id } = route.navigation.state.params

    const state = useSelector(state => state)
    const openAiEnabled = state.userDataModule?.openAiEnabled
    const openAiIsSupervisor = state.userDataModule?.openAiIsSupervisor
    const isOwnerForRoot = state.userDataRole.isOwnerForRoot

    return (
        <AppContainerClean location={'OpenAi'} checkTokenExp={locationActive}>
            {(() => {
                if (openAiEnabled) {
                    return (
                        <>
                            <View >
                                <View style={styles.viewHeader}>
                                    <TouchableOpacity style={locationActive === '' ? styles.box : styles.box2} onPress={() => {
                                        NavigationService.navigate('OpenAi', { locationActive: "", id: "" });
                                    }}>
                                        <Text style={locationActive === '' ? styles.title : styles.title2}  >
                                            <FormattedMessage id="openai.mudul.tilte" />
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={locationActive === '2' ? styles.box : styles.box2} onPress={() => {
                                        NavigationService.navigate('OpenAi', { locationActive: "2", id: "" });
                                    }}>
                                        <Text style={locationActive === '2' ? styles.title : styles.title2}  >
                                            <FormattedMessage id="openai.mudul.tilte.before" />
                                        </Text>
                                    </TouchableOpacity>
                                    {openAiIsSupervisor ? (
                                        <>
                                            <TouchableOpacity style={locationActive === '1' ? styles.box : styles.box2} onPress={() => {
                                                NavigationService.navigate('OpenAi', { locationActive: "1", id: "" });
                                            }}>
                                                <Text style={locationActive === '1' ? styles.title : styles.title2}>
                                                    <FormattedMessage id="Users.Configurations.List" />
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (<></>)}
                                </View>
                                <View>
                                    {(() => {
                                        if (locationActive === "2") {
                                            return (
                                                <OpenAiSearchList />
                                            )
                                        } else if (locationActive === "1") {
                                            return (
                                                <OpenAiUserConfigList />
                                            )
                                        } else {
                                            return (
                                                <OpenAiSearchView />
                                            )
                                        }
                                    })()}
                                </View>
                            </View>
                        </>
                    )
                } else if (openAiEnabled === false) {
                    return (
                        <View />
                    )
                }
            })()}
        </AppContainerClean>
    )
}

export default OpenAiContainer
