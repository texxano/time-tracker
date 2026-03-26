import React from 'react'
import HeaderProject from "./components/HeaderProject";
import TaskList from '../Task/TaskList'
import TaskView from '../Task/TaskView';
import AppContainerClean from '../../components/AppContainerClean';

const TaskProject = (route) => {
    const { projectId, parentId, permissionCode, taskId } = route.navigation.state.params
    const dataNavigate = { projectId, parentId, permissionCode, taskId }

    return (
        <AppContainerClean location={'TaskProject'} >
            <HeaderProject location={'TaskProject'} projectId={projectId} parentId={parentId} permissionCode={permissionCode} />
            {taskId ?
                <TaskView id={taskId} projectViewMode={true} dataNavigate={dataNavigate} />
                :
                <TaskList projectId={projectId} projectViewMode={true} dataNavigate={dataNavigate} />
            }
        </AppContainerClean>
    )
}

export default TaskProject
