/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";

import { NavigationService } from "../../navigator";

import http from "../../services/http";
// Components
import DocumentTaskList from "./DocumentTaskTab/DocumentTaskList";
import DocumentTaskUserConfigList from "./DocumentTaskUserConfigList";
import DocumentTaskView from "./DocumentTaskTab/DocumentTaskView";
import DocumentSubTaskView from "./DocumentTaskTab/DocumentSubTaskView";
import DocumentTaskActivity from "./DocumentTaskTab/DocumentTaskActivity";
import { styles } from "../../asset/style/components/header";
import DocumentTaskCollectionList from "./CollectionConfigTab/CollectionList";
import ArchiveConfigurationList from "./ArchiveConfigTab/ArchiveConfigurationList";
import DocumentTaskSektorList from "./SektorConfigTab/DocumentTaskSektorList";
import CollectionView from "./CollectionConfigTab/CollectionView";
import DraftsList from "./Drafts/DraftsList";
import colors from "../../constants/Colors";
import flex from "../../asset/style/flex.style";
import SingleBookListInvoices from "./CollectionConfigTab/invoicesCollections/SingleBookListInvoices";
import AppContainerClean from "../../components/AppContainerClean";

const DocumentTaskContainer = (route) => {
  const { locationActive, id, type } = route.navigation.state.params;
  const state = useSelector((state) => state);
  const documentTaskEnabled = state.userDataModule?.documentTaskEnabled;
  const documentTaskIsSupervisor =
    state.userDataModule?.documentTaskIsSupervisor;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;

  const [requestApi, setRequestApi] = useState(true);
  const [isArchivePerson, setIsArchivePerson] = useState(null);
  const [dataResponse, setDataResponse] = useState(null);

  const { draftsCounter } = useSelector((state) => state.documentTaskDrafts);

  useEffect(() => {
    const getData = async () => {
      setRequestApi(true);
      http
        .get(`/doctask/users/me`)
        .then((data) => {
          setDataResponse(data);
          setIsArchivePerson(data.isArchivePerson);
        })
        .finally(() => {
          setRequestApi(false);
        });
    }
    getData();
  }, []);

  return (
    <AppContainerClean location={"DocumentTask"} checkTokenExp={locationActive}>
      {(dataResponse || isArchivePerson) && (
        <>
          {(() => {
            if (documentTaskEnabled) {
              return (
                <View style={{ flex: 1 }}>
                  {documentTaskIsSupervisor ||
                  isArchivePerson ||
                  isOwnerForRoot ? (
                    <View style={styles.viewHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          NavigationService.navigate("DocumentTask", {
                            locationActive: "",
                          });
                        }}
                        style={locationActive === "" ? styles.box : styles.box2}
                      >
                        <Text
                          style={
                            locationActive === "" ? styles.title : styles.title2
                          }
                        >
                          <FormattedMessage id="document.task.list" />
                        </Text>
                      </TouchableOpacity>
                      {isArchivePerson || isOwnerForRoot ? (
                        <TouchableOpacity
                          onPress={() => {
                            NavigationService.navigate("DocumentTask", {
                              locationActive: "5",
                            });
                          }}
                          style={
                            locationActive === "5" ? styles.box : styles.box2
                          }
                        >
                          <Text
                            style={
                              locationActive === "5"
                                ? styles.title
                                : styles.title2
                            }
                          >
                            <FormattedMessage id="document.task.collection.tab" />
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {isOwnerForRoot ? (
                        <TouchableOpacity
                          onPress={() => {
                            NavigationService.navigate("DocumentTask", {
                              locationActive: "4",
                            });
                          }}
                          style={
                            locationActive === "4" ? styles.box : styles.box2
                          }
                        >
                          <Text
                            style={
                              locationActive === "4"
                                ? styles.title
                                : styles.title2
                            }
                          >
                            <FormattedMessage id="sectors.configurations.list" />
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {isArchivePerson || isOwnerForRoot ? (
                        <TouchableOpacity
                          onPress={() => {
                            NavigationService.navigate("DocumentTask", {
                              locationActive: "6",
                            });
                          }}
                          style={
                            locationActive === "6" ? styles.box : styles.box2
                          }
                        >
                          <Text
                            style={
                              locationActive === "6"
                                ? styles.title
                                : styles.title2
                            }
                          >
                            <FormattedMessage id="archive.configurations.list" />
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {documentTaskIsSupervisor || isOwnerForRoot ? (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              NavigationService.navigate("DocumentTask", {
                                locationActive: "0",
                              });
                            }}
                            style={
                              locationActive === "0" ? styles.box : styles.box2
                            }
                          >
                            <Text
                              style={
                                locationActive === "0"
                                  ? styles.title
                                  : styles.title2
                              }
                            >
                              {" "}
                              <FormattedMessage id="Users.Configurations.List" />
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <Text></Text>
                      )}
                      {isArchivePerson || isOwnerForRoot ? (
                        <TouchableOpacity
                          onPress={() => {
                            NavigationService.navigate("DocumentTask", {
                              locationActive: "8",
                            });
                          }}
                          style={
                           [ flex.d_flex_center, locationActive === "8" ? styles.box : styles.box2,
                            draftsCounter > 0 &&  styles.box
                           ]
                          }
                        >
                          <Text
                            style={
                              [locationActive === "8"
                                ? styles.title
                                : styles.title2,
                                draftsCounter > 0 &&  { color:colors.warning_400}
                              ]
                                
                            }
                          >
                            <FormattedMessage id="document.task.collection.drafts.invoices.drafts" />
                          </Text>
           
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}
                  <View style={{ flex: 1 }}>
                    {requestApi ? (
                      <ActivityIndicator size="large" color="#6c757d" />
                    ) : (
                      <>
                        {(() => {
                          if (locationActive === "0") {
                            return <DocumentTaskUserConfigList />;
                          } else if (locationActive === "1") {
                            return (
                              <DocumentTaskView
                                id={id}
                                isArchivePerson={isArchivePerson}
                              />
                            );
                          } else if (locationActive === "2") {
                            // mbase mund ta perdorim me vove shon sub task
                            return <DocumentSubTaskView id={id} />;
                          } else if (locationActive === "3") {
                            return <DocumentTaskActivity id={id} type={type} />;
                          } else if (locationActive === "4") {
                            return <DocumentTaskSektorList />;
                          } else if (locationActive === "5") {
                            return <DocumentTaskCollectionList />;
                          } else if (locationActive === "6") {
                            return <ArchiveConfigurationList />;
                          } else if (locationActive === "7") {
                            return <CollectionView id={id} />;
                          } else if (locationActive === "8") {
                            return <DraftsList />;
                          }  else if (locationActive === "9") {
                            return <SingleBookListInvoices id={id}  type={type}  />;
                          } else {
                            return (
                              <DocumentTaskList
                                isArchivePerson={isArchivePerson}
                              />
                            );
                          }
                        })()}
                      </>
                    )}
                  </View>
                </View>
              );
            } else if (documentTaskEnabled === false) {
              return <View></View>;
            }
          })()}
        </>
      )}
    </AppContainerClean>
  );
};

export default DocumentTaskContainer;
