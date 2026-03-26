import React from 'react'
import HeaderProject from "./components/HeaderProject";
import InvoicesList from '../MoneyTracker/InvoicesList';
import InvoiceView from '../MoneyTracker/InvoiceView';
import AppContainerClean from '../../components/AppContainerClean';
import { View } from 'react-native';

const MoneyProject = (route) => {
    const { projectId, parentId, permissionCode, invoicesId } = route.navigation.state.params
    const dataNavigate = { projectId, parentId, permissionCode, invoicesId }
    return (
        <AppContainerClean location={'MoneyProject'} >
                 <View style={{ height: "auto", marginBottom: 36 }}>
                    <HeaderProject location={'MoneyProject'} projectId={projectId} parentId={parentId} permissionCode={permissionCode} />
                    {invoicesId ?
                        <InvoiceView id={invoicesId} projectViewMode={true} dataNavigate={dataNavigate} />
                        :
                        <InvoicesList projectId={projectId} projectViewMode={true} dataNavigate={dataNavigate} />
                    }
                </View>
            </AppContainerClean>
    )
}

export default MoneyProject
