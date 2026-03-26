
import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, ActivityIndicator, FlatList, Dimensions, StyleSheet, ScrollView } from 'react-native';
// Redux 
import { useSelector } from "react-redux";
import http from '../../../services/http'
// Redux
import Pagination from "../../../components/Pagination";
import Search from "../../../components/Search";
const windowWidth = Dimensions.get("window").width;

// Constants
const DocumentType = {
    0: 'entry.document',
    1: 'internal.document',
    2: 'external.document',
    3: 'other.document'
};
const CollectionView = ({ id }) => {
    const state = useSelector(state => state)
    const documentTasksRequest = state.documentTask.documentTasksRequest
    const [dataResponse, setDataResponse] = useState([]);
    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(null);
    const [search, setSearch] = useState("");
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(true);
        
    useEffect(() => {
        if ( !documentTasksRequest) {
            setRequestApi(true)
            http.get(`/doctask/books/${id}${search ? `&search=${search}` : ''}`,)
                .then((data) => {
               
                    setRequestApi(false)
                    setDataResponse(data.list.sort((x, y) => parseInt(y.doctaskNumber) - parseInt(x.doctaskNumber)));
                    setPageIndex(data.pageIndex)
                    setTotalPages(data.totalPages)
                    setDataLength(data.list.length === 0);
                })
        }
    }, [ documentTasksRequest, currentPage, search, id]);

    const calculateDeadline = (dueDate, completedOn) => {
        const dueDateObj = new Date(dueDate);
        const currentDateObj = completedOn ? new Date(completedOn) : new Date();
        const daysDifference = Math.floor((currentDateObj - dueDateObj) / (1000 * 60 * 60 * 24));

        if (completedOn) {
            if (daysDifference > 0) {
                return (
                    <FormattedMessage id="task.completedOverdue"
                        values={{ days: daysDifference }}
                    />
                );
            } else {
                return (
                    <FormattedMessage id="task.completedBeforeDueDate"
                        values={{ days: Math.abs(daysDifference) }}
                    />
                );
            }
        } else {
            if (daysDifference > 0) {
                return (
                    <FormattedMessage
                        id="task.overdue"
                        values={{ days: daysDifference }}
                    />
                );
            } else {
                return (
                    <FormattedMessage
                        id="task.dueIn"
                        values={{ days: Math.abs(daysDifference) }}
                    />
                );
            }
        }
    };

    const getFormattedDate = (date) => {
        if (date) {
            const dateObj = new Date(date);
            return `${dateObj.getHours()}:${dateObj.getMinutes()} ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
        }
        return "/";
    };

    const renderDocumentTask = ({ item }) => (
        <View style={styles.taskContainer}>

            <ScrollView horizontal>
                <View style={styles.innerTable}>
                    <View style={styles.row}>
                        <Text style={styles.cellHeader}><FormattedMessage id="subject.number" /></Text>
                    </View>
                    <View style={{alignItems: "center"}}>
                        <Text style={styles.cellHeader}>{item.doctaskNumber}</Text>
                    </View>
                </View>
                <View style={styles.innerTable}>
                    <View style={styles.row}>
                        <Text style={styles.cellHeader}><FormattedMessage id="organization.unit" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="archive.sign" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="archive.subsign" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="content" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="requester" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="subject.type" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="deadline" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="created.on" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="completed.on" /></Text>
                        <Text style={styles.cellHeader}><FormattedMessage id="actions" /></Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>{item.sectorNumber}</Text>
                        <Text style={styles.cell}>{item.baseNumber}</Text>
                        <Text style={styles.cell}>{item.subnumber}</Text>
                        <Text style={styles.cell}>{item.description}</Text>
                        <Text style={styles.cell}>{item.requester}</Text>
                        <Text style={styles.cell}>Missing</Text>
                        <Text style={styles.cell}>{calculateDeadline(item.dueDate, item.completedOn)}</Text>
                        <Text style={styles.cell}>{getFormattedDate(item.creationDate)}</Text>
                        <Text style={styles.cell}>{getFormattedDate(item.completedOn)}</Text>
                        <Text style={styles.cell}></Text>
                    </View>
                    <View style={styles.separator}>
                        <Text style={styles.separatorText}><FormattedMessage id="documents.related.with.document.task" /></Text>
                    </View>
                    {item.documents.sort((x, y) => x.number - y.number).map((doc, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.cell}>/{doc.number}</Text>
                            <Text style={styles.cell}>{doc.name}</Text>
                            <Text style={styles.cell}><FormattedMessage id={DocumentType[doc.documentOriginType] ?? DocumentType[3]} /></Text>
                            <Text style={styles.cell}>{doc.doneBy}</Text>
                            <Text style={styles.cell}>{doc.signedBy}</Text>
                            <Text style={styles.cell}>{doc.action}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
    return (
        <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
            <View style={{ flexDirection: windowWidth > 420 ? "row" : "column", justifyContent: "space-between", alignItems: windowWidth > 420 ? "center" : "flex-start", paddingBottom: 8 }} >
                <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}>
                    <FormattedMessage id="document.task.collection.list" />
                </Text>

            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }} >
                <Search
                    onSearch={value => { setSearch(value) }}
                    onPageChange={page => setCurrentPage(page)}
                    placeholder={"document.task.collection.filter.title"}
                />
            </View>

            {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
            <FlatList
                data={dataResponse}
                renderItem={renderDocumentTask}
                keyExtractor={(item) => item.doctaskNumber.toString()}
            />
            {dataLength ? (<Text style={{ paddingTop: 10 }}><FormattedMessage id="document.task.collection.noItems" /> </Text>) : (<></>)}
            {!dataLength ? (
                <Pagination
                    onPageChange={page => setCurrentPage(page)}
                    currentPage={pageIndex}
                    total={totalPages}
                />
            ) : (<></>)}
        </View>
    )
}
const styles = StyleSheet.create({
    box: {
        marginVertical: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    taskContainer: {
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: "#fff"
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        padding: 8
    },
    cellHeader: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        padding: 8
    },
    innerTable: {
        borderColor: '#ccc',
        borderWidth: 1
    },
    separator: {
        backgroundColor: '#efeff0',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    separatorText: {
        textAlign: 'center',
        fontWeight: 'bold'
    }
});

export default CollectionView
