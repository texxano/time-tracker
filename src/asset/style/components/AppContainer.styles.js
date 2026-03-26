import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    parentConteinerApp: (insets, location) => ({
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: location === "Login" ? "#ebf0f3" : "#f9fafb",
        zIndex: 999
    }),
    scrollView: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    childrenView: {
        paddingTop: 5,
        paddingHorizontal: 10,
        paddingBottom: 20,
        backgroundColor: '#f9fafb',
    },
    childrenViewLogin: {
        flex: 1,
        backgroundColor: "#ebf0f3",
    }
});
