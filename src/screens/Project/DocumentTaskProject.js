import React from 'react'
import HeaderProject from "./components/HeaderProject";
import DocumentTaskList from '../DocumentTask/DocumentTaskTab/DocumentTaskList'
import DocumentTaskView from '../DocumentTask/DocumentTaskTab/DocumentTaskView';
import DocumentSubTaskView from '../DocumentTask/DocumentTaskTab/DocumentSubTaskView';
import AppContainerClean from '../../components/AppContainerClean';

const DocumentTaskProject = (route) => {
    const { projectId, parentId, permissionCode, documentTaskId, documentSubTaskId } = route.navigation.state.params
    const dataNavigate = { projectId, parentId, permissionCode, documentTaskId, documentSubTaskId}

    return (
        <AppContainerClean location={'DocumentTaskProject'} >
            <HeaderProject location={'DocumentTaskProject'} projectId={projectId} parentId={parentId} permissionCode={permissionCode} />
            {(() => {
                if (documentTaskId) {
                    return (
                        <DocumentTaskView id={documentTaskId} projectViewMode={true} dataNavigate={dataNavigate} />
                    )
                } else if (documentSubTaskId) {
                    return (
                        <DocumentSubTaskView id={documentSubTaskId} projectViewMode={true} dataNavigate={dataNavigate} />
                    )
                } else {
                    return (
                        <DocumentTaskList projectId={projectId} projectViewMode={true} dataNavigate={dataNavigate} />
                    )
                }
            })()}
        </AppContainerClean>
    )
}

export default DocumentTaskProject
