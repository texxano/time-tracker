/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator, Image, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedMessage } from 'react-intl';
import { useSelector } from "react-redux";

import http from "../../services/http";

import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
// Components
import FormatDateTime from '../../components/FormatDateTime'

export const CollapsibleView = ({ title, children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <View style={{ marginBottom: 10 }}>
            <TouchableWithoutFeedback onPress={toggleCollapse}>
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 5,
                        backgroundColor: "#fff",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                    }}
                >
                    <Text style={{ fontSize: 20, color: "#111" }}>
                        {title}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
            {collapsed ? (
                <View
                    style={{
                        borderWidth: 1,
                        borderTopWidth: 0,
                        borderColor: "#ccc",
                        borderBottomLeftRadius: 5,
                        borderBottomrightRadius: 5,
                        backgroundColor: "#fff",
                        paddingHorizontal: 15,
                        paddingBottom: 20
                    }}
                >
                    {children}
                </View>
            ) : null}
        </View>
    );
};

const OpenAiSearchList = () => {
    const state = useSelector(state => state)
    const openAiRequest = state.openAi?.openAiRequest

    const [search, setSearch] = useState("");
    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(null);
    const [dataResponse, setDataResponse] = useState([]);
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(true);

    useEffect(() => {
        if (!openAiRequest) {
            setRequestApi(true)
            http.get(`/openai/history${currentPage ? `?page=${currentPage}` : ''}${search ? `&search=${search}` : ''}`)
                .then((data) => {
                    setRequestApi(false)
                    setDataResponse(data.list);
                    setPageIndex(data.pageIndex)
                    setTotalPages(data.totalPages)
                    setDataLength(data.list.length === 0);
                })
        }
    }, [openAiRequest, currentPage, search]);
    const handleDownload = (url, name) => {
        saveAs(url, name);
    }
    const copyComment = (val) => {
        Clipboard.setString(val.replace(/<[^>]+>/g, ''))
    }

    return (
        <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
            <View >
                <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: '600' }}> <FormattedMessage id="openai.mudul.tilte.before" /></Text>
            </View>
            <View >
                <Search
                    onSearch={value => { setSearch(value) }}
                    onPageChange={page => setCurrentPage(page)}
                    placeholder={"search"}
                />
                {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
                <View>
                    {dataResponse?.map((data, index) =>
                        <View key={index}>
                            <CollapsibleView title={data?.request}>
                                <>
                                    {data?.searchHistoryType === 0 ?
                                        <>
                                            <TouchableOpacity onPress={() => copyComment(data.response)} style={{ paddingVertical: 5, flexDirection: 'row' }}>
                                                <Ionicons name="copy-outline" size={20} color="#6c757d" />
                                                <Text>Copy</Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 17 }}>{data.response}</Text>
                                        </>
                                        :
                                        <>
                                            <Image style={{ width: 300, height: 300, borderRadius: 8 }} source={{ uri: data.response }} />

                                            {/* <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(data.response, data.request)}><i className="fa-solid fa-download"></i> Dowload</button>
                                                            <img src={data.response} alt="" /> */}
                                        </>
                                    }
                                </>
                            </CollapsibleView>
                        </View>
                    )}


                </View>
                {dataLength ? (<Text style={{ paddingTop: 10 }}><FormattedMessage id="open.ai.list.noItems" /> </Text>) : (
                    <Pagination
                        onPageChange={page => setCurrentPage(page)}
                        currentPage={pageIndex}
                        total={totalPages}
                    />
                )}
            </View>
        </View>
    )
}

export default OpenAiSearchList
