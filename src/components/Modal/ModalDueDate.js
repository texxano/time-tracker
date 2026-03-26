import React, { useState } from 'react'
import DatePicker from 'react-native-neat-date-picker'
import { Text, TouchableOpacity, View, Platform, Keyboard, Modal } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import Tooltip from "react-native-walkthrough-tooltip";
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { updateProject } from '../../redux/actions/Project/project.actions'

import { check } from '../../utils/statusUser'
import FormatDateTime from "../FormatDateTime";

import { globalStyles } from "../../asset/style/globalStyles"

const ModalDueDate = ({ projectdata, setcheckTokenExp, onDeadlineChange, date }) => {

    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const isAdministrator = state.userDataRole?.isAdministrator

    const { top } = useSafeAreaInsets();
    const [showTip, setTip] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(null)

    const handleOpenModalDeadline = () => {
        Keyboard.dismiss()
        setShowDatePicker(true)
        if (!date) {
            setcheckTokenExp(check())
        }
    }
    const onConfirm = (dueDate) => {
        setShowDatePicker(false)
        if (date) {
            onDeadlineChange(dueDate.date)
        } else {
            const { id, title, description, status, dataCapacity, address, blockReason } = projectdata;
            const payload = {
                id,
                title,
                description,
                status,
                capacity: dataCapacity,
                address,
                dueDate: dueDate.dateString,
                blockReason
            };
            dispatch(updateProject(payload));
        }
    }
    return (
        < >
            <Modal animationType="slide" transparent={true} visible={showDatePicker}  >
                <DatePicker
                    colorOptions={{ headerColor: '#2196F3', }}
                    isVisible={showDatePicker}
                    mode={'single'}
                    onCancel={() => setShowDatePicker(false)}
                    onConfirm={onConfirm}
                    minDate={new Date()}
                />
            </Modal>
            {(() => {
                if (date) {
                    return (
                        <>
                            <TouchableOpacity onPress={handleOpenModalDeadline} style={[globalStyles.alignItemsCenter, globalStyles.flexDirectionRow]}>
                                <Text style={globalStyles.fontSize16}><FormattedMessage id="Due.Date.Title" /> ? </Text>
                                <MaterialCommunityIcons name="calendar" size={22} color="#6c757d" />
                            </TouchableOpacity>
                        </>
                    )
                } else if (projectdata?.dueDate) {
                    return (
                        <>
                            {(() => {
                                if (isAdministrator) {
                                    return (
                                        <TouchableOpacity onPress={handleOpenModalDeadline} style={globalStyles.dueDate}>
                                            <MaterialCommunityIcons name="calendar" size={22} color="#6c757d" />
                                            <Text style={globalStyles.fontSize16}> <FormatDateTime datevalue={projectdata.dueDate} type={1} /></Text>
                                        </TouchableOpacity>
                                    )
                                } else if (projectdata.loggedUserPermissionCode > 1 && projectdata.parentId) {
                                    return (
                                        <TouchableOpacity onPress={handleOpenModalDeadline} style={globalStyles.dueDate}>
                                            <MaterialCommunityIcons name="calendar" size={22} color="#6c757d" />
                                            <Text style={globalStyles.fontSize16}> <FormatDateTime datevalue={projectdata.dueDate} type={1} /></Text>
                                        </TouchableOpacity>
                                    )
                                } else {
                                    return (
                                        <>
                                            {projectdata.dueDate ? (
                                                <Tooltip
                                                    isVisible={showTip}
                                                    content={<Text><FormattedMessage id="Due.Date.Title" /> </Text>}
                                                    onClose={() => setTip(false)}
                                                    placement="top"
                                                    topAdjustment={Platform.OS === 'android' ? -top : 0}
                                                >

                                                    <TouchableOpacity onPress={() => setTip(true)}>
                                                        <View style={globalStyles.dueDate}>
                                                            <MaterialCommunityIcons name="calendar" size={22} color="#6c757d" />
                                                            <Text style={globalStyles.fontSize16}> <FormatDateTime datevalue={projectdata.dueDate} type={1} /></Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </Tooltip>
                                            ) : (<></>)}
                                        </>
                                    )
                                }
                            })()}
                        </>
                    )
                } else {
                    return (
                        <>
                        </>
                    )
                }
            })()}


        </>
    )
}
export default ModalDueDate
