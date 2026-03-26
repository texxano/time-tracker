import React, { useEffect, useState, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Keyboard,
  Clipboard,
  TextInput,
  ScrollView,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
// Redux
import { useDispatch, useSelector } from "react-redux";
import http from "../../services/http";
import {
  postComment,
  commentCount,
  deleteByIdComment,
  deleteAllComment,
} from "../../redux/actions/Project/comment.actions";
import { getProject } from "../../redux/actions/Project/project.actions";
import { KeyboardAvoidingView, Platform } from "react-native";
import { stripHtml } from "../../utils/variousHelpers";
// Redux

// Components
import HeaderProject from "./components/HeaderProject";
import InitialUser from "../../components/InitialUser";
import { pickColor } from "../../components/InitialUser";
import FormatDateTime from "../../components/FormatDateTime";
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import ModalDelete from "../../components/Modal/ModalDelete";
// Components
import { styles } from "../../asset/style/Project/comments";
import AppContainerClean from "../../components/AppContainerClean";

const Comments = (route) => {
  const { projectId, parentId, permissionCode, fromNotifications } =
    route.navigation.state.params;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const userId = state.userDataRole.userId;

  const isAdministrator = state.userDataRole?.isAdministrator;
  const commentState = state.comment;
  const commentPostRequest = state.comment.commentPostRequest;
  const commentDeleteRequest = state.comment.commentDeleteRequest;
  const commentCountState = state.commentCount.count;
  const getProjectDataState = state.getProjectData;
  const refreshScreen = state.refreshScreen.refresh;
  const [parentIdRoute, setParentIdRoute] = useState(parentId);
  const [userPermissionCode, setUserPermissionCode] = useState(
    permissionCode || getProjectDataState.loggedUserPermissionCode
  );
  const [content, setContent] = useState("");
  const [dataResponse, setDataResponse] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState("");
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(!isAdministrator);
  const [pagination, setpagination] = useState(0);
  const [notAuthorized, setNotAuthorized] = useState(false);
  useEffect(() => {
    if (!isAdministrator) {
      if (commentState || refreshScreen) {
        http
          .get(
            `/comments?projectId=${projectId}${
              currentPage ? `&page=${currentPage}` : ""
            }${search ? `&search=${search}` : ""}`
          )
          .then((data) => {
            setRequestApi(false);
            if (search.length === 0) {
              dispatch(commentCount(data.totalItems));
            }
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            setDataResponse(data.list);
            setDataLength(data.list.length === 0);
            setNotAuthorized(false);
          })
          .catch(() => {
            setRequestApi(false);
            setNotAuthorized(true);
          });
      }
      if (fromNotifications) {
        const refreshNr = getProjectDataState.id === projectId;
        dispatch(getProject(projectId, fromNotifications, refreshNr));
      }
    }
  }, [commentState, projectId, currentPage, search]);
  useEffect(() => {
    if (fromNotifications) {
      setParentIdRoute(getProjectDataState.parentId);
      setUserPermissionCode(getProjectDataState.loggedUserPermissionCode);
    }
  }, [getProjectDataState.title]);

  function handleComment() {
    if (!content) {
    } else {
      const payload = { content, projectId };
      dispatch(postComment(payload));
      setContent("");
      setCurrentPage("");
      Keyboard.dismiss();
    }
  }
  const handleDeletedById = (id) => {
    dispatch(deleteByIdComment(id));
  };
  const handleDeletedAll = (projectId) => {
    dispatch(deleteAllComment(projectId));
  };
  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(null);
    }
  }, [dataLength, currentPage]);

  const copyComment = (val) => {
    Clipboard.setString(val.replace(/<[^>]+>/g, ""));
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : insets.bottom}
    >
      <AppContainerClean
        location={"Comments"}
        pagination={pagination}
        notAuthorized={notAuthorized}
      >
        <View style={{ height: "auto", minHeight: 36 }}> 
        <HeaderProject
          location={"Comments"}
          projectId={projectId}
          parentId={parentIdRoute}
          permissionCode={userPermissionCode}
        />
    </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: 37,
          }}
        >
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            <FormattedMessage id="projects.tabs.comments.title" />{" "}
          </Text>
          {userPermissionCode === 3 &&
          !isAdministrator &&
          commentCountState ? (
            <ModalDelete
              id={projectId}
              description={"comments.delete.modal.description.all"}
              deleted={handleDeletedAll}
              type={0}
            />
          ) : (
            <></>
          )}
        </View>

        <Search
          onSearch={(value) => {
            setSearch(value);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          placeholder={"comments.filter.title"}
        />

        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View style={dataResponse.length > 0 ? styles.minHeightView : ""}>
            {dataResponse.map((data, index) => (
              <View
                key={index}
                style={[
                  styles.itemComment,
                  {
                    backgroundColor:
                      pickColor(data.userFirstName, data.userEmail) + "0D",
                    borderColor: pickColor(data.userFirstName, data.userEmail),
                  },
                ]}
              >
                <InitialUser
                  FirstName={data.userFirstName}
                  LastName={data.userLastName}
                  email={data.userEmail}
                  color={data.userColor}
                />
                <View style={styles.boxComment}>
                  <View style={styles.boxText}>
                    <Text style={{ fontWeight: "500" }}>
                      {data.userFirstName} {data.userLastName}
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.textGray}>
                        <FormatDateTime datevalue={data.date} type={2} />
                      </Text>
                      {userId === data.userId &&
                      index === dataResponse.length - 1 &&
                      pageIndex === totalPages ? (
                        <>
                          {commentDeleteRequest ? (
                            <TouchableOpacity
                              style={{
                                borderRadius: 8,
                                padding: 5,
                                alignItems: "center",
                                marginLeft: 5,
                              }}
                            >
                              <ActivityIndicator size="small" color="#fff" />
                            </TouchableOpacity>
                          ) : (
                            <ModalDelete
                              id={data.id}
                              description={
                                "comments.delete.modal.description.this"
                              }
               
                              deleted={handleDeletedById}
                              type={0}
                            />
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </View>
                  </View>
             
                
                  <View style={styles.boxText}>
                    <Text style={{ fontSize: 14, lineHeight: 20 }}>
                      {stripHtml(data.content)}
                    </Text>

                    <TouchableOpacity
                      onPress={() => copyComment(data.content)}
                      style={{ paddingVertical: 5 }}
                    >
                      <Ionicons name="copy-outline" size={20} color="#6c757d" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
          {requestApi ? (
            <ActivityIndicator size="large" color="#6c757d" />
          ) : (
            <></>
          )}

          {commentCountState === 0 || dataLength ? (
            <Text style={styles.dataLength}>
              <FormattedMessage id="comments.list.noItems" />
            </Text>
          ) : (
            <></>
          )}
          
          <Pagination
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={pageIndex}
            total={totalPages}
            checkTokenExpPagination={(e) => setpagination(e)}
          />
        </ScrollView>

        {userPermissionCode >= 1 && !isAdministrator ? (
          <>
            <View style={[styles.boxSubmitComment]}>
              <View
                style={{ backgroundColor: "#fff", padding: 0, width: "80%" }}
              >
                <FormattedMessage id="comments.form.content.placeholder">
                  {(placeholder) => (
                    <TextInput
                      multiline={true}
                      style={[styles.inputCommet, { 
                        color: "#000",
                        fontSize: 16,
                        minHeight: 40,
                        maxHeight: 100
                      }]}
                      placeholder={placeholder.toString()}
                      value={content}
                      placeholderTextColor={"#999"}
                      onChangeText={(e) => setContent(e)}
                      textAlignVertical="top"
                    />
                  )}
                </FormattedMessage>
              </View>

              <TouchableOpacity
                w="15%"
                style={[styles.button, styles.buttonAdd]}
                onPress={handleComment}
              >
                {!commentPostRequest ? (
                  <FontAwesome name="send" size={19} color="#fff" />
                ) : (
                  <ActivityIndicator size="small" color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <></>
        )}
      </AppContainerClean>
    </KeyboardAvoidingView>
  );
};

export default Comments;
