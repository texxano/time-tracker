import React, { useEffect, useState } from 'react'
import { useIntl, injectIntl } from 'react-intl'
import DropDownPicker from "react-native-dropdown-picker";

import http from "../services/http";

const CurrencySelect = ({ modal, currencyCode, setCurrencyCode }) => {
    const intl = useIntl();

    const [currenciesData, setCurrenciesData] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (modal) {
            http.get(`/currencies`).then((data) => {
                setCurrenciesData(
                    data?.map((currency) => ({
                        label: currency.code,
                        value: currency.id,
                    }))
                );
            });
        }
    }, [modal]);

    return (
        <>
            <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={currencyCode}
                items={currenciesData}
                setValue={setCurrencyCode}
                zIndex={9999}
                placeholder={intl.formatMessage({ id: "Select.Currencies" })}
                listMode={"SCROLLVIEW"}
                style={{
                    fontSize: 13,
                    borderColor: "#dee2e6",
                    borderRadius: 5,
                    height: 20,
                    width: '40%',
                    backgroundColor: "#fff",
                }}
                dropDownContainerStyle={{
                    borderColor: "#dee2e6",
                    width: '40%',
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
        </>
    )
}

export default injectIntl(CurrencySelect)
