import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    parentConteinerApp: (insets, location) => ({
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: location === "Login" ? "#f5e4b4" : "#f5e4b4",
        zIndex: 999
    }),
    scrollView: {
        flex: 1,
        backgroundColor: "#f5e4b4",
    },
    childrenView: {
        paddingTop: 5,
        paddingHorizontal: 10,
        paddingBottom: 20,
        backgroundColor: '#f5e4b4',
    },
    childrenViewLogin: {
        flex: 1,
        backgroundColor: "#f5e4b4",
    }
});
    