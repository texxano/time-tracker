import React, { useState, useEffect } from "react";
import { useIntl, injectIntl } from "react-intl";
import DropDownPicker from "react-native-dropdown-picker";

import http from "../services/http";

const SelectDropDown = ({ onSelected, selected, type, zIndex, disable }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = () => {
      if (type === 1) {
        http.get(`/countries/timezones`).then((data) => {
          setData(
            data?.map((value) => ({
              label: value.displayName,
              value: value.id,
            }))
          );
        });
      } else if (type === 2) {
        http.get(`/countries`).then((data) => {
          setData(
            data?.map((value) => ({
              label: value.name,
              value: value.id,
            }))
          );
        });
      } else if (type === 3) {
        console.log('🔄 Loading teams data...');
        http.get(`/teams?pageSize=50`).then((data) => {
          console.log('📊 Teams API response:', data);
          if (data?.list && Array.isArray(data.list)) {
            const teamsData = data.list.map((value) => ({
              label: value.name,
              value: value.id,
            }));
            console.log('✅ Teams data processed:', teamsData);
            setData(teamsData);
          } else {
            console.log('⚠️ No teams data found in response');
            setData([]);
          }
        }).catch(error => {
          console.error('❌ Error loading teams:', error);
          setData([]);
        });
      }
    };

    getData();
  }, []);

  return (
    <>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={selected}
        items={data}
        setValue={onSelected}
        zIndex={zIndex}
        placeholder={type === 3 ? "Select Team" : ""}
        listMode="MODAL"
        modalProps={{
          animationType: "fade",
        }}
        modalContentContainerStyle={{
          backgroundColor: "#fff",
        }}
        style={{
          fontSize: 13,
          borderColor: "#dee2e6",
          borderRadius: 5,
          width: "100%",
          backgroundColor: "#fff",
          marginBottom: 15,
        }}
        dropDownContainerStyle={{
          borderColor: "#dee2e6",
          width: "100%",
          maxHeight: 200,
        }}
        listItemLabelStyle={{
          fontWeight: "500",
          fontSize: 15,
        }}
        textStyle={{
          fontWeight: "500",
          fontSize: 15,
        }}
        dropDownDirection="AUTO"
        disabled={disable}
      />
    </>
  );
};

export default injectIntl(SelectDropDown);
