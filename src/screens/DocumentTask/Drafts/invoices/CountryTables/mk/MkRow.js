import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { generateUUID } from "../../../../../../utils/variousHelpers";
import colors from "../../../../../../constants/Colors";
import flex from "../../../../../../asset/style/flex.style";
import MkCeil from "./MkCeil";
import { dateFormat } from "../../../../../../utils/dateFormat";

const MKRow = ({ item }) => {
  const {
    taxInfoJson,
    notes,
    cannotBeDenied,
    canBeDenied,
    clientInfo,
    clientUniqueCountryNumber,
    date,
    invoiceNumber,
    totalPrice,
  } = item;
  const [parsedTax, setParsedTax] = useState();

  useEffect(() => {
    if (taxInfoJson) {
      const parsedArr = JSON.parse(taxInfoJson);
      const sortedArr = parsedArr.sort(
        (a, b) => parseFloat(b.TaxRate) - parseFloat(a.TaxRate)
      );
      setParsedTax(sortedArr);
    }
  }, [taxInfoJson]);
  return (
    <>
      {item ? (
        <View
          style={[
            flex.flex_direction_row,
            { height: 60, backgroundColor: colors.white },
          ]}
        >
          <MkCeil
            customStyle={[styles.widthCeil_1, flex.d_flex_center]}
            text={invoiceNumber}
          />
          <MkCeil
            customStyle={[styles.widthCeil_3, flex.d_flex_center]}
            text={dateFormat(date)}
          />
          <MkCeil customStyle={styles.widthCeil_3} text={clientInfo} />
          <MkCeil
            customStyle={styles.widthCeil_3}
            text={clientUniqueCountryNumber}
          />
          <MkCeil
            customStyle={[styles.widthCeil_3, flex.d_flex_center]}
            text={parseFloat(totalPrice).toFixed(2)}
          />
          {parsedTax &&
            parsedTax.map((el) => (
              <>
                <MkCeil
                  key={generateUUID(47)}
                  customStyle={[styles.widthCeil_4, flex.d_flex_center]}
                  text={parseFloat(el.Base).toFixed(2)}
                />
                <MkCeil
                  key={generateUUID(17)}
                  customStyle={[styles.widthCeil_4, flex.d_flex_center]}
                  text={parseFloat(el.Tax).toFixed(2)}
                />
              </>
            ))}

          <MkCeil
            customStyle={[styles.widthCeil_3, flex.d_flex_center]}
            text={canBeDenied.toString()}
          />
          <MkCeil
            customStyle={[styles.widthCeil_3, flex.d_flex_center]}
            text={cannotBeDenied.toString()}
          />
            <MkCeil
            customStyle={[styles.widthCeil_3, flex.d_flex_center]}
            text={notes.toString()}
          />
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: colors.gray_100,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_400,
  },
  widthCeil_1: {
    width: 180,
  },
  widthCeil_2: {
    width: 150,
  },
  widthCeil_3: {
    width: 150,
  },
  widthCeil_4: {
    width: 151.1,
  },
});

export default MKRow;
