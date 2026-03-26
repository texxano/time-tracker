import React from "react";
import { FormattedMessage } from "react-intl";
import { Text, TouchableOpacity, View } from "react-native";

import { NavigationService } from "../../../navigator";

// Components
import { userConfigStyles } from "../../../asset/style/userConfigStyles";
import ModalMoreProjectCharge from "./ModalMoreProjectCharge";

const ItemTimeUserProjectCharget = ({ data }) => {
  return (
    <>
      <View
        style={[userConfigStyles.itemContainer, userConfigStyles.userDetails]}
      >
        <View>
          <View>
            {data?.projectId ? (
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate("Project", {
                    projectId: data.projectId,
                  });
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {data.projectTitle}
                </Text>
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
          <View style={{ paddingTop: 10 }}>
            <Text style={{ fontSize: 16 }}>
              <FormattedMessage id="price.per.hour" />:{" "}
              <Text style={{ fontWeight: "600" }}>
                {data.pricePerHour} {data.currencyCode}
              </Text>
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 5 }}>
          <ModalMoreProjectCharge data={data} />
        </View>
      </View>
    </>
  );
};

export default ItemTimeUserProjectCharget;
