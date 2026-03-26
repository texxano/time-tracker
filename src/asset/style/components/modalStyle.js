import { StyleSheet, Platform, Dimensions } from 'react-native';
const windowHeight = Dimensions.get("window").height;

export const modalStyle = StyleSheet.create({

    centeredView: {
        flex: 1,
        justifyContent: Platform.OS === 'ios' && windowHeight < 700 ? "flex-start" : "center",
        alignItems: "center",
        paddingTop: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    centeredViewProject: {
        flex: 1,
        justifyContent: Platform.OS === 'ios' && windowHeight < 700 ? "flex-start" : "center",
        alignItems: "center",
        paddingTop: Platform.OS === 'ios' ? 100 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    centeredViewSmall: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    modalView: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 8,
        paddingTop: 0,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalViewEvent: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 10,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalViewEdit: {
        width: "50%",
        backgroundColor: "white",
        borderRadius: 8,
        paddingTop: 0,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalViewEditStatus: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 8,
        paddingTop: 0,
        paddingBottom: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalViewEditUser: {
        width: "70%",
        backgroundColor: "white",
        borderRadius: 8,
        paddingTop: 0,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitleEditView: {
        borderTopColor: "#ccc",
        borderTopWidth: 1,
        width: "100%",
        justifyContent: "center",
        flexDirection: "row",

    },
    modalTitleEdit: {
        fontSize: 20,
        paddingVertical: 10,
        color: "#2196F3"
    },
    modalTitleEditDelete: {
        fontSize: 20,
        paddingVertical: 10,
        color: "#dc3545"
    },
    modalMoreTitlekUser: {
        fontSize: 17,
        paddingVertical: 10,
        color: "#007bff"
    },
    modalMoreTitlekUserDelete: {
        fontSize: 17,
        paddingVertical: 10,
        color: "#dc3545"
    },
    modalEditClose: {
        width: "100%",
        alignItems: 'flex-end',
        margin: 10,
        marginRight: 30,
    },
    modalEditUserClose: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        margin: 10,
        paddingHorizontal: 10,
        justifyContent: "space-between"
    },
    modalViewTitle: {
        // backgroundColor: "#2196F3",
        borderTopEndRadius: 8,
        borderTopStartRadius: 8,
        marginBottom: 10,
        width: "100%",
        borderBottomWidth: 0.8,
        borderBlockColor: '#ccc'
    },

    modalTitle: {
        fontSize: 20,
        padding: 15,
        color: "#6c757d",
        fontWeight: "600",
    },
    
    modalViewTitleDelete: {
        borderBottomWidth: 0.8,
        borderBlockColor: '#ccc',
        borderTopEndRadius: 8,
        borderTopStartRadius: 8,
        marginBottom: 10,
        width: "100%",
    },
    modalTitleDelete: {
        padding: 15,
        width: "100%",
        fontSize: 20,
        color: "#6c757d",
        fontWeight: "600",
    },
    modalInput: {
        width: "100%",
    },
    modalInputText: {
        fontSize: 16
    },
    paddingBottom60: {
        // paddingBottom: 60
    },
    modalInputDelete: {
        padding: 17,
        width: "100%",
    },

    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    textStylePermission: {
        color: "#6c757d",
    },
    ModalBottom: {
        flexDirection: "row",
        alignItems: 'center',
        backgroundColor: "#ebf0f3",
        width: "100%",
        justifyContent: "flex-end",
        paddingVertical: 10,
        paddingRight: 20,
        borderBottomEndRadius: 8,
        borderBottomStartRadius: 8
    },
    bodyModal: {
        flexDirection: "row",
        alignItems: 'center',
        width: "100%",
        paddingVertical: 10,
        padding: 20
    },

    title: {
        paddingLeft: 10,
        fontSize: 18
    },
    bold: {
        fontWeight: "bold",
    },

    button: {
        borderRadius: 5,
        padding: 7,
    },
    buttonClose: {
        backgroundColor: "#6c757d",
    },
    buttonCalculate: {
        backgroundColor: "#fff",
        color: "#2196F3",
        borderColor: "#2196F3",
        borderWidth: 1
    },
    buttonAccepted: {
        backgroundColor: "#fff",
        color: "#4CAF50",
        borderColor: "#4CAF50",
        borderWidth: 1
    },
    textStyleAccepted: {
        color: "#4CAF50",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonDecline: {
        backgroundColor: "#fff",
        color: "#f4891e",
        borderColor: "#f4891e",
        borderWidth: 1
    },
    textStyleDecline: {
        color: "#f4891e",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonVacationDelete: {
        color: "#fa002d",
        borderColor: "#fa002d",
        borderWidth: 1,
    },
    buttonAdd: {
        backgroundColor: "#2196F3",
        marginLeft: 5
    },
    textbuttonAdd: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonBlueOutline: {
        color: "#2196F3",
        borderWidth: 1,
        borderColor: "#2196F3",
        borderRadius: 5,
        marginLeft: 5
    },
    textBlueOutline: {
        color: "#2196F3",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonOrangeOutline: {
        color: "#ffc107",
        borderWidth: 1,
        borderColor: "#ffc107",
        borderRadius: 5,
        marginLeft: 5
    },
    textOrangeOutline: {
        color: "#ffc107",
        fontWeight: "bold",
        textAlign: "center"
    },
    
    buttonGreeanOutline: {
        color: "#28a745",
        borderWidth: 1,
        borderColor: "#28a745",
        borderRadius: 5,
        marginLeft: 5
    },
    textGreeanOutline: {
        color: "#28a745",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonDelete: {
        backgroundColor: "#dc3545",
        marginLeft: 5
    },
    textStyleDelete: {
        color: "#dc3545",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonDeleteModal: {
        marginLeft: 20
    },
    btnCircle: {
        padding: 4,
        backgroundColor: "#dee2e6",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#c7cbcf",
        // marginLeft: 15,
        alignSelf: 'flex-start'
    },
    deleteItem: {
        backgroundColor: '#dc3545',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#b02a37",
        padding: 5,
        alignItems: "center"
    },
    buttonApprove: {
        backgroundColor: "#4CAF50"
    },
    buttonDeny: {
        backgroundColor: "#dc3545"
    },
    btnVacation: {
        padding: 7,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#c7cbcf",
        padding: 6,
        marginLeft: 10,
        alignSelf: 'flex-start'
    },
    modalViewFlex: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center"

    },
    progresContainer: {
        width: '100%',
        height: 10,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        borderRadius: 7,
    },
    progresLine: {
        position: 'absolute',
        top: 0,
        height: 5,

    },
});
