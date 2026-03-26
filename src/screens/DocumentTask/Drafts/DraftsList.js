import React, { useState } from "react";
import DraftsDefault from "./draftsDefault/DraftsDefault";
import DraftsInvoices from "./invoices/DraftsInvoices";


const DraftsList = () => {
  const [locationActive, setLocationActive] = useState("1");

  const renderScreens = () => {
    switch (locationActive) {
      case "0":
        return <DraftsDefault setLocationActive={setLocationActive} />;
      case "1":
        return <DraftsInvoices setLocationActive={setLocationActive} />;

      default:
        return <DraftsDefault />;
    }
  };
  return <>{renderScreens()}</>;
};

export default DraftsList;
