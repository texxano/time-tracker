import React from "react";
import { View } from "react-native";
import flex from "../../../../../../../asset/style/flex.style";
import { mb } from "../../../../../../../asset/style/utilities.style";
import { TextMain } from "../../../../../../../components/Texts";

const CardSlot = ({
  label,
  text,
  customStyleLabel,
  customStyleText,
  numberOfLines,
}) => {
  return (
    <View style={[flex.d_flex_center, flex.flex_between, mb[2]]}>
      <TextMain
        numberOfLines={numberOfLines}
        customStyles={[{ width: "50%", fontWeight: "bold" }, customStyleLabel]}
        text={label}
      />
      <View style={[{ width: "50%" }, flex.d_flex_center, flex.flex_end]}>
        <TextMain
          numberOfLines={numberOfLines}
          text={text}
          customStyles={customStyleText}
          isPlaintext
        />
      </View>
    </View>
  );
};

export default CardSlot;
