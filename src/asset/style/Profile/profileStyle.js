import { StyleSheet } from 'react-native';

export const profileStyle = StyleSheet.create({
    text: {
        width: '30%',
        color: "#6c757d",
        fontSize: 17
    },
    title: {
        fontSize: 18, 
        color: "#6c757d", 
        fontWeight: '600'
    },
    box: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
    },
    buttonAdd: {
        backgroundColor: "#2196F3",
    },
    buttonClose: {
        backgroundColor: "#6c757d",
    },
    buttonEdit: {
        backgroundColor: "#f4891e",
    },
    boxtile: {
        paddingTop: 15,
        paddingBottom: 25,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        marginBottom: 10
    },
    boxNotifications: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 10
    },
    textNotifications: {
        color: "#6c757d",
        fontSize: 18,
        width: "80%"
    },


    boxDevices: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
        borderBottomWidth: 1,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#dee2e6",
        paddingHorizontal: 8,
        paddingVertical: 15,
        borderRadius: 8
    },
    box2: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap"
    },
    boxtitle: {
        paddingLeft: 15
    },
    titleDevices: {
        color: "#007bff",
        width: 220,
        fontWeight: "bold",
        fontSize: 17
    },

    dataLength: {
        fontSize: 16,
        fontWeight: "300",
        color: "#6c757d"
    },
});
