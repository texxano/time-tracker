import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const Pagination = ({ onPageChange, currentPage, total, height }) => {
    const handlePageChange = (pageindex) => {
        onPageChange(pageindex)

    }

    return (
        <>
            {total > 0 ? (
                <View style={{ flexDirection: "row", marginTop: height || 30, justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.pageIndex}>
                        {currentPage}/{total}
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                        {currentPage > 1 ? (<>
                            <TouchableOpacity style={styles.pageChange} disabled={currentPage === 1} onPress={() => handlePageChange(1)}>
                                <AntDesign name="doubleleft" size={24} color="#6c757d" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.pageChange} disabled={currentPage === 1} onPress={() => handlePageChange(currentPage - 1)}>
                                <AntDesign name="left" size={24} color="#6c757d" />
                            </TouchableOpacity>
                        </>) : (<></>)}

                        {currentPage === total ? (<></>) : (<>
                            <TouchableOpacity disabled={currentPage === total} style={styles.pageChange} onPress={() => handlePageChange(currentPage + 1)}>
                                <AntDesign name="right" size={24} color="#6c757d" />
                            </TouchableOpacity>
                            <TouchableOpacity disabled={currentPage === total} style={styles.pageChange} onPress={() => handlePageChange(total)}>
                                <AntDesign name="doubleright" size={24} color="#6c757d" />
                            </TouchableOpacity>
                        </>)}
                    </View>
                </View>
            ) : (<></>)}
        </>
    )
}
const styles = StyleSheet.create({
    pageChange: {
        color: "#6c757d",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#dee2e6",
        marginHorizontal: 2,
        fontSize: 24,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5

    },
    pageIndex: {
        color: "#6c757d",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#dee2e6",
        marginHorizontal: 2,
        fontSize: 20,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
    },


});

export default Pagination
