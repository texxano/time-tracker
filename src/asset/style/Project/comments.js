import { StyleSheet, Platform } from 'react-native';

const USER_ITEM_HEIGHT = 50;

export const styles = StyleSheet.create({
    itemComment: {
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "#e6f2ff",
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 5,
        borderWidth: 0.8
    },
    boxComment: {
        padding: 8,
        height: "auto",
        width: '90%',
        marginLeft: 10

    },
    dataLength: {
        fontSize: 16,
        fontWeight: "300",
        color: "#6c757d"
    },
    boxText: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    textGray: {
        color: "#6c757d",
        paddingRight: 5
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
    },
    buttonAdd: {
        backgroundColor: "#2196F3",
        marginLeft: 5,
        color: "#fff"
    },
    minHeightView: {
        minHeight: 250,
    },

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    textInputStyle: {
        backgroundColor: '#fff',
        width: 300,
        height: USER_ITEM_HEIGHT,
        borderRadius: 5,
        paddingHorizontal: 10,
        borderColor: '#c1c1c1',
        borderWidth: StyleSheet.hairlineWidth,
    },
    textInputTextStyle: {},
    suggestedUserComponentImageStyle: {
        width: USER_ITEM_HEIGHT * 0.65,
        height: 300,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        marginRight: 5,
        borderColor: '#111',
        borderWidth: 2,

    },
    suggestedUserComponentContainer: {
        alignSelf: 'stretch',
        backgroundColor: '#fff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: 'absolute',
        left: 0,
        right: 0,
    },
    suggestedUserComponentStyle: {
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
        height: 25,
        flexDirection: 'row',
    },
    mentionStyle: {
        fontWeight: '400',
        color: 'blue',
    },
    urlStyle: {
        fontWeight: '400',
        color: 'blue',
        textDecorationLine: 'underline',
    },
    // Example styles
    sendButtonStyle: {
        marginTop: 20,
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#efefef',
        borderRadius: 15,
    },
    exampleContainer: {
        alignSelf: 'stretch',
        flexDirection: 'column',
        paddingHorizontal: 30,
        marginVertical: 30,
    },
    exampleHeader: {
        fontWeight: '700',
    },

    title: {
        fontWeight: 'bold',
        alignSelf: 'center',
        paddingVertical: 10,
    },
    root: {
        flex: 1,
        // marginTop: StatusBar.currentHeight || 0,
        backgroundColor: '#fff',
        marginBottom: 20,
        borderWidth: 0,
        // height: 
    },
    editor: {
        // flex: 1,
        // padding: 0,
        borderColor: '#cecece',
        borderWidth: 1,
        backgroundColor: 'white',
        minHeight: 50,

    },
    boxSubmitComment: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        borderWidth: 0.8,
        borderRadius: 8,
        paddingVertical: 2,
        paddingLeft: 2,
        backgroundColor: "#fff",
        borderColor: "#ccc",
        paddingHorizontal: 10,
        width: "80%"
    },
    inputCommet: {
        paddingVertical: 20,
        paddingLeft: 10,
        marginTop: Platform.OS === "ios" ? 15: 0,
        borderWidth: 0,
        borderRadius: 8,


    }
});
