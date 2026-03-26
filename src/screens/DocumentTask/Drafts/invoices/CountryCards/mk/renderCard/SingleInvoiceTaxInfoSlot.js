import React from 'react'
import flex from '../../../../../../../asset/style/flex.style'
import { View } from 'react-native'
import colors from '../../../../../../../constants/Colors'
import { p, px } from '../../../../../../../asset/style/utilities.style'
import { TextMain } from '../../../../../../../components/Texts'

const SingleInvoiceTaxInfoSlot = ({textRate, textBase, textTax, isPlaintext, ratePlainText}) => {
  return (
    <View
    style={[
      flex.d_flex_center,

      {
        borderBottomWidth: 1,
        borderColor: colors.gray_150,
      },
    ]}
  >
    <View
      style={[
        {
          width: "25%",
          borderRightWidth: 1,
          borderColor: colors.gray_150,
        },
        p[2],
      ]}
    >
      <TextMain
        customStyles={[{ fontSize: 18, fontWeight: "bold" }, ,]}
        text={textRate}
        isPlaintext={ratePlainText}
      />
    </View>
    <View style={[{ width: "75%" }, flex.d_flex_center]}>
      <View
        style={[
          {
            width: "50%",
            borderRightWidth: 1,
            borderColor: colors.gray_150,
          },
          p[2],
          px[3],
          flex.d_flex_center
        ]}
      >
        <TextMain
          customStyles={[
            {
              fontSize: 18,
              fontWeight: "bold",
            },
          ]}
          text={textBase}
          isPlaintext={isPlaintext}
        />
      </View>
      <View style={[{ width: "50%" }, p[2], px[3],flex.d_flex_center]}>
        <TextMain
          customStyles={[{ fontSize: 18, fontWeight: "bold" }]}
          text={textTax}
          isPlaintext={isPlaintext}
        />
      </View>
    </View>
  </View>
  )
}

export default SingleInvoiceTaxInfoSlot