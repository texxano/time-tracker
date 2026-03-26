/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Checkbox } from "native-base";

import { NavigationService } from "../../../navigator";

// Redux
import { useSelector } from "react-redux";
import http from "../../../services/http";
// Redux

// Components
import ItemStepDocTask from "./components/ItemStepDocTask";
import ModalSubTask from "./components/ModalSubTask";
import ModalSubTaskStatusButton from "./components/ModalSubTaskStatusButton";
import DocumentFileList from "./components/DocumentFileList";
import DocumentTaskActivity from "./DocumentTaskActivity";
import FormatDateTime from "../../../components/FormatDateTime";
//  Components

import { modalStyle } from "../../../asset/style/components/modalStyle";
import { globalStyles } from "../../../asset/style/globalStyles";
import flex from "../../../asset/style/flex.style";

const DocumentTaskView = ({ id, isArchivePerson }) => {
  const state = useSelector((state) => state);
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const documentTaskIsSupervisor =
    state.userDataModule?.documentTaskIsSupervisor;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;

  const [dataResponse, setDataResponse] = useState({});
  const [modal, setModal] = useState(false);
  const [modalComplete, setModalComplete] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showDocumentFiles, setShowDocumentFiles] = useState(false);

  useEffect(() => {
    if (!documentTasksRequest) {
      setRequestApi(true);
      http.get(`/doctask/tasks/${id}`).then((data) => {
        setRequestApi(false);
        setDataResponse(data);
      });
    }
  }, [documentTasksRequest]);

  const handleNavigateBack = () => {
    NavigationService.navigate("DocumentTask", { locationActive: "", id: "" });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 10,
      }}>
        <TouchableOpacity
          onPress={() => setShowDocumentFiles(!showDocumentFiles)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#28a745",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff", marginRight: 5 }}>
            List file documents
          </Text>
          <Ionicons 
            name={showDocumentFiles ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleNavigateBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
        </TouchableOpacity>
      </View>
      {requestApi ? (
        <View style={{ backgroundColor: "#ebf0f3", borderRadius: 5, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6c757d" />
        </View>
      ) : (
            <View style={{ flex: 1 }}>
          <ScrollView 
          style={{ backgroundColor: "#ebf0f3", borderRadius: 5 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
         {dataResponse.name ? (
           <View>
             {showDocumentFiles && (
               <View
                 style={{
                   borderTopWidth: 1,
                   borderLeftWidth: 1,
                   borderRightWidth: 1,
                   borderColor: "#ebf0f3",
                   borderTopLeftRadius: 5,
                   borderTopRightRadius: 5,
                   backgroundColor: "#fff",
                   padding: 10,
                 }}
               >
                 <View
                   style={{
                     marginVertical: 5,
                     borderBottomWidth: 1,
                     borderColor: "#ccc",
                     paddingBottom: 10,
                   }}
                 >
                   <View style={[flex.d_flex_center,flex.d_flex_between]}>
                     <Text style={{ fontSize: 20 }}>{dataResponse.name}</Text>
                     {dataResponse.description && (
                       <Text style={{ fontSize: 16 }}>
                         {dataResponse.description}
                       </Text>
                     )}
                   </View>
                 </View>

                 {documentTaskIsSupervisor &&
                 dataResponse.isCompleted === false ? (
                   <View
                     style={{
                       flexDirection: "row",
                       alignItems: "center",
                       justifyContent: "space-between",
                       marginVertical: 5,
                       marginVertical: 5,
                       borderBottomWidth: 1,
                       borderColor: "#ccc",
                       paddingBottom: 10,
                     }}
                   >
                     <View
                       style={{
                         flexDirection: "row",
                         alignItems: "center",
                         justifyContent: "space-between",
                       }}
                     >
                       <Text style={{ fontSize: 17 }}>
                         <FormattedMessage id="New.Step.In.Task" />{" "}
                       </Text>
                       <TouchableOpacity
                         onPress={() => setModal(true)}
                         style={[modalStyle.buttonGreeanOutline, { padding: 5 }]}
                       >
                         <AntDesign name="plussquareo" size={18} color="#28a745" />
                       </TouchableOpacity>
                     </View>
                     {dataResponse.steps?.length !== 0 &&
                     (!isArchivePerson || isOwnerForRoot) ? (
                       <TouchableOpacity
                         onPress={() => setModalComplete(true)}
                         style={[
                           modalStyle.button,
                           modalStyle.buttonGreeanOutline,
                           { flexDirection: "row", alignItems: "center" },
                         ]}
                       >
                         <Text style={modalStyle.textGreeanOutline}>
                           <FormattedMessage id="Complete.Step.Task.Button" />{" "}
                         </Text>
                         <AntDesign
                           name="checksquareo"
                           size={18}
                           color="#28a745"
                         />
                       </TouchableOpacity>
                     ) : null}
                   </View>
                 ) : (
                   <View>
                     <Text style={{ fontSize: 16 }}>
                       <FormattedMessage id="projects.form.status.completed" />:{" "}
                       <FormatDateTime
                         datevalue={dataResponse.completedOn}
                         type={2}
                       />
                     </Text>
                   </View>
                 )}
                 <DocumentFileList
                   taskDocuments={dataResponse?.taskDocuments}
                   type={0}
                 />
               </View>
             )}
            <View style={{ padding: 15 }}>
              <Text>
                <FormattedMessage id="document.task.of.list" />
              </Text>
              {dataResponse.documentSubtasks
                ?.sort((a, b) => a.order - b.order)
                ?.map((data, index) => {
                  return (
                    <View key={index}>
                      <ItemStepDocTask
                        data={data}
                        isDocumentTaskFinished={dataResponse.isCompleted}
                        subTaskId={data.id}
                      />
                    </View>
                  );
                })}

              <View
                style={[
                    globalStyles.rowSpaceBetweenAlignItems,
                    globalStyles.minHeight,
                  { width: "30%", },
                ]}
              >
                <Text style={globalStyles.screenTitle}>
                  <FormattedMessage id="projects.tabs.activity.title" />
                </Text>
                <Checkbox
                  isChecked={showActivity}
                  onChange={() => setShowActivity(!showActivity)}
                  value={showActivity}
                  colorScheme="red"
                />
              </View>
              {showActivity ? <DocumentTaskActivity id={id} type={0} /> : null}
            </View>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <Text>No data available. Debug info:</Text>
            <Text>requestApi: {requestApi.toString()}</Text>
            <Text>dataResponse: {JSON.stringify(dataResponse, null, 2)}</Text>
          </View>
        )}
        </ScrollView>
      </View>
      )}
      <ModalSubTask
        id={dataResponse.id}
        type={0}
        mode={0}
        modal={modal}
        setModal={setModal}
      />
      <ModalSubTaskStatusButton
        id={dataResponse.id}
        type={2}
        modal={modalComplete}
        setModal={setModalComplete}
      />
    </View>
  );
};

export default DocumentTaskView;
