/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl';
import DropDownPicker from "react-native-dropdown-picker";

import http from '../../../services/http'

const SelectWithSearch = ({ modal, setBaseNumber, setSubNumber }) => {
    const [dataResponse, setDataResponse] = useState([]);
    const [dataResponseSub, setDataResponseSub] = useState([]);

    const [selectedValue, setSelectedValue] = useState("");
    const [selectedValueSub, setSelectedValueSub] = useState("");
    const [open, setOpen] = useState(false);
    const [openSub, setOpenSub] = useState(false);

    useEffect(() => {
        if (modal) {
            http.get(`/doctask/tasks/numbers?PageSize=50`,)
                .then((data) => {
                    setDataResponse(
                        data?.list?.map((val) => ({
                            label: val.number + '-' + val.description,
                            value: val.number,
                        }))
                    );
                })
        }
    }, [modal]);

    useEffect(() => {
        if (selectedValue) {
            http.get(`/doctask/tasks/numbers/sub/?BaseNumber=${selectedValue}`,)
                .then((data) => {
                    setDataResponseSub(
                        data?.list?.map((val) => ({
                            label: val.number + '-' + val.description,
                            value: val.number,
                        }))
                    );
                })
        }
    }, [selectedValue,]);
    const handleBaseNumber = (val) => {
        setSelectedValue(val)
        setBaseNumber(val)
    }
    const handleSubNumber = (val) => {
        setSelectedValueSub(val)
        setSubNumber(val)
    }

    return (
        <>
            <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={selectedValue}
                items={dataResponse}
                setValue={(val) => handleBaseNumber(val)}
                zIndex={8888}
                placeholder={<FormattedMessage id="search.select.option" />}
                style={{
                    fontSize: 13,
                    borderColor: "#dee2e6",
                    borderRadius: 5,
                    backgroundColor: "#fff",
                    marginBottom: 10
                }}
                dropDownContainerStyle={{
                    borderColor: "#dee2e6",
                }}
                listItemLabelStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                textStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                dropDownDirection="TOP"
            // disabled={false}
            />

            <DropDownPicker
                open={openSub}
                setOpen={setOpenSub}
                value={selectedValueSub}
                items={dataResponseSub}
                setValue={(val) => handleSubNumber(val)}
                zIndex={9999}
                placeholder={<FormattedMessage id="search.select.option" />}
                style={{
                    fontSize: 13,
                    borderColor: "#dee2e6",
                    borderRadius: 5,
                    backgroundColor: "#fff",
                    marginBottom: 10
                }}
                dropDownContainerStyle={{
                    borderColor: "#dee2e6",
                    zIndex: 9999
                }}
                listItemLabelStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                textStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                dropDownDirection="BOTTOM"
            // disabled={false}
            />
        </>
    )
}

export default SelectWithSearch
