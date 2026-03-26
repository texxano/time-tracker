import { StyleSheet, Platform, Dimensions } from 'react-native';
const windowWidth = Dimensions.get("window").width;

export const vacationStyles = StyleSheet.create({
    container: {
        backgroundColor: '#ebf0f3',
        padding: 15,
        borderRadius: 5,
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: 'center',
        // width: "100%",
        paddingVertical: 10
    },
    ViewInfoDay: {
        width: "100%",
        paddingVertical: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
        borderRadius: 5
    },
    listItem: {
        marginVertical: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: 'center',
        padding: 10,
        width: "100%",
    },
    userInfoDateContainer: {
        flexDirection: "row",
        alignItems: 'center',
        width: 'auto',
        paddingRight: 10

    },
    text: {
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: 'center',
        width: "100%",
        justifyContent: "space-between",
        borderColor: "#ccc",
        borderTopWidth: 1,
        padding: 10,
    },
    buttonDeny: {
        backgroundColor: '#ff0000',
    },
    buttonApprove: {
        backgroundColor: '#00ff00',
    },

    listItemUser: {
        marginVertical: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
    },
    userInfoContainerUser: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10
    },
    userText: {
        fontSize: 18,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
    },
    textDetail: {
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
    },

    vacationBottom: {
        borderTopWidth: 1,
        padding: 5,
        borderColor: "#ccc",
        flexDirection: "row",
        alignItems: 'center', width: "100%", justifyContent: "flex-end",
    },
    vacationBottomText: {
        color: "#fa002d"
    },
    boxApprover: {
        flexDirection: "row",
        alignItems: 'center',
        width: "100%",
        padding: 10,
        borderBottomWidth: 1,
        padding: 10,
        borderColor: "#ccc"
    },

    textDeny: {
        fontSize: 20,
        color: "#dc3545",
        width: "100%",
        padding: 10,
    },
    textPending: {
        fontSize: 20,
        color: "#EDA400",
        padding: 10,
    },

    navigationDate: {
        marginLeft: -15,
        margin: 10,
        marginTop: 20,
        width: windowWidth - 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    }
});
