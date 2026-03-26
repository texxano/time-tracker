import React from 'react'
import { View } from 'react-native';
import LanguageSelect from '../LanguageSelect';

const HeaderLogin = () => {
    return (
        <View justifyContent="center" style={{padding: 10, alignItems: "flex-start", zIndex: 999 }}>
            <LanguageSelect />
        </View>
    )
}
export default HeaderLogin
