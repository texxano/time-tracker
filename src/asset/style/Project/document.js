import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    innerText: {
        color: 'red'
    },
    box: {
        flexDirection: "row",
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
    title: {
        color: "#007bff",
        width: 220
    },
    size: {
        color: "#6c757d"
    },
    dataLength: {
        fontSize: 16,
        fontWeight: "300",
        color: "#6c757d"
    },
    btnCircle: {
        backgroundColor: "#dee2e6",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#c7cbcf",
        padding: 6,
        marginLeft: 15,
        alignSelf: 'flex-start'
    },
});
