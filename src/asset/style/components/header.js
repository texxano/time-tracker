import { StyleSheet, Platform, Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;

export const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
        alignItems: "center",
        paddingBottom: 15,
        paddingTop: 15,
        backgroundColor:"#FFB020"
    },
    logo: {
        width: 50,
        height: 50,
        marginLeft: 10
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
        borderRadius: 6,
        backgroundColor: "#f5f5f5",
      },
    container: {
        paddingLeft: 3,
    },
    notifications: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#dee2e6",
        borderRadius: 5,
        paddingVertical: 9,
        paddingHorizontal: 3,
        height: 45,
        marginLeft: 10
    },
    notificationsCount: {
        backgroundColor: "#dc3545",
        height: Platform.OS === 'ios' ? 16 : 21,
        borderRadius: 5,
        paddingHorizontal: 3,
    },
    trackingstart: {
        flexDirection: "row",
        borderRadius: 5,
        paddingVertical: 1,
        paddingHorizontal: 1,
        backgroundColor: '#4CAF50'
    },
    trackingstop: {
        flexDirection: "row",
        borderRadius: 5,
        paddingHorizontal: 1,
        // backgroundColor: '#ebf0f3',
        borderColor: "#ccc",
        borderWidth: 1,
    },
    startTracking: {
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 2,
        borderColor: "#fff",
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",

    },

    viewHeader: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        backgroundColor: '#ebf0f3',
        borderRadius: 10,
        padding: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    viewHeaderReport: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        backgroundColor: '#ebf0f3',
        borderRadius: 10,
        padding: 5,
        alignItems: "center",
        marginBottom: 10,
        marginTop: 10
    },
    headerinfo: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        backgroundColor: '#ebf0f3',
        borderRadius: 10,
        padding: 5,
        alignItems: "center",
        marginVertical: 20
    },
    box: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    box2: {
        alignItems: "center",
        padding: 5,
    },
    title: {
        color: "#007bff",
        fontSize: windowWidth > 415 ? 16 : 14,
        fontWeight: Platform.OS === 'ios' ? '500' : '400'
    },
    title2: {
        color: "#21252980",
        fontSize: windowWidth > 415 ? 16 : 14,
        fontWeight: Platform.OS === 'ios' ? '500' : '400'
    },
    count: {
        marginLeft: 5,
        color: "#007bff",
        fontSize: 15,
    },
    count2: {
        color: "#21252980",
        marginLeft: 5,
        fontSize: 15,
    },

    titleInfo: {
        color: "#007bff",
        fontSize: 16,
    },
    titleInfo2: {
        color: "#21252980",
        fontSize: 16,
    },

    titleHeaderProject: {
        color: "#007bff",
        fontSize: 11,
    },
    titletitleHeaderProject2: {
        color: "#21252980",
        fontSize: 11,
    },
    flexDirectionRow: {
        flexDirection: "row"
    },
    toggle: {
        borderWidth: 1,
        padding: 6,
        borderColor: "#dee2e6",
        borderRadius: 5,
        marginHorizontal: 10,
        height: 45
    }
})
