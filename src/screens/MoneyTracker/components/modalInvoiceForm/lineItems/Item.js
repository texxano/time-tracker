import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FormattedMessage } from "react-intl";
import { mx, my, p } from "../../../../../asset/style/utilities.style";
import flex from "../../../../../asset/style/flex.style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LineItemForm from "./LineItemsEditForm";
import DeleteCard from "./DeleteCard";
import colors from "../../../../../constants/Colors";
import { checkValOrReturnNum, checkValOrReturnStr } from "../../../../../utils/variousHelpers";

const Item = ({
  item,
  color,
  index,
  editSingleLineItem,
  handleDeleteProduct,
  lineItemsTaxRates,
}) => {
  const [showItemForm, setShowItemForm] = useState(false);
  const [showDeleteCard, setShowDeleteCard] = useState(false);
  const {
    productCode,
    description,
    quantity,
    unitPrice,
    currencyCode,
    totalTax,
    totalPriceInclTax,
    totalPriceExcTax,
    taxRate,
  } = item;
  return (
    <View style={[styles.container, p[2], { backgroundColor: color }]}>
      {showItemForm && (
        <LineItemForm
          editMode={true}
          index={index}
          editSingleLineItem={editSingleLineItem}
          item={item}
          setShowItemForm={setShowItemForm}
          lineItemsTaxRates={lineItemsTaxRates}
        />
      )}
      {showDeleteCard && (
        <DeleteCard
          handleDeleteProduct={handleDeleteProduct}
          index={index}
          name={description}
          color={color}
          setShowDeleteCard={setShowDeleteCard}
        />
      )}

      {!showDeleteCard && !showItemForm && (
        <>
          {productCode && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.productCode" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(productCode)}</Text>
            </View>
          )}
          {description && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="projects.form.description.placeholder" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(description)}</Text>
            </View>
          )}
          {quantity && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.quantity" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnNum(quantity).toString()}</Text>
            </View>
          )}
          {unitPrice && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.unitPrice" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(unitPrice)}</Text>
            </View>
          )}
          {currencyCode && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.currency" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(currencyCode)}</Text>
            </View>
          )}
          {totalTax && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.totalTax" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(totalTax)}</Text>
            </View>
          )}
          {totalPriceInclTax && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.totalPriceInclTax" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(totalPriceInclTax)}</Text>
            </View>
          )}
          {totalPriceExcTax && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.totalPriceExcTax" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(totalPriceExcTax)}</Text>
            </View>
          )}
          {taxRate && (
            <View style={[my[2], flex.flex_direction_row, flex.flex_between]}>
              <Text style={styles.label}>
                <FormattedMessage id="money-tracker.scan.form.lineItems.taxRate" />
              </Text>
              <Text style={styles.text}>{checkValOrReturnStr(taxRate)}</Text>
            </View>
          )}

          <View style={[flex.d_flex_center, flex.flex_end]}>
            <TouchableOpacity
              onPress={() => setShowItemForm(true)}
              style={[
                p[1],
                mx[1],
                {
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: color === colors.white ? colors.gray_70 : colors.white,
                },
              ]}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={colors.gray_400} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowDeleteCard(true);
                setShowItemForm(false);
              }}
              style={[
                p[1],
                mx[1],
                {
                  borderWidth: 1,
                  borderColor: color === colors.white ? colors.gray_70 : colors.white,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="trash-can"
                size={20}
                color={colors.gray_400}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.gray_70,
  },
  label: { fontSize: 12, fontWeight: "bold", width: "50%" },
  text: { fontSize: 12, width: "50%", marginLeft: 3 },
});

export default Item;
