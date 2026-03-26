import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    baseText: {
        fontSize: 20,
    },

    baseBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderLeftWidth: 8,
        marginVertical: 5,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 15,
    },
    borderColor: {
        commentId: "#3d9bfe",
        reportId: "#6c757d",
        documentId: "#28a745",
        calendarId: "#EDA400",
        vacationRequestId: "#bf78de",
        shotgunTaskId: "#fcda43",
        documentTaskId: "#5876fc",
        documentSubtaskId: "#5876fc",
        projectId: "#dc3545",
        general: "#dee2e6",
    },
    borderLeft: {
        width: 8,
    },
    text: {
        fontSize: 16,
    },
    message: {
        fontWeight: '400',
        color: "#6c757d",
    },

    box2: {
        // flexDirection: "row",
        // alignItems: "center",
        // flexWrap: "wrap",
        width: '100%'
        // flex: 1, 
    },
    dataLength: {
        fontSize: 16,
        fontWeight: "300",
        color: "#6c757d"
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },

})
