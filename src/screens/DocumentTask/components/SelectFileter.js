import React, { useState } from 'react'
import { useIntl, injectIntl } from 'react-intl'
import DropDownPicker from "react-native-dropdown-picker";

const SelectFileter = ({ filterCode, setFilterCode }) => {
    const intl = useIntl();
    const documentStatus = [
        { value: 0, label: intl.formatMessage({ id: 'All' }) },
        { value: 1, label: intl.formatMessage({ id: 'document.task.status.incomplete' }) },
        { value: 2, label: intl.formatMessage({ id: 'document.task.status.overdue' }) },
        { value: 3, label: intl.formatMessage({ id: 'document.task.status.overdue.soon' }) },
        { value: 4, label: intl.formatMessage({ id: 'Complete.Step.Task.Button' }) },
        { value: 5, label: intl.formatMessage({ id: 'projects.form.status.new' }) },
    ]
    const [open, setOpen] = useState(false);

    return (
        <>
            <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={filterCode || filterCode === 0 ? filterCode : null}
                items={documentStatus}
                setValue={setFilterCode}
                zIndex={9999}
                placeholder={intl.formatMessage({ id: 'filter.by.status' })}
                listMode={"SCROLLVIEW"}
                style={{
                    fontSize: 13,
                    borderColor: "#dee2e6",
                    borderRadius: 5,
                    height: 20,
                    width: '100%',
                    backgroundColor: "#fff",
                    marginBottom: 40
                }}
                dropDownContainerStyle={{
                    borderColor: "#dee2e6",
                    width: '100%',
                }}
                listItemLabelStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                textStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
            // dropDownDirection="TOP"
            // disabled={false}
            />
        </>
    )
}

export default injectIntl(SelectFileter)
