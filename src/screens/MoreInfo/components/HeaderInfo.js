import React from "react"
import { View, Text, Linking } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationService } from "../../../navigator";
import { styles } from "../../../asset/style/components/header"
import { infoStyle } from '../../../asset/style/infoStyle'

const HeaderInfo = ({ location, locationActive }) => {
    return (
        <>
            <View style={styles.headerinfo}>
                <TouchableOpacity style={locationActive === 'Overview' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('Overview', { location: location });
                }}>
                    <Text style={locationActive === 'Overview' ? styles.titleInfo : styles.titleInfo2} >
                        <FormattedMessage id="overview" />
                    </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={locationActive === 'QuickStart' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('QuickStart', { location: location });
                }}>

                    <Text style={locationActive === 'QuickStart' ? styles.titleInfo : styles.titleInfo2}>
                        <FormattedMessage id="quick.start" />
                    </Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={locationActive === 'Presentation' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('Presentation', { location: location });
                }}>

                    <Text style={locationActive === 'Presentation' ? styles.titleInfo : styles.titleInfo2}  >
                        <FormattedMessage id="presentation" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={locationActive === 'Privacy' ? styles.box : styles.box2} onPress={() => {
                    NavigationService.navigate('Privacy', { location: location });
                }}>

                    <Text style={locationActive === 'Privacy' ? styles.titleInfo : styles.titleInfo2}  >
                        <FormattedMessage id="terms.conditions" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.box2} onPress={() => {
                    Linking.openURL('mailto:support@texxano.com?subject=Support%20Texxano%20App')
                }}>
                    <Text style={styles.titleInfo2}>
                        <FormattedMessage id="support" />
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={infoStyle.conteinerTitle}>
                {location === "Login" ? (
                    <TouchableOpacity onPress={() => { NavigationService.navigate('Login') }} style={infoStyle.rowSpaceBetweenAlignItems}>
                        <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                        <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => { NavigationService.navigate('Dashboard') }} style={infoStyle.rowSpaceBetweenAlignItems}>
                        <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                        <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    )
}

export default HeaderInfo
