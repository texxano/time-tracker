import React from "react";
import { generateUUID } from "../../../../../../utils/variousHelpers";
import MKRow from "./MkRow";
import { ScrollView, View } from "react-native";
import MkHeaders from "./headers/MkHeaders";
import colors from "../../../../../../constants/Colors";

const MKTable = ({ data }) => {
  return (
    <>
      {data &&
        data.length > 0 &&
        data.map((item) => (
          <View key={generateUUID(87)}>
            <ScrollView horizontal>
              <View style={[{ borderWidth: 1, borderColor: colors.gray_600 }]}>
                <MkHeaders />
                <MKRow item={item} />
              </View>
            </ScrollView>
          </View>
        ))}
    </>
  );
};

export default MKTable;
