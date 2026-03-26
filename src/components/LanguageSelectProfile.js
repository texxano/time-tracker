import React, { useEffect, useState } from 'react'
import { useIntl, injectIntl } from 'react-intl'
import DropDownPicker from "react-native-dropdown-picker";
import { userService } from '../services/UsersTeams/user.services';

const LanguageSelectProfile = ({ onSelected, selected, disable }) => {
    const intl = useIntl();

    const languageOptions = [
        { label: intl.formatMessage({ id: 'language.label.english' }), value: 0 },
        { label: intl.formatMessage({ id: 'language.label.albanian' }), value: 100 },
        //   { label: intl.formatMessage({ id: 'language.label.bulgarian' }), value: 200 },
        //   { label: intl.formatMessage({ id: 'language.label.croatian' }), value: 300 },
        //   { label: intl.formatMessage({ id: 'language.label.czech' }), value: 400 },
        //   { label: intl.formatMessage({ id: 'language.label.dutch' }), value: 500 },
        { label: intl.formatMessage({ id: 'language.label.german' }), value: 600 },
        //   { label: intl.formatMessage({ id: 'language.label.greek' }), value: 700 },
        //   { label: intl.formatMessage({ id: 'language.label.hungarian' }), value: 800 },
        { label: intl.formatMessage({ id: 'language.label.macedonian' }), value: 900 },
        //   { label: intl.formatMessage({ id: 'language.label.romanian' }), value: 1000 },
        { label: intl.formatMessage({ id: 'language.label.serbian' }), value: 1100 },
        //   { label: intl.formatMessage({ id: 'language.label.slovak' }), value: 1200 },
        //   { label: intl.formatMessage({ id: 'language.label.slovenian' }), value: 1300 },
        //   { label: intl.formatMessage({ id: 'language.label.sweedish' }), value: 1350 },
        //   { label: intl.formatMessage({ id: 'language.label.turkish' }), value: 1400 }
    ];

    const [open, setOpen] = useState(false);

    const handleLanguageSelect = (item) => {
        // Call API when user selects a language
        userService.updateLanguage({ language: item.value })
            .then(() => {
                console.log('Language updated successfully to:', item.value);
            })
            .catch((error) => {
                console.error('Failed to update language:', error);
            });
    };

    return (
        <>
            <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={selected}
                items={languageOptions}
                setValue={onSelected}
                onSelectItem={handleLanguageSelect}
                zIndex={30}
                placeholder={intl.formatMessage({ id: "projects.form.users.language.placeholder" })}
                listMode="MODAL"
                modalProps={{
                    animationType: "fade",
                }}
                modalContentContainerStyle={{
                    backgroundColor: "#fff",
                }}
                style={{
                    fontSize: 13,
                    borderColor: "#dee2e6",
                    borderRadius: 5,
                    width: '100%',
                    backgroundColor: "#fff",
                }}
                dropDownContainerStyle={{
                    borderColor: "#dee2e6",
                    width: '100%',
                    maxHeight: 200,
                }}
                listItemLabelStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                textStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                dropDownDirection="AUTO"
                disabled={disable}
            />
        </>
    )
}

export default injectIntl(LanguageSelectProfile)
