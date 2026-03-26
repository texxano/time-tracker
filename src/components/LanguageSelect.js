import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux";

import { translation } from '../redux/actions/Translations/translation.action'
import { Select, CheckIcon } from "native-base"
import { useIntl, injectIntl } from 'react-intl'
import { updateLanguage } from "../redux/actions/UsersTeams/user.actions"
const LanguageSelect = () => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const authState = state.auth.loggedIn
    const language = state.userData.language
    const intl = useIntl();
    const [selectedValue, setSelectedValue] = useState(language);

    useEffect(() => {
        if (language === undefined) {
            setSelectedValue(0)
        } else {
            setSelectedValue(language)
        }
    }, [language]);

    async function languageChangeAl(val) {
        setSelectedValue(val)
        await dispatch(translation(val))
        if (authState) {
            dispatch(updateLanguage(val));
        }
    }

    return (
        <>
            <Select
                selectedValue={selectedValue}
                minWidth={130}
                onValueChange={(itemValue) => languageChangeAl(itemValue)}
                _selectedItem={{ bg: 'coolGray.200', color: 'white', endIcon: <CheckIcon size={6} />, }}
                style={{ fontSize: 17, height: 45, borderWidth: 0}}
            >
                <Select.Item label={intl.formatMessage({ id: 'language.label.english' })} value={0}></Select.Item>
                <Select.Item label={intl.formatMessage({ id: 'language.label.albanian' })} value={100}></Select.Item>
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.bulgarian' })} value={200}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.croatian' })} value={300}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.czech' })} value={400}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.dutch' })} value={500}></Select.Item> */}
                <Select.Item label={intl.formatMessage({ id: 'language.label.german' })} value={600}></Select.Item>
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.greek' })} value={700}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.hungarian' })} value={800}></Select.Item> */}
                <Select.Item label={intl.formatMessage({ id: 'language.label.macedonian' })} value={900}></Select.Item>
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.romanian' })} value={1000}></Select.Item> */}
                <Select.Item label={intl.formatMessage({ id: 'language.label.serbian' })} value={1100}></Select.Item>
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.slovak' })} value={1200}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.slovenian' })} value={1300}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.sweedish' })} value={1350}></Select.Item> */}
                {/* <Select.Item label={intl.formatMessage({ id: 'language.label.turkish' })} value={1400}></Select.Item> */}
            </Select>
        </>
    )
}

export default injectIntl(LanguageSelect)
