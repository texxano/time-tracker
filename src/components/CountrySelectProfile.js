import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import { Select, CheckIcon } from "native-base"

import http from '../services/http'

const CountrySelectProfile = ({ onSelectedCountryChange, selected }) => {
    const state = useSelector(state => state)
    const countryCode = state.userData?.countryCode
    
    const [selectedValue, setSelectedValue] = useState(selected || countryCode);
    const [countryData, setCountryData] = useState([]);

    async function countryChange(val) {
        setSelectedValue(val)
        onSelectedCountryChange(val)
    }
    useEffect(() => {
 const getData = async () => {
    const response = await http.get(`/countries`)
    setCountryData(response.data)
 }
    getData()
    }, []);

    return (
        <Select
            selectedValue={selectedValue}
            minWidth={"64%"}
            zIndex={9999}
            onValueChange={(itemValue) => countryChange(itemValue)}
            _selectedItem={{ bg: 'coolGray.200', endIcon: <CheckIcon size={6} />, }}
            style={{ fontSize: 17, height: 38, borderWidth: 0}}
        >
            {countryData?.map((data) =>
                <Select.Item label={data.name} value={data.id}></Select.Item>
            )}
        </Select>
    )
}

export default CountrySelectProfile
