/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextArea } from "native-base";
import { useSelector, useDispatch } from "react-redux";
import {
  stepCompleteTask,
  stepRollbackTask,
} from "../../../redux/actions/Task/stepTask.actions";
import { completeAllTasks } from "../../../redux/actions/Task/task.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { my } from "../../../asset/style/utilities.style";
import FileOrPicUpload from "../../../components/FileOrPicUpload/FileOrPicUpload";

const ModalStepTask = ({ id, type, modal, setModal }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const tasksState = state.tasks;
  const { iosCameraStart } = state.documentTask;
  const [comment, setComment] = useState("");
  const [document, setDocument] = useState(null);

  useEffect(() => {
    if (tasksState) {
      setModal(false);
    }
  }, [tasksState]);

  const handleStep = () => {
    const payload = { id, comment };
    if (type === 0) {
      dispatch(stepCompleteTask({ ...payload, document }));
      setComment("");
      setDocument(null);
    } else if (type === 1) {
      dispatch(stepRollbackTask(payload));
      setComment("");
      setDocument(null);
    } else if (type === 2 || type === 3) {
      dispatch(completeAllTasks(id));
      setComment("");
      setDocument(null);
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        style={{ height: 500 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={modalStyle.centeredView}>
              <View style={modalStyle.modalView}>
                <View style={modalStyle.modalViewTitle}>
                  <Text style={modalStyle.modalTitle}>
                    <FormattedMessage id="comments.delete.modal.title" />
                  </Text>
                </View>

                <View
                  style={[modalStyle.modalInput, { paddingHorizontal: 17 }]}
                >
                  {(() => {
                    if (type === 0) {
                      return (
                        <Text>
                          <FormattedMessage id="complete.step.task" />
                        </Text>
                      );
                    } else if (type === 1) {
                      return (
                        <Text>
                          <FormattedMessage id="rollback.all.step.task" />
                        </Text>
                      );
                    }
                  })()}

                  <View style={[my[4]]}>
                    <FileOrPicUpload
                      document={document}
                      setDocument={setDocument}
                      //manually styling ios camera buttons
                      buttonsStyles={
                        {
                          closeBtn: {
                            top: 30,
                          },
                          captureButton: {
                            marginTop: -60,
                          },
                          flipCamera: {
                            top: -30,
                          },
                        }
                      }
                    />
                  </View>
                       {/* solving ioscamera UI issues */}
                  {!iosCameraStart && (
                    <>
                      {type < 2 ? (
                        <FormattedMessage id="Comment.vacation.optional">
                          {(placeholder) => (
                            <TextArea
                              size={"lg"}
                              _focus
                              w="100%"
                              type="text"
                              placeholder={placeholder.toString()}
                              value={comment}
                              onChangeText={(e) => setComment(e)}
                              my={3}
                              style={{ backgroundColor: "#fff", zIndex: 1 }}
                            />
                          )}
                        </FormattedMessage>
                      ) : (
                        <Text style={{ fontSize: 16, paddingBottom: 10 }}>
                          <FormattedMessage id="complete.all.step.task" />
                        </Text>
                      )}
                    </>
                  )}
                </View>
                {/* solving ioscamera UI issues */}
                {!iosCameraStart && (
                  <View style={[modalStyle.ModalBottom, { zIndex: 1 }]}>
                    <TouchableOpacity
                      style={[modalStyle.button, modalStyle.buttonClose]}
                      onPress={() => setModal(false)}
                    >
                      <Text style={modalStyle.textStyle}>
                        <FormattedMessage id="common.button.close" />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyle.button, modalStyle.buttonAdd]}
                      onPress={handleStep}
                    >
                      <Text style={modalStyle.textStyle}>
                        <FormattedMessage id="common.button.confirm" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default ModalStepTask;
