/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Switch,
} from "react-native";
import { Input } from "native-base";
import { useSelector, useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import { timeUserSupervisor } from "../../../redux/actions/TimeTracks/timeUserConfigurations.actions";
import CurrencySelect from "../../../components/CurrencySelect";

const ModalUserSupervisorTime = ({ dataUser }) => {
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const trackingState = state.timeTracks;
    const token = state.userToken.token;

    const [modalSupervisor, setModalSupervisor] = useState(false);
    const userId = dataUser?.userId;

    useEffect(() => {
        if (trackingState) {
            setModalSupervisor(false);
        }
    }, [trackingState]);

    const [isSupervisor, setIsSupervisor] = useState(dataUser?.isSupervisor);
    const [isChargingPerHour, setIsChargingPerHour] = useState(
        dataUser?.isChargingPerHour
    );
    const [pricePerHour, setPricePerHour] = useState(
        dataUser?.pricePerHour.toString()
    );
    const [currencyCode, setCurrencyCode] = useState(dataUser?.currencyCode);

    const handleOpenModal = () => {
        setModalSupervisor(true);
    };

    const handleisIsSupervisor = () => {
        const payload = {
            userId,
            isSupervisor,
            isChargingPerHour,
            pricePerHour: parseInt(pricePerHour),
            currencyCode,
        };
        dispatch(timeUserSupervisor(payload));
    };
    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalSupervisor}>
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalView}>

                        <View style={modalStyle.modalViewTitle}>
                            <Text style={modalStyle.modalTitle}>
                                {dataUser.firstName} {dataUser.lastName}
                            </Text>
                        </View>
                        <View
                            style={[
                                modalStyle.modalInput,
                                modalStyle.bodyModal,
                                { justifyContent: "space-between" },
                            ]}
                        >
                            <Text style={{ fontSize: 20, paddingRight: 10 }}>
                                <FormattedMessage id="Is.Supervisor" />
                            </Text>
                            <Switch
                                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                thumbColor={isSupervisor ? "#007bff" : "#f4f3f4"}
                                ios_backgroundColor="#7d7d7d"
                                onValueChange={() => setIsSupervisor(!isSupervisor)}
                                value={isSupervisor}
                            />
                        </View>
                        <View
                            style={[
                                modalStyle.modalInput,
                                modalStyle.bodyModal,
                                { justifyContent: "space-between" },
                            ]}
                        >
                            <Text style={{ fontSize: 20, paddingRight: 10 }}>
                                <FormattedMessage id="Is.Charging.Per.Hour" />
                            </Text>
                            <Switch
                                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                thumbColor={isChargingPerHour ? "#007bff" : "#f4f3f4"}
                                ios_backgroundColor="#7d7d7d"
                                onValueChange={() => setIsChargingPerHour(!isChargingPerHour)}
                                value={isChargingPerHour}
                            />
                        </View>
                        {isChargingPerHour ? (
                            <>
                                <Text
                                    style={{
                                        fontSize: 20,
                                        textAlign: "left",
                                        width: "100%",
                                        paddingHorizontal: 20,
                                    }}
                                >
                                    <FormattedMessage id="price.per.hour" />
                                </Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        width: "100%",
                                        paddingHorizontal: 20,
                                    }}
                                >
                                    <FormattedMessage id="price.per.hour">
                                        {(placeholder) => (
                                            <Input
                                                size={"lg"}
                                                _focus
                                                w="60%"
                                                keyboardType="numeric"
                                                placeholder={placeholder.toString()}
                                                value={pricePerHour}
                                                onChangeText={(e) => setPricePerHour(e)}
                                                my={3}
                                                style={{ height: 40, backgroundColor: "#fff" }}
                                            />
                                        )}
                                    </FormattedMessage>

                                    <CurrencySelect modal={modalSupervisor} currencyCode={currencyCode} setCurrencyCode={setCurrencyCode} />
                                </View>
                            </>
                        ) : (
                            <></>
                        )}
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity
                                style={[modalStyle.button, modalStyle.buttonClose]}
                                onPress={() => setModalSupervisor(false)}
                            >
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" />
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyle.button, modalStyle.buttonAdd]}
                                onPress={() => handleisIsSupervisor()}
                            >
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.confirm" />
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={handleOpenModal}>
                <View
                    style={{
                        backgroundColor: "#dee2e6",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#c7cbcf",
                        padding: 6,
                        marginLeft: 15,
                        alignSelf: "flex-start",
                    }}
                >
                    <Feather name="edit" size={20} color="#6c757d" />
                </View>
            </TouchableOpacity>
        </>
    );
};

export default ModalUserSupervisorTime;
