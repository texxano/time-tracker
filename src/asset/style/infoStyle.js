import { StyleSheet } from 'react-native';

export const infoStyle = StyleSheet.create({

    conteinerTitle: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "flex-end",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        paddingBottom: 5,
        marginBottom: 20,
        paddingHorizontal: 5
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    video: {
        alignSelf: 'center',
        width: "100%",
        height: 500,
    },
    rowSpaceBetweenAlignItems: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }

});