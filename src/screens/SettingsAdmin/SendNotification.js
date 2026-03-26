import React from 'react'
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { postAppUpdate } from "../../redux/actions/SettingsAdmin/appUpdate.actions"
import { useSelector, useDispatch } from "react-redux";

const SendNotification = () => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const request = state.appUpdate.updateRequest

    const handleUpdateApp = () => {
        dispatch(postAppUpdate());
    }

    return (
        <>
            <TouchableOpacity onPress={handleUpdateApp} style={{
                flexDirection: "row",
                borderRadius: 5,
                paddingHorizontal: 1,
                borderWidth: 2,
                borderColor: "#007bff",
                paddingVertical: 11,
                paddingHorizontal: 7,
            }}>
                <>
                    <FontAwesome name="send-o" size={18} color="#6c757d" />
                    <Text style={{ paddingLeft: 10 }}>Send Notification Update App </Text>
                    {request ? (<ActivityIndicator size="small" color="#6c757d" />) : (<Text>     </Text>)}
                </>
            </TouchableOpacity>
        </>
    )
}

export default SendNotification
