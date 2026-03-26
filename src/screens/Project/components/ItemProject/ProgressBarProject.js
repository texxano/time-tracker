import React from 'react'
import { View, StyleSheet } from 'react-native';

const ProgressBarProject = ({ data }) => {
    if (data >= 0 && data <= 25) {
        return (
            <View style={styles.container}>
                <View style={[styles.line, { backgroundColor: "#dc3545", width: `${data}%` }]}/>
            </View>
        )
    } else if (data >= 26 && data <= 50) {
        return (
            <View style={styles.container}>
                <View style={[styles.line, { backgroundColor: "#ffc107", width: `${data}%` }]}/>
            </View>
        )
    } else if (data >= 51 && data <= 75) {
        return (
            <View style={styles.container}>
                <View style={[styles.line, { backgroundColor: "#17a2b8", width: `${data}%` }]}/>
            </View>
        )
    } else if (data >= 76) {
        return (
            <View style={styles.container}>
                <View style={[styles.line, { backgroundColor: "#28a745", width: `100%` }]}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 7,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        borderTopEndRadius: 5,
        borderTopStartRadius: 5,
    },
    line: {
        position: 'absolute',
        top: 0,
        height: 7,

    },
});
export default ProgressBarProject
