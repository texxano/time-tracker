import React from "react";
import { View } from "react-native";
import MKTable from "./mk/MKTable";

export const RenderTables = ({ mainCurrency, data }) => {
  const renderData = () => {
    switch (mainCurrency) {
      case "MKD":
        return <MKTable data={data} />;

      default:
        return <MKTable data={data} />;
    }
  };
  return <View>{renderData()}</View>;
};
