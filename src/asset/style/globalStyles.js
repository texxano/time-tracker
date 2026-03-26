import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    screenTitle: {
        fontSize: 20,
        color: "#6c757d",
        fontWeight: '600'
    },
    btnCircle: {
        backgroundColor: "#dee2e6",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#c7cbcf",
        padding: 4.5,
        marginLeft: 8,
        alignSelf: 'flex-start'
    },
    box: {
        backgroundColor: '#ebf0f3',
        paddingVertical: 15,
        borderRadius: 5,
        height: 'auto',
    },
    project: {
        backgroundColor: '#fff',
        marginBottom: 8,
        height: 'auto',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        padding: 10,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
    },
    projectReport: {
        backgroundColor: '#fff',
        marginBottom: 8,
        height: 'auto',
        zIndex: 999,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingTop: 8,
        borderRadius: 5,
        marginTop: 5
        // shadowColor: '#000',
        // shadowOffset: { width: 1, height: 1 },
        // shadowOpacity: 0.4,
        // shadowRadius: 3,
        // elevation: 5
    },
    bottomProjectReport: {
        flexDirection: "row",
        alignSelf: 'flex-start',
        flexWrap: "wrap"
    },
    projectTitleBox: {
        width: "87%",
        alignItems: "center",
        flexDirection: 'row'
    },
    projectTitle: {
        fontSize: 20,
        fontWeight: "500",
        marginBottom: 5,

    },
    projectParentTitle: {
        fontSize: 20,
        fontWeight: "500",
        marginBottom: 10,
        width: "65%",
        alignItems: "center"
    },
    morehorizontal: {
        paddingLeft: 8,
        paddingTop: 4
    },
    dataLength: {
        fontSize: 16,
        fontWeight: "300",
        color: "#6c757d",
        paddingLeft: 15
    },
    bottomProject: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "space-between"
    },
    bottomProject2: {
        flexDirection: "row",
        alignSelf: 'flex-start'
    },
    w86: {
        width: "84%"
    },
    completedSubProjects: {
        textAlign: "right",
        color: "#ccc",
        fontWeight: '500'
    },
    flexDirectionRow: {
        flexDirection: "row",
    },
    rowSpaceBetween: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    rowSpaceBetweenAlignItems: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    minHeight: {
        minHeight: 37
    },
    alignItemsCenter: {
        alignItems: "center"
    },
    fontSize16: {
        fontSize: 16,
        color: "#111"
    },
    dueDate: {
        alignItems: "center",
        flexDirection: "row",
    }

});
