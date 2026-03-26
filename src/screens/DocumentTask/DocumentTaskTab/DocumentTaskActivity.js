import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { Text, ActivityIndicator, View } from 'react-native';

// Helper function to check if a message should be translated
const shouldTranslateMessage = (message) => {
    if (!message) return false;
    
    // Static translation keys that should always be translated
    const staticKeys = [
        'SubtaskDocument.Signed',
        'SubtaskDocuments.Added',
        'DocumentSubtask.Approved',
        'DocumentTask.Name.Updated',
        'DocumentTask.Description.Updated',
        'DocumentTask.DueDate.Updated',
        'DocumentSubtask.Documents.Added',
        'TaskDocuments.Added',
        'TaskDocuments.Removed'
    ];
    
    // If it's a static key, always translate
    if (staticKeys.includes(message)) return true;
    
    // If message contains dynamic content (project names, dates, user names), don't translate
    const dynamicPatterns = [
        /Root Project:/,
        /Project:/,
        /Period:/,
        /By .+\./,
        /members of/,
        /Time Logs for/,
        /Automatic Time Logs/,
        /added documents .+ to Document Subtask/,
        /\w+ \w+ added documents/,
        /\w+ \w+ (created|updated|completed|assigned)/i,  // Common activity patterns
        /\d{1,2}\/\d{1,2}\/\d{4}/,  // Date patterns
        /\d{1,2}-\d{1,2}-\d{4}/     // Date patterns
    ];
    
    return !dynamicPatterns.some(pattern => pattern.test(message));
};

// Redux 
import { useSelector } from "react-redux";
import http from '../../../services/http'
// Redux 

// Components
import InitialUser from "../../../components/InitialUser";
import FormatDateTime from "../../../components/FormatDateTime";
import Pagination from "../../../components/Pagination";
import Search from "../../../components/Search";
// Components

import { styles } from "../../../asset/style/Project/activity"

const DocumentTaskActivity = ({ id, type }) => {
    const state = useSelector(state => state)
    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState("");
    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(true);

    useEffect(() => {
            if (currentPage) {
                setRequestApi(true);
                http.get(`/doctask/${type ? `sub` : 'tasks'}/${id}/activity${currentPage ? `?page=${currentPage}` : ''}${search ? `&search=${search}` : ''}`)
                    .then((data) => {
                        setRequestApi(false)
                        setPageIndex(data.pageIndex)
                        setTotalPages(data.totalPages)
                        setDataResponse(data);
                        setDataLength(data.length === 0);
                    })
                    .catch((error) => {
                        console.error('error', error)
                        setRequestApi(false)
                    })
            }
    }, [currentPage, search]);
    useEffect(() => {
        if (dataLength && currentPage > 1) {
            setCurrentPage(1)
        }
    }, [dataLength, currentPage]);

    return (
        <>
            <Search
                onSearch={value => { setSearch(value) }}
                onPageChange={page => setCurrentPage(page)}
                placeholder={"activity.filter.title"}
            />
            <View style={styles.div}>
                {dataResponse.map((data, index) =>
                    <View style={index === dataResponse.length - 1 ? styles.View12 : styles.View} key={index}>
                        {data?.firstAndLastName && <InitialUser FirstName={data?.firstAndLastName?.split(' ')[0]} LastName={data?.firstAndLastName?.split(' ')[1]} email={''} color={'#ccc'} />}
                        <View style={{ marginLeft: 20, paddingRight: 8 }}>
                            <View style={styles.View2} >
                                <Text style={styles.baseText} >
                                    {data.firstAndLastName}
                                </Text>
                                <Text style={styles.text}>
                                    {shouldTranslateMessage(data.description) ? (
                                        <FormattedMessage id={data.description} />
                                    ) : (
                                        data.description || ''
                                    )}
                                </Text>
                                <Text style={{ paddingRight: 5, fontWeight: '400', color: "#6c757d", }}>{data.messageArgument}</Text>
                            </View>
                            <Text style={{ fontWeight: '400', color: "#6c757d", }}>
                                <FormatDateTime datevalue={data.timestamp} type={2} />
                            </Text>
                        </View>
                    </View>
                )}
                {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
            </View>
            {dataLength ? (<Text style={styles.dataLength}><FormattedMessage id="activity.list.noItems" /></Text>
            ) : (
                <Pagination
                    onPageChange={page => setCurrentPage(page)}
                    currentPage={pageIndex}
                    total={totalPages}
                    checkTokenExpPagination={e => console.log(e)}
                />
            )}

        </>
    )
}

export default DocumentTaskActivity
