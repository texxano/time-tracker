import React from 'react'
import { FormattedMessage } from 'react-intl';
import { View, Text, StyleSheet, } from 'react-native';

const RoleInProject = ({ loggedUserPermissionCode }) => {


    if (loggedUserPermissionCode === 0) {
        return (
            <View style={[styles.lablel, styles.Viewer]}>
                <Text style={styles.text}>
                    (<FormattedMessage id="projects.form.users.status.viewer" />)
                </Text>
            </View>
        )
    } else if (loggedUserPermissionCode === 1) {
        return (
            <View style={[styles.lablel, styles.Commenter]}>
                <Text style={styles.text}>
                    (<FormattedMessage id="projects.form.users.status.commenter" />)
                </Text>
            </View>
        )
    } else if (loggedUserPermissionCode === 2) {
        return (
            <View style={[styles.lablel, styles.Editor]}>
                <Text style={styles.text}>
                    (<FormattedMessage id="projects.form.users.status.editor" />)
                </Text>
            </View>
        )
    } else if (loggedUserPermissionCode === 3) {
        return (
            <View style={[styles.lablel, styles.Owner]}>
                <Text style={styles.text}>
                    (<FormattedMessage id="projects.form.users.status.owner" />)
                </Text>
            </View>
        )
    } else {
        return (
            <></>
        )
    }
}
const styles = StyleSheet.create({
    lablel: {
        fontSize: 20,
        padding: 3,
        paddingRight: 6,
        paddingLeft: 15,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 16,
        // color: "#fff",
        // fontWeight: "500"
    },
    // Viewer: {
    //     backgroundColor: "#007bff"
    // },
    // Commenter: {
    //     backgroundColor: "#6c757d"
    // },
    // Editor: {
    //     backgroundColor: "#17a2b8"
    // },
    // Owner: {
    //     backgroundColor: "#28a745"
    // }

});
export default RoleInProject
