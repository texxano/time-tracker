import { StyleSheet, Dimensions } from "react-native";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export const styles = StyleSheet.create({

    drawerContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
        backgroundColor: "#061525",
  
    },
    container: {
        flex: 1,
    },

    drawer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#f9fafb",
        zIndex: 100,
        borderTopWidth: 1,
        borderColor: "#dee2e6",
    },
    open: {
        width: windowWidth > 500 ? "50%" : "60%",
    },
    overlay: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: -1,
        width: windowWidth,
    },
    drawerItem: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#dee2e6",
        flexDirection: "row",
        alignItems: "flex-end",
    },
    drawerItemBottom: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#dee2e6",
        flexDirection: "row",
        alignItems: "flex-end",
    },

    itemNavigate: {
        fontSize: windowHeight < 800 ? 16 : 18,
        color: "#6c757d",
        fontWeight: "700",
        paddingLeft: 5,
    },

    bottomContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        paddingBottom: 20,
        zIndex: 2,
        backgroundColor: "#fff"
    },
});
