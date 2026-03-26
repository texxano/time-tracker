/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { Entypo } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import {
  clearMoneyTrackerData,
  moneyTrackerCount,
  saveMainCurrency,
} from "../../redux/actions/MoneyTracker/moneyTracker.actions";
// Redux
import Pagination from "../../components/Pagination";
import ModalInvoiceCUD from "./components/ModalInvoiceCUD";
import ItemInvoice from "./components/ItemInvoice";

import { modalStyle } from "../../asset/style/components/modalStyle";
import InvoicesStatistics from "./components/InvoicesStatistics";
import { createDocumentTaskBookInvoice, resetDocumentTaskBookInvoice } from "../../redux/actions/DocumentTask/documentTask.actions";
import colors from "../../constants/Colors";
import { generateUUID } from "../../utils/variousHelpers";
import flex from "../../asset/style/flex.style";
import { mb, my, px } from "../../asset/style/utilities.style";
import ModalHandleScannerApisMsg from "./components/modalHandleScannerApis/ModalHandleScannerAPisMessages";

const InvoicesList = ({ projectId, projectViewMode, dataNavigate }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const moneyTrackerIsSupervisor =
    state.userDataModule?.moneyTrackerIsSupervisor;
  const moneyTrackerData = state.moneyTracker.data;
  const createdInvoicePayload =
    state.moneyTrackerInvoices.createdInvoicePayload;
  const moneyTrackerRequest = state.moneyTracker.moneyTrackerRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [modalCreateInvoice, setModalCreateInvoice] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const documentTasksState = state.documentTask.data;
  
  const [modalHandleAPisMsg, setModalHandleAPisMsg] = useState({
    showModal: false,
    type: "",
  });
  useEffect(() => {
    if (!moneyTrackerRequest) {
      setRequestApi(true);
      http
        .get(
          `${
            moneyTrackerIsSupervisor
              ? `/moneytracker/invoices`
              : "/moneytracker/invoices/mine"
          }?pageSize=80`
        )
        .then((data) => {
          setRequestApi(false);
          if (data.list) {
            setDataResponse(data.list);
            setPageIndex(data.pageIndex);
            setTotalPages(data.totalPages);
            setDataLength(data.list.length === 0);
            dispatch(moneyTrackerCount(data.list.length));
            // const currency = data.list[0].currencyCode;
            // console.log(currency, "currency od data fetch");
            // dispatch(saveMainCurrency(currency));
          } else {
            setDataLength(true);
            dispatch(moneyTrackerCount(0));
          }
        });
    }
  }, [moneyTrackerRequest]);

  useEffect(() => {
    if (moneyTrackerData && createdInvoicePayload) {
      const obj = {
        entryPrefix: "",
        invoiceNumber: createdInvoicePayload.title,
        archiveNumber: 0,
        invoiceType: Number(createdInvoicePayload.type),
        date: createdInvoicePayload.dueDate,
        dueDate: createdInvoicePayload.dueDate,
        entryDate: createdInvoicePayload.entryDate,
        totalPrice: createdInvoicePayload.billedAmount,
        currencyCode: createdInvoicePayload.currencyCode,
        clientUniqueCountryNumber:
          createdInvoicePayload.clientUniqueCountryNumber,
        clientInfo: createdInvoicePayload.clientInfo || "",
        taxInfo: createdInvoicePayload.taxInfo,
        invoiceFileId: createdInvoicePayload.invoiceFileId,
      };
      dispatch(createDocumentTaskBookInvoice(obj));
    }
  }, [moneyTrackerData, createdInvoicePayload]);

  // useEffect(() => {
  //   if (!mainCurrency) {
  //     setModalChooseMainCurrency(true);
  //   }
  // }, [mainCurrency]);

  useEffect(() => {
    if (documentTasksState?.id) {
      setModalHandleAPisMsg({
        showModal: true,
        type: "success",
      });
    } else if (documentTasksState?.datefailure) {
      setModalHandleAPisMsg({
        showModal: true,
        type: "error",
      });
    }
  }, [documentTasksState]);

  const handleCloseModalHandleScannerApisMsg = () => {
    dispatch(clearMoneyTrackerData());
    dispatch(resetDocumentTaskBookInvoice());
    setModalHandleAPisMsg({ showModal: false, type: "" });
  };

  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 5,
        borderRadius: 5,
        height: "auto",
      }}
    >
       <ModalHandleScannerApisMsg
        showModal={modalHandleAPisMsg.showModal}
        type={modalHandleAPisMsg.type}
        close={handleCloseModalHandleScannerApisMsg}
      />
      <ModalInvoiceCUD
        modal={modalCreateInvoice}
        setModal={setModalCreateInvoice}
        projectId={projectId}
      />
      <View
        style={[ my[3], px[1]]}
      >
        <View  style={[ mb[3], flex.flex_start]}>
        <Text style={[{ fontSize: 20, color: colors.gray_400, fontWeight: "600" }]}>
          <FormattedMessage id="money-tracker.tab.title" />
        </Text>
        </View>
       
     
         <View style={{alignSelf:"flex-end"}}>
           <TouchableOpacity
            onPress={() => setModalCreateInvoice(true)}
            style={{ flexDirection: "row", alignItems: "center", width:'40%' }}
          >
            <Text style={{}}>
              <FormattedMessage id="money-tracker.create.invoice" />{" "}
            </Text>
            <View style={modalStyle.btnCircle}>
              <Entypo name="plus" size={24} color={colors.gray_400} />
            </View>
          </TouchableOpacity>
         </View>
     
      </View>
      {projectViewMode && !dataLength && (
        <InvoicesStatistics invoiceId={dataNavigate.projectId} />
      )}
      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      <FlatList
        data={dataResponse}
        renderItem={({ item }) => {
          return (
            <View key={item.objectID}>
              <ItemInvoice
                data={item}
                projectViewMode={projectViewMode}
                dataNavigate={dataNavigate}
              />
            </View>
          );
        }}
        keyExtractor={() => generateUUID(15)}
      />
      {dataLength ? (
        <Text style={{ paddingTop: 10, color: colors.warning_200 }}>
          <FormattedMessage id="money-tracker.no.invoices" />{" "}
        </Text>
      ) : (
        <></>
      )}
      {!dataLength ? (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export default InvoicesList;
