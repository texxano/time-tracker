import React, { useState, useEffect } from 'react'
import DropDownPicker from 'react-native-dropdown-picker';
import { createPermissions, updatePermissions, deleteByIdPermissions } from '../../../../redux/actions/Permissions/permissions.actions'
import { useSelector, useDispatch } from "react-redux";
import { useIntl, injectIntl } from 'react-intl'

const SelectPermissionsUser = ({ select, userId, projectId, idPermissions, length, disableUpdateOwner, parentId }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const isAdministrator = state.userDataRole?.isAdministrator
    const [permission, setselectedPermission] = useState(select);
    const [dropDownOpen, setDropDownOpen] = useState(false);
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([])
    useEffect(() => {
        if ((isAdministrator && disableUpdateOwner) || select === 3 || parentId) {
            setItems([
                { label: intl.formatMessage({ id: 'projects.form.users.status.none' }), value: null, },
                { label: intl.formatMessage({ id: 'projects.form.users.status.viewer' }), value: 0 },
                { label: intl.formatMessage({ id: 'projects.form.users.status.commenter' }), value: 1 },
                { label: intl.formatMessage({ id: 'projects.form.users.status.editor' }), value: 2 },
                { label: intl.formatMessage({ id: 'projects.form.users.status.owner' }), value: 3 }
            ])
        } else {
            setItems([{ label: intl.formatMessage({ id: 'projects.form.users.status.none' }), value: null, },
            { label: intl.formatMessage({ id: 'projects.form.users.status.viewer' }), value: 0 },
            { label: intl.formatMessage({ id: 'projects.form.users.status.commenter' }), value: 1 },
            { label: intl.formatMessage({ id: 'projects.form.users.status.editor' }), value: 2 },
            ])
        }
    }, [disableUpdateOwner, select]);

    const handlePermissions = (permissionCode, select, userId, projectId, id) => {
        if (dropDownOpen) {
            const includeChildProjects = true
            if (select === undefined || select === null) {
                const payload = { permissionCode, userId, projectId, includeChildProjects, }
                dispatch(createPermissions(payload));
            } else {
                if (permissionCode === null) {
                    dispatch(deleteByIdPermissions(id));
                } else {
                    const payload = { id, permissionCode, includeChildProjects }
                    dispatch(updatePermissions(payload));
                }
            }
        }
    }
    
    return (
        <>
            <DropDownPicker
                open={open}
                value={permission}
                items={items}
                setOpen={setOpen}
                setValue={setselectedPermission}
                onChangeValue={(value) => { handlePermissions(value, select, userId, projectId, idPermissions) }}
                onPress={(open) => setDropDownOpen(open)}
                setItems={setItems}
                zIndex={length}
                placeholder={intl.formatMessage({ id: 'projects.form.users.status.none' })}
                listMode="SCROLLVIEW"
                style={{ fontSize: 12, borderColor: "#dee2e6", height: 32, borderRadius: 4, width: 100, backgroundColor: (permission === 3 && !isAdministrator && !parentId) ? '#f5f5f5' : '#fff' }}
                dropDownContainerStyle={{ width: 100, borderColor: "#dee2e6"  }}
                dropDownDirection="BOTTOM"
                disabled={permission === 3 && !isAdministrator && !parentId}
                listItemLabelStyle={{
                    fontWeight: "500",
                    fontSize: 12
                }}
                textStyle={{
                    fontWeight: "500",
                    fontSize: 12 
                }}
            />
        </>
    )
}

export default injectIntl(SelectPermissionsUser)
