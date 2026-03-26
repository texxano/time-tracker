import React from 'react'
import HeaderInfo from './components/HeaderInfo';
import AppContainerClean from '../../components/AppContainerClean';

const QuickStart = (route) => {
    const location = route.navigation.state.params.location;
    return (
        <AppContainerClean location={location} >
            <HeaderInfo location={location} locationActive={"QuickStart"} />
            {/* <ScrollView style={{ backgroundColor: "#f8f9fa" }}>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="projects.add.title" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }}
                    noArrow={true} >
                    <Text>You can do the same process for each of your subproject</Text>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/createProject.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="Create.a.project" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }} noArrow={true}>
                    <Text>Each client has its own users, from where he can add, edit, delete or lock them regarding to its needs.
                        Users
                    </Text>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/user.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="Add.your.teammates" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }} noArrow={true}>
                    <Text>After creating your users, you can give permissions to them regarding to the project.</Text>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/userPermisions.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="Assign.permissions" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }} noArrow={true}>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/document.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="Upload.files" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }} noArrow={true}>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/document.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="Team.Interaction" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }} noArrow={true}>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <Text>You can see the activities for each project in the activities section.</Text>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/activity.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
                <CollapsibleView
                    title={<Text style={{ fontSize: 20, color: "#007bff" }}><FormattedMessage id="Activities.of.the.project" /></Text>}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", }} noArrow={true}>
                    <CollapsibleView noArrow={true} expanded={true} style={{ borderWidth: 0 }}>
                        <Text>You can see the activities for each project in the activities section.</Text>
                        <View style={infoStyle.container}>
                            <Video
                                style={infoStyle.video}
                                source={require("../../asset/video/activity.mp4")}
                                useNativeControls
                                resizeMode="contain"
                                isLooping
                            />
                        </View>
                    </CollapsibleView>
                </CollapsibleView>
            </ScrollView> */}
        </AppContainerClean >
    )
}

export default QuickStart
