import React, { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker';
import { useIntl, injectIntl } from 'react-intl'
const SelectStatusProject = ({ onSelect, select, openDropDown }) => {
    const intl = useIntl();
    const [statusProject, setStatusProject] = useState(select);
    const changeSelect = value => {
        setStatusProject(value)
        onSelect(value);
    };
    const [open, setOpen] = useState(openDropDown || false);
    const [items, setItems] = useState([
        { label: intl.formatMessage({ id: 'projects.form.status.new' }), value: 0 },
        { label: intl.formatMessage({ id: 'projects.form.status.progress' }), value: 1 },
        { label: intl.formatMessage({ id: 'projects.form.status.completed' }), value: 2 },
        { label: intl.formatMessage({ id: 'projects.form.status.block' }), value: 3 }
    ]);

    return (
        <>
            <DropDownPicker
                open={open}
                value={statusProject}
                items={items}
                setOpen={setOpen}
                setValue={(e) => changeSelect(e)}
                setItems={setItems}
                zIndex={2000}
                zIndexInverse={2000}
                style={{
                    fontSize: 15, borderColor: "#dee2e6", height: 40, borderRadius: 5, backgroundColor: '#fff'
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
            />
        </>
    )
}

export default injectIntl(SelectStatusProject)
