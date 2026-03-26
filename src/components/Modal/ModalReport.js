import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Foundation, FontAwesome } from '@expo/vector-icons';
import DatePicker from 'react-native-neat-date-picker'
import { FormattedMessage } from 'react-intl';
import { Radio } from "native-base";
// Redux 
import { useSelector, useDispatch } from "react-redux";
import { reportTimeTrackPersonal, reportTimeTrackRoot, reportProjectStatus, reportTimeTrackUserRoot } from "../../redux/actions/Reports/reports.actions"
// Redux

// Components
import FormatDateTime from "../FormatDateTime";
import { dateFormat } from '../../utils/dateFormat'


import { modalStyle } from "../../asset/style/components/modalStyle"
import { globalStyles } from "../../asset/style/globalStyles"

const ModalReport = ({ projectId, reportFor, userId }) => {

    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const reportsState = state.reports.data
    const datefailure = state.reports.datefailure?.title
    const [modalGetReport, setModalGetReport] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [dateFrom, setDateFrom] = useState(new Date());
    const [dateTo, setDateTo] = useState(new Date());
    const [fileFormat, setfileFormat] = useState(1);

    useEffect(() => {
        if (reportsState?.date) {
            setModalGetReport(false)
            setSubmitted(false)
        }
    }, [reportsState])

    const [showDateFrom, setShowDateFrom] = useState(null)
    const [showDateTo, setShowDateTo] = useState(null)

    const handleOpenModal = () => {
        setModalGetReport(!modalGetReport)
    }
    const selectDateFrom = (from) => {
        setDateFrom(from.dateString)
        setShowDateFrom(false)
    }
    const selectDateTo = (to) => {
        setDateTo(to.dateString)
        setShowDateTo(false)
    }

    const handleReport = () => {
        // (reportFor:  0 reportProjectStatus , 1 reportTimeTrackPersonal, 2 reportTimeTrackRoot)
        setSubmitted(true)
        if (reportFor === 0) {
            const payload = { fileFormat, "dateFrom": dateFormat(dateFrom), "dateTo": dateFormat(dateTo), projectId }
            dispatch(reportProjectStatus(payload))
        } else if (reportFor === 1) {
            const payload = { fileFormat, "dateFrom": dateFormat(dateFrom), "dateTo": dateFormat(dateTo) }
            dispatch(reportTimeTrackPersonal(payload))
        } else if (reportFor === 2) {
            const payload = { fileFormat, "dateFrom": dateFormat(dateFrom), "dateTo": dateFormat(dateTo), projectId }
            dispatch(reportTimeTrackRoot(payload))
        } else if (reportFor === 3) {
            const payload = { fileFormat, "dateFrom": dateFormat(dateFrom), "dateTo": dateFormat(dateTo), userId }
            dispatch(reportTimeTrackUserRoot(payload))
        }
    }
    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalGetReport}>
                <DatePicker
                    colorOptions={{ headerColor: '#2196F3', }}
                    isVisible={showDateFrom}
                    mode={'single'}
                    onCancel={() => setShowDateFrom(false)}
                    onConfirm={selectDateFrom}
                    maxDate={new Date()}
                />
                <DatePicker
                    colorOptions={{ headerColor: '#2196F3', }}
                    isVisible={showDateTo}
                    mode={'single'}
                    onCancel={() => setShowDateTo(false)}
                    onConfirm={selectDateTo}
                    maxDate={new Date()}
                />
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalView}>
                        <View style={modalStyle.modalViewTitle}>
                            <Text style={modalStyle.modalTitle}>
                                <FormattedMessage id="Generate.Report" />
                            </Text>
                        </View>
                        <View style={modalStyle.modalInputDelete} >
                            <Text style={modalStyle.modalInputText}><FormattedMessage id="Date.From.To" /></Text>
                            <View style={styles.boxDate}>
                                <TouchableOpacity onPress={() => setShowDateFrom(true)} >
                                    <Text style={styles.inputDate}><FormatDateTime datevalue={dateFrom} type={1} /></Text>
                                </TouchableOpacity>
                                <Foundation name="arrow-right" size={24} color="#ccc" />
                                <TouchableOpacity onPress={() => setShowDateTo(true)} >
                                    <Text style={styles.inputDate}><FormatDateTime datevalue={dateTo} type={1} /></Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                <View>
                                    <Text style={modalStyle.modalInputText}><FormattedMessage id="File.Format" /></Text>
                                    <Radio.Group name="myRadioGroup" value={fileFormat} onChange={val => { setfileFormat(val); }}>
                                        <View style={globalStyles.bottomProjectReport}>
                                            <View style={{ flexDirection: "row", paddingRight: 10, }}>
                                                <Radio value={0} colorScheme="coolGray" my={1}>
                                                    <Text> <FontAwesome name="file-pdf-o" size={24} color="#fa0f00" /></Text>
                                                </Radio>
                                            </View>
                                            <View style={{ flexDirection: "row", paddingRight: 10 }}>
                                                <Radio value={1} colorScheme="coolGray" my={1}>
                                                    <Text> <MaterialCommunityIcons name="microsoft-excel" size={24} color="#28a745" /></Text>
                                                </Radio>
                                            </View>
                                            <View style={{ flexDirection: "row", paddingRight: 10, }}>
                                                <Radio value={2} colorScheme="coolGray" my={1}>
                                                    <Text> <FontAwesome5 name="file-csv" size={20} color="#28a745" /></Text>
                                                </Radio>
                                            </View>
                                        </View>
                                    </Radio.Group>
                                </View>
                            </View>
                            {submitted && datefailure && <Text style={{ fontSize: 14, color: "#dc3545" }}><FormattedMessage id={datefailure} /></Text>}
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalGetReport(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" /></Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleReport()}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.confirm" /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {(() => {
                if (reportFor === 0) {
                    return (
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handleOpenModal()}>
                            <Text style={modalStyle.modalTitleEdit}> <FormattedMessage id="Reportst.For.Status" /> </Text>
                        </TouchableOpacity>
                    )
                } else if (reportFor === 3) {
                    return (
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handleOpenModal()} >
                            <Text style={modalStyle.modalMoreTitlekUser}> <FormattedMessage id="Generate.Report" /></Text>
                        </TouchableOpacity>
                    )
                } else {
                    return (
                        <TouchableOpacity onPress={() => handleOpenModal()} style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>
                                <FormattedMessage id="Generate.Report" />
                            </Text>
                            <View style={styles.btnCalendar}>
                                <MaterialCommunityIcons name="calendar-edit" size={20} color="#6c757d" />
                            </View>
                        </TouchableOpacity>)
                }
            })()}
        </>
    )
}
const styles = StyleSheet.create({
    boxDate: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 10,
        marginBottom: 10,
    },
    inputDate: {
        fontSize: 18,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 5
    },
    btnCalendar: {
        backgroundColor: "#dee2e6",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#c7cbcf",
        padding: 6,
        marginLeft: 15,
        alignSelf: 'flex-start'
    }

});
export default ModalReport
