import React, { useEffect } from "react";
import { Text, Modal, TouchableOpacity, View } from "react-native";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

import { modalStyle } from "../../asset/style/components/modalStyle";

const ModalDelete3 = ({
  id,
  description,
  deleted,
  showModal,
  closeModal,
  data,
}) => {

  return (
    <>
      <Modal animationType="slide" transparent={true} visible={showModal}>
        <View style={modalStyle.centeredViewSmall}>
          <View style={modalStyle.modalView}>
            <View style={modalStyle.modalViewTitleDelete}>
              <Text style={modalStyle.modalTitleDelete}>
                <FormattedMessage id="comments.delete.modal.title" />
              </Text>
            </View>
            <View style={modalStyle.modalInputDelete}>
              {description && (
                <Text style={modalStyle.modalInputText}>
                  <FormattedMessage id={description} />
                </Text>
              )}
              {data && <Text style={modalStyle.bold}>{data}</Text>}
            </View>
            <View style={modalStyle.ModalBottom}>
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonClose]}
                onPress={() => closeModal(false)}
              >
                <Text style={modalStyle.textStyle}>
                  <FormattedMessage id="common.button.close" />
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonDelete]}
                onPress={() => deleted(id)}
              >
                <Text style={modalStyle.textStyle}>
                  <FormattedMessage id="common.button.delete" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ModalDelete3;
