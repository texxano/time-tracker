import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({

    guestsView: {
        marginVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#6c757d"
    },
    guestsText: {
        fontSize: 18,
        fontWeight: '500',
        paddingVertical: 10
    },
    userItem: {
        marginBottom: 10,
    },
    itemUserCalendar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pl2: {
        paddingLeft: 10,
    },
    lineHeight: {
        lineHeight: 20,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        color: 'gray',
    },
    pending: {
        color: 'orange',
        fontWeight: 'bold',
    },
    decline: {
        color: 'red',
        fontWeight: 'bold',
    },
    accepted: {
        color: 'green',
        fontWeight: 'bold',
    },
    viewDescription: {
        width: '100%',
        paddingVertical: 5
    },
    viewEventContainer: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 0.5,
        borderColor: "#6c757d",
    },
    modalbootomEvent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingVertical: 10,
        paddingBottom: 10,
        marginTop: 10,
        width: "100%",
        borderTopWidth: 0.8,
        borderTopColor: "#6c757d",
    },
    text17500: {
        fontSize: 17,
        fontWeight: '500'
    },
    text16500: {
        fontSize: 16,
        fontWeight: '500'
    },
    eventSwithch: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: "#d6d6d6",
        marginBottom: 10
    },
    inputDate: {
        paddingVertical: 5,
        paddingHorizontal: 8,
        marginBottom: 10,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: "#d6d6d6",
        backgroundColor: "#fff",
    },
    itemMoreOption:{
        padding: 10,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        minHeight: 30
    }
});
