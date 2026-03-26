import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    box: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "30%",
    },
    box2: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingTop: 50,
        paddingBottom: 30,
        width: '90%',
        borderRadius: 10
    },
    logo: {
        width: 80,
        height: 80
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
    },
    textError: {
        fontSize: 14,
        color: "#dc3545"
    },
    boxChecbox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'flex-start',
        marginVertical: 5
    },
    buttonAdd: {
        backgroundColor: "#fff",
        borderColor: "#6c757d",
        borderWidth: 0.8,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center'
    },
    textSend: {
        color: "#6c757d",
        fontWeight: '600'
    },
    quickstartBox1: {
        borderRadius: 5,
    },
    quickstartBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f02e3a",
        borderRadius: 5,
        padding: 6,
        color: "#fff",
        fontSize: 18,
        marginLeft: 6
    },
    viewSingUp: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        marginHorizontal: 20,
        width: '80%',
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    textSingUp: {
        fontSize: 16,
        color: "#6c757d"
    },
    bottomElemet: {
        position: 'absolute',
        bottom: 20
    }
});
