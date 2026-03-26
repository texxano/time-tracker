import React, { useState } from "react";
import { View } from "react-native";
import { useIntl } from "react-intl";
import { my } from "../../../../../asset/style/utilities.style";
import LineItemsCollapsible from "./LineItemsCollapsible";
import Item from "./Item";
import { generateUUID } from "../../../../../utils/variousHelpers";
import LineItemsEmptyMsg from "./LineItemsEmptyMsg";
import { LineItemAddForm } from "./LineItemAddForm";
import colors from "../../../../../constants/Colors";
import { LineItemsTotalValues } from "./LineItemsTotalValues";

const ModalInvoiceFormLineItems = ({
  lineItems,
  setLineItems,
  lineItemsTaxRates,
  setLineItemsTaxRates,
  currencyCode,
  setIsInnerScrollActive,
  totalPrices,
  setTotalPrices,
  setTaxInfo
}) => {
  const intl = useIntl();
  const [showAddForm, setShowAddForm] = useState(false);

  const addLineItem = (payload) => {
    setLineItems((prevState) => [payload, ...prevState]);
    setLineItemsTaxRates((prevState) => {
      const { taxRate } = payload;
      const newArr = prevState.includes(taxRate)
        ? prevState
        : [...prevState, taxRate];
      return newArr;
    });
  };

  const editSingleLineItem = (item, index) => {
    setLineItems((prevState) => {
      const newArr = prevState.map((el, inx) => (inx === index ? item : el));
      return newArr;
    });
  };
  const handleDeleteProduct = (inx) => {
    setLineItems((prevState) => {
      const newArr = prevState.filter((item, index) => index !== inx);
      return newArr;
    });
  };

   return (
    <View style={[{ position: "relative" }, my[3]]}>
      {showAddForm && (
        <View>
          <LineItemAddForm
            setShowItemForm={setShowAddForm}
            addLineItem={addLineItem}
            currencyCode={currencyCode}
          />
        </View>
      )}
      <LineItemsCollapsible
        title={intl.formatMessage({ id: "money-tracker.invoice.lineItems" })}
        itemsLength={lineItems.length}
        setShowAddForm={setShowAddForm}
        showAddForm={showAddForm}
      >
        {lineItems?.length > 0 &&
          lineItems.map((item, index) => {
            return (
              <Item
                key={generateUUID(index)}
                lineItemsTaxRates={lineItemsTaxRates}
                handleDeleteProduct={handleDeleteProduct}
                index={index}
                editSingleLineItem={editSingleLineItem}
                item={item}
                color={index % 2 === 1 ? colors.gray_70 : colors.white}
              />
            );
          })}
        {lineItems.length === 0 && !showAddForm && <LineItemsEmptyMsg />}
      </LineItemsCollapsible>
     
        <LineItemsTotalValues
          lineItems={lineItems}
          lineItemsTaxRates={lineItemsTaxRates}
          setIsInnerScrollActive={setIsInnerScrollActive}
          totalPrices={totalPrices}
          setTotalPrices={setTotalPrices}
          setTaxInfo={setTaxInfo}
        />
      
    </View>
  );
};

export default ModalInvoiceFormLineItems;
