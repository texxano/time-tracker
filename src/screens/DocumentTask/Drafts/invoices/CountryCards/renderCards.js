import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { MkCard } from "./mk/renderCard/MKCard";

export const RenderCards= ({ item, handlePress, viewMode }) => {
    const {mainCurrency} = useSelector(state => state.currencies)
  const renderData = () => {
    switch (mainCurrency) {
      case "MKD":
        return <MkCard item={item} handlePress={handlePress} viewMode={viewMode} />;

      default:
        return <MkCard item={item} handlePress={handlePress} viewMode={viewMode} />;
    }
  };
  return <View>{item && renderData()}</View>;
};
