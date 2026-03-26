import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    div: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
        backgroundColor: "#fff"
    },
    baseText: {
        fontSize: 16,
        paddingRight: 5,
    },
    View: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
    },
    View12: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomColor: '#ccc',
        width: '100%'
    },
    View2: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        paddingRight: 5,
    },
    text: {
        paddingRight: 5,
        fontWeight: '400',
        color: "#6c757d"
    },
    dataLength: {
        fontSize: 16,
        fontWeight: "300",
        color: "#6c757d"
    },
});
