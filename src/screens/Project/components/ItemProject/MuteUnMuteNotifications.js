import React from 'react'
import { useDispatch } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { modalStyle } from "../../../../asset/style/components/modalStyle"
import { muteNotificationsByProject, unMuteNotificationsByProject } from '../../../../redux/actions/Notifications/muteUnMuteNotifications.actions'

const MuteUnMuteNotifications = ({ projectId, isMutedForNotifications }) => {
    const dispatch = useDispatch();

    const handleMuteProject = (id) => {
        dispatch(muteNotificationsByProject(id));
    }
    const handleUnMuteProject = (id) => {
        dispatch(unMuteNotificationsByProject(id));
    }
    return (
        <>
            {isMutedForNotifications ? (
                <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handleUnMuteProject(projectId)}>
                    <Text style={modalStyle.modalTitleEdit}>
                        <FormattedMessage id="Unmute" />
                        <FontAwesome name="bell" size={18} color="#2196F3" />
                    </Text>
                </TouchableOpacity>

            ) : (
                <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handleMuteProject(projectId)}>
                    <Text style={modalStyle.modalTitleEdit}>
                        <FormattedMessage id="Mute" />
                        <FontAwesome name="bell-slash" size={18} color="#2196F3" />
                    </Text>
                </TouchableOpacity>

            )}
        </>
    )
}

export default MuteUnMuteNotifications
