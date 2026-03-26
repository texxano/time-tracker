import React from "react";
import { NavigationService } from "../../../navigator";
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector } from "react-redux";
import { TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialIcons, AntDesign, Octicons, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { styles } from "../../../asset/style/components/header";

const TabButton = ({ location, tabName, icon, iconType, count, navigationTarget, projectId, parentId, permissionCode, titleId }) => {
    const isActive = location === tabName;
    const color = isActive ? "#007bff" : "#6c757d";

    return (
        <TouchableOpacity style={isActive ? styles.box : styles.box2} onPress={() => {
            NavigationService.navigate(navigationTarget, { projectId, parentId, permissionCode });
        }}>
            <View style={styles.flexDirectionRow}>
                {React.createElement(iconType, { name: icon, size: 24, color })}
                <Text style={isActive ? styles.count : styles.count2}>
                    {count === undefined ? (
                        <ActivityIndicator size="small" color={color} />
                    ) : (
                        <>{typeof count === 'object' ? '...' : count}</>
                    )}
                </Text>
            </View>
            <Text style={isActive ? styles.titleHeaderProject : styles.titletitleHeaderProject2}>
                <FormattedMessage id={titleId} />
            </Text>
        </TouchableOpacity>
    );
};

const HeaderProject = ({ location, projectId, parentId, permissionCode }) => {
    const {
        projectCount, commentCount, documentCount, activitiesCount,
        taskCount, moneyTrackerCount, documentTaskCount,
        userDataModule
    } = useSelector(state => ({
        projectCount: state.projectCount.count,
        commentCount: state.commentCount.count,
        documentCount: state.documentCount.count,
        activitiesCount: state.activitiesCount.count,
        taskCount: state.taskCount?.count,
        moneyTrackerCount: state.moneyTrackerCount?.count,
        documentTaskCount: state.documentTaskCount?.count,
        userDataModule: state.userDataModule,
    }));

    const { shotgunEnabled, moneyTrackerEnabled, documentTaskEnabled } = userDataModule;

    return (
        <ScrollView horizontal={true}>
            <View style={styles.viewHeader}>
                <TabButton
                    location={location}
                    tabName="Project"
                    icon="folderopen"
                    iconType={AntDesign}
                    count={projectCount}
                    navigationTarget="Project"
                    projectId={projectId}
                    parentId={parentId}
                    permissionCode={permissionCode}
                    titleId="projects.tabs.projects.title"
                />
                <TabButton
                    location={location}
                    tabName="Documents"
                    icon="documents-outline"
                    iconType={Ionicons}
                    count={documentCount}
                    navigationTarget="Documents"
                    projectId={projectId}
                    parentId={parentId}
                    permissionCode={permissionCode}
                    titleId="projects.tabs.documents.title"
                />
                <TabButton
                    location={location}
                    tabName="Comments"
                    icon="comment-discussion"
                    iconType={Octicons}
                    count={commentCount}
                    navigationTarget="Comments"
                    projectId={projectId}
                    parentId={parentId}
                    permissionCode={permissionCode}
                    titleId="projects.tabs.comments.title"
                />
                {moneyTrackerEnabled && (
                    <TabButton
                        location={location}
                        tabName="MoneyProject"
                        icon="cash-outline"
                        iconType={Ionicons}
                        count={moneyTrackerCount}
                        navigationTarget="MoneyProject"
                        projectId={projectId}
                        parentId={parentId}
                        permissionCode={permissionCode}
                        titleId="money-tracker.tab.title"
                    />
                )}
                <TabButton
                    location={location}
                    tabName="Activity"
                    icon="playlist-add-check"
                    iconType={MaterialIcons}
                    count={activitiesCount}
                    navigationTarget="Activity"
                    projectId={projectId}
                    parentId={parentId}
                    permissionCode={permissionCode}
                    titleId="activity.title"
                />
            </View>
        </ScrollView>
    );
};

export default HeaderProject;
