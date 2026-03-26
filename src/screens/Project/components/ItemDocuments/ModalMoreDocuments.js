import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Input } from "native-base"
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";

import { updateNameDocument, deleteByIdDocument } from '../../../../redux/actions/Project/document.actions'

import ModalDelete2 from "../../../../components/Modal/ModalDelete2";

import { modalStyle } from "../../../../asset/style/components/modalStyle"

const ModalMoreDocuments = ({ id, name, onDeleteDocument }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentsState = state.documents
    const documentRequest = state.documents.documentRequest

    const [modalMore, setModalMore] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalUpdateDocument, setModalUpdateDocument] = useState(false)

    const [idDocument, setIdDocument] = useState(id)
    const [nameDocument, setNameDocument] = useState(name)

    const handleUpdateModalDocument = (id, name) => {
        setIdDocument(id)
        setNameDocument(name)
        setModalUpdateDocument(true)
    }
    const handleCloseModal = () => {
        setModalMore(false)
        setModalUpdateDocument(false)
    }

    useEffect(() => {
        if (documentRequest) {
            handleCloseModal()
        }
    }, [documentRequest]);

    const handleDeletedById = (id) => {
        dispatch(deleteByIdDocument(id));
        if (onDeleteDocument) {
            onDeleteDocument(id, name);
        }
    };

    const handleUpdateNameDocument = () => {
        const payload = {
            'id': idDocument,
            'name': nameDocument,
        };
        dispatch(updateNameDocument(payload));
    }
    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalMore} style={{ height: 500 }}>
                <ModalDelete2
                    id={id}
                    description={"documents.delete.modal.description"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                    data={name}
                />
                <Modal animationType="fade" transparent={true} visible={modalUpdateDocument} >
                    <View style={modalStyle.centeredViewSmall}>
                        <View style={modalStyle.modalView}>
                        
                            <View style={modalStyle.modalInputDelete} >
                                <FormattedMessage id="projects.form.title.placeholder">
                                    {placeholder =>
                                        <Input
                                            size={"lg"}
                                            _focus
                                            w="100%"
                                            type="text"
                                            placeholder={placeholder.toString()}
                                            value={nameDocument}
                                            onChangeText={(e) => setNameDocument(e)}
                                            my={3}
                                            style={{ height: 40, backgroundColor: "#fff" }}
                                        />
                                    }
                                </FormattedMessage>
                            </View>
                            <View style={modalStyle.ModalBottom}>
                                <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal()}>
                                    <Text style={modalStyle.textStyle}>
                                        <FormattedMessage id="common.button.close" />
                                    </Text>
                                </TouchableOpacity>
 

                            </View>
                        </View>
                    </View>
                </Modal>


                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalMore(!modalMore)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                    

                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalDelete(true)}>
                            <Text style={modalStyle.modalTitleEditDelete}><FormattedMessage id="common.button.delete" /></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={() => setModalMore(!modalMore)} style={{ height: 24 }}>
                <Text><Feather name="more-vertical" size={24} color="#6c757d" /></Text>
            </TouchableOpacity>

        </>
    )
}
export default ModalMoreDocuments
