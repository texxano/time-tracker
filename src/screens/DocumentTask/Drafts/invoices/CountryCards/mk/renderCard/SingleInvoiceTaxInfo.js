import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextMain } from "../../../../../../../components/Texts";
import { mb, p } from "../../../../../../../asset/style/utilities.style";
import colors from "../../../../../../../constants/Colors";
import SingleInvoiceTaxInfoSlot from "./SingleInvoiceTaxInfoSlot";
import { parseTaxInfo } from "../../../helper";

export const SingleInvoiceTaxInfo = ({ taxInfoJson }) => {

  const [parsedTax, setParsedTax] = useState();
  useEffect(() => {
    if (taxInfoJson) {
      const parsedArr = parseTaxInfo(taxInfoJson)
      setParsedTax(parsedArr);
    }
  }, [taxInfoJson]);

  return (
    <View>
      <View style={[{ borderWidth: 1,  borderColor: colors.gray_150, }, p[1]]}>
        <TextMain
          customStyles={[
            mb[3],
            { fontSize: 18, fontWeight: "bold", alignSelf: "center" },
          ]}
          text={"document.task.collection.drafts.invoices.taxInfo"}
        />
      </View>
      <View
        style={[
          {
            borderRightWidth: 1,
            borderLeftWidth: 1,
            borderColor: colors.gray_150,
          },
        ]}
      >
        <SingleInvoiceTaxInfoSlot
          textRate=" "
          textBase="document.task.collection.drafts.invoices.base"
          textTax="document.task.collection.drafts.invoices.tax"
          ratePlainText
        />
        {parsedTax &&
          parsedTax.map((el) => (
            <SingleInvoiceTaxInfoSlot
              key={el.TaxRate}
              textRate={el.TaxRate}
              textBase={parseFloat(el.Base).toFixed(2)}
              textTax={parseFloat(el.Tax).toFixed(2)}
              isPlaintext
              ratePlainText
            />
          ))}
      </View>
    </View>
  );
};
