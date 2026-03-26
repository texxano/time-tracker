import React, { useEffect } from "react";
import { Text, TouchableOpacity, View, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useDispatch } from "react-redux";
import * as Google from 'expo-auth-session/providers/google';

import { GoogleAndroidClientId } from "../../utils/settings";
import { GoogleIOSClientId } from "../../utils/settings";
import { loginGoogle } from "../../redux/actions/Authentication/userAuth.actions"

const LoginGoogle = ({ payloadMobile }) => {
    const dispatch = useDispatch();
    let clientId = Platform.OS === 'ios' ? GoogleIOSClientId : GoogleAndroidClientId
    const [requestt, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: clientId,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const payload = {
                idToken: response.authentication.accessToken
            };
            dispatch(loginGoogle(payload, clientId, payloadMobile));
        }
    }, [response]);

    return (
        <>
            <TouchableOpacity onPress={() => {
                promptAsync();
            }} >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name="google" size={24} color="#6c757d" />
                    <Text> Google Login</Text>
                </View>
            </TouchableOpacity>
        </>
    )
}

export default LoginGoogle
