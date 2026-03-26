import React from "react";
import { View } from "react-native";
import CardSlot from "./CardSlot";
import { mb, mt, my } from "../../../../../../../asset/style/utilities.style";
import { TextH2 } from "../../../../../../../components/Texts";
import { dateFormat } from "../../../../../../../utils/dateFormat";
import flex from "../../../../../../../asset/style/flex.style";
import { ButtonCloseCircle } from "../../../../../../../components/buttons/ButtonCloseCirlcle";
import { SingleInvoiceTaxInfo } from "./SingleInvoiceTaxInfo";
import { useDispatch } from "react-redux";
import { deleteDocumentTaskBookInvoice } from "../../../../../../../redux/actions/DocumentTask/documentTask.actions";
import { checkValOrReturnNum, checkValOrReturnStr } from "../../../../../../../utils/variousHelpers";
export const SingleInvoice = ({ item, close }) => {
  const dispatch = useDispatch();

  const {
    canBeDenied,
    cannotBeDenied,
    clientInfo,
    clientUniqueCountryNumber,
    date,
    invoiceNumber,
    totalPrice,
    taxInfoJson,
    notes,
    id,
  } = item;

  const handleDeletedById = () => {
    dispatch(deleteDocumentTaskBookInvoice(id));
    setShowDeleteModal(false);
    close();
  };
  return (
    <View style={[{ position: "relative" }]}>
      <ButtonCloseCircle
        customStyles={{ alignSelf: "flex-end" }}
        handleClick={close}
      />
      <View style={[my[10], flex.d_flex_center, flex.flex_between]}>
        <TextH2 text={"invoice.tab.title"} />
      </View>

      {/* <ModalDelete2
        id={item.id}
        description={"money-tracker.delete.invoice.description.this"}
        deleted={handleDeletedById}
        modalDelete={showDeleteModal}
        setModalDelete={() => setShowDeleteModal(false)}
      /> */}

      <View style={[flex.d_flex_center, flex.flex_between, mb[2]]}></View>
      {item ? (
        <View>
          <CardSlot
            label={"document.task.collection.drafts.invoices.invoiceNumber"}
            text={checkValOrReturnStr(invoiceNumber) || "/"}
            customStyleLabel={{ fontSize: 18 }}
            customStyleText={[{ fontSize: 18 }, mb[3]]}
            numberOfLines={2}
          />
          <CardSlot
            label={"Date"}
            text={
              checkValOrReturnStr(invoiceNumber) !== "" ? dateFormat(date) : "/"
            }
            customStyleLabel={{ fontSize: 18 }}
            customStyleText={[{ fontSize: 18 }, mb[3]]}
            numberOfLines={2}
          />
          <CardSlot
            label={"document.task.collection.drafts.invoices.contact"}
            text={clientInfo ? clientInfo : "/"}
            customStyleLabel={{ fontSize: 18 }}
            customStyleText={[{ fontSize: 18 }, mb[3]]}
            numberOfLines={2}
          />
          <CardSlot
            label={
              "document.task.collection.drafts.invoices.uniqueCountryNumber"
            }
            text={clientUniqueCountryNumber || "/"}
            customStyleLabel={{ fontSize: 16 }}
            customStyleText={[{ fontSize: 16 }, mb[3]]}
            numberOfLines={2}
          />
          <CardSlot
            label={"document.task.collection.drafts.invoices.canBeDenied"}
            text={checkValOrReturnNum(canBeDenied) !== 0 ? canBeDenied.toString() : "/"}
            customStyleLabel={{ fontSize: 18 }}
            customStyleText={[{ fontSize: 18 }, mb[3]]}
            numberOfLines={2}
          />
          <CardSlot
            label={"document.task.collection.drafts.invoices.cannotBeDenied"}
            text={checkValOrReturnNum(cannotBeDenied) !== 0 ? canBeDenied.toString() : "/"}
            customStyleLabel={{ fontSize: 18 }}
            customStyleText={[{ fontSize: 18 }, mb[3]]}
            numberOfLines={2}
          />
          <CardSlot
            label={"document.task.collection.drafts.invoices.notes"}
            text={checkValOrReturnStr(notes) || "/"}
            customStyleLabel={{ fontSize: 18 }}
            customStyleText={[{ fontSize: 18 }, mb[3]]}
            numberOfLines={2}
          />
          {taxInfoJson && taxInfoJson !== "null" && (
            <SingleInvoiceTaxInfo taxInfoJson={taxInfoJson} />
          )}

          <View style={[mt[3]]}>
            <CardSlot
              label={"document.task.collection.drafts.invoices.totalPrice"}
              text={parseFloat(totalPrice).toFixed(2) || "/"}
              customStyleLabel={{ fontSize: 18 }}
              customStyleText={[{ fontSize: 18, fontWeight: "bold" }, mb[3]]}
              numberOfLines={2}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};
