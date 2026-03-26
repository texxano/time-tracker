/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Clipboard,
} from "react-native";
import { Button } from "native-base";
import { Input, Icon } from "native-base";

import DropDownPicker from "react-native-dropdown-picker";

import http from "../../services/http";
import { modalStyle } from "../../asset/style/components/modalStyle";

const OpenAiSearchView = () => {
  const intl = useIntl();
  const [dataContent, setDataContent] = useState({});
  const [dataImg, setDataImg] = useState({});
  const [credit, setCredit] = useState({});

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(null);
  const [searchType, setSearchType] = useState(0);
  const [requestApi, setRequestApi] = useState(false);

  const clearSearch = () => {
    setSearch("");
    setDataContent({});
    setDataImg({});
  };

  useEffect(() => {
    const getData = async () => {
      http.get(`/openai/users/me`).then((data) => {
        setCredit(data);
      });
    };
    getData();
  }, []);

  const getSearchContent = async (val) => {
    setRequestApi(true);
    const payload = { text: val };
    http
      .post(`/openai/text`, payload)
      .then((data) => {
        setDataContent(data);
        setRequestApi(false);
      })
      .catch((error) => {
        setRequestApi(false);
      });
  };

  const getSearchImg = async (val) => {
    const payload = { text: val };
    setRequestApi(true);
    http
      .post(`/openai/image`, payload)
      .then((data) => {
        setDataImg(data);
        setRequestApi(false);
      })
      .catch((error) => {
        setRequestApi(false);
      });
  };
  const onSearchChange = () => {
    if (searchType === 0 && search.length > 3) {
      getSearchContent(search);
    } else if (searchType === 1 && search.length > 3) {
      getSearchImg(search);
    }
  };
  const handleDownload = (url) => {
    // todo
  };

  const [open, setOpen] = useState(false);

  let itemsType = [
    {
      label: "Content",
      value: 0,
    },
    {
      label: "Image",
      value: 1,
    },
  ];

  return (
    <>
      <View
        style={{
          backgroundColor: "#ebf0f3",
          padding: 15,
          borderRadius: 5,
          height: "auto",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            <FormattedMessage id="openai.mudul.tilte" />
          </Text>
          <View style={{ paddingVertical: 15 }}>
            <Text style={{ fontSize: 17, color: "#6c757d", fontWeight: "600" }}>
              <FormattedMessage id="monthly.credit" />{" "}
              {credit?.monthlyCreditEur}€
            </Text>
            <Text style={{ fontSize: 17, color: "#6c757d", fontWeight: "600" }}>
              <FormattedMessage id="available.credit" />{" "}
              {credit?.availableCreditEur}€
            </Text>
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "flex-start",
            }}
          >
            <View style={{ width: "65%" }}>
              <FormattedMessage id={"search"}>
                {(placeholder) => (
                  <Input
                    size={"lg"}
                    w="100%"
                    type="text"
                    placeholder={placeholder.toString()}
                    value={search}
                    onChangeText={(e) => setSearch(e)}
                    style={{ height: 48, backgroundColor: "#fff" }}
                  />
                )}
              </FormattedMessage>
            </View>
            <DropDownPicker
              open={open}
              setOpen={setOpen}
              value={searchType}
              items={itemsType}
              setValue={setSearchType}
              zIndex={9999}
              placeholder={""}
              style={{
                borderColor: "#dee2e6",
                borderRadius: 5,
                height: 40,
                width: "35%",
                backgroundColor: "#fff",
                padding: 5,
              }}
              dropDownContainerStyle={{
                borderColor: "#dee2e6",
                width: "35%",
              }}
              listItemLabelStyle={{
                fontWeight: "500",
                fontSize: 15,
              }}
              textStyle={{
                fontWeight: "500",
                fontSize: 15,
              }}
              dropDownDirection="TOP"
            />
          </View>
          <TouchableOpacity
            onPress={onSearchChange}
            style={[
              modalStyle.button,
              modalStyle.buttonAdd,
              { marginTop: 10, height: 40 },
            ]}
          >
            <Text style={[modalStyle.textbuttonAdd, { paddingTop: 5 }]}>
              <FormattedMessage id="search" />
            </Text>
          </TouchableOpacity>
          {requestApi ? (
            <ActivityIndicator size="large" color="#6c757d" />
          ) : (
            <></>
          )}
          <View>
            {(() => {
              if (searchType === 0) {
                return (
                  <View>
                    {dataContent?.textResponse ? (
                      <>
                        <TouchableOpacity
                          onPress={() => copyComment(data.response)}
                          style={{ paddingVertical: 5, flexDirection: "row" }}
                        >
                          <Ionicons
                            name="copy-outline"
                            size={20}
                            color="#6c757d"
                          />
                          <Text>Copy</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 17 }}>{data.response}</Text>
                      </>
                    ) : null}
                  </View>
                );
              } else if (searchType === 1) {
                return (
                  <>
                    {dataImg?.imageUrl ? (
                      <View>
                        {/* <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(dataImg?.imageUrl, "img")}>Dowload</button>
                                                    <br /> */}
                        <Image
                          style={{ width: 300, height: 300, borderRadius: 8 }}
                          source={{ uri: data.imageUrl }}
                        />
                      </View>
                    ) : (
                      <></>
                    )}
                  </>
                );
              }
            })()}
          </View>
        </View>
      </View>

      {/* <div className="container-fluid pt-2 pb-4">

            {credit?.availableCreditEur === 0 ? (<b><FormattedMessage id="dont.have.budget" /></b>) : ''}
            <div className={credit?.availableCreditEur === 0 ? "disable-search d-md-flex align-items-center mb-4" : "d-md-flex align-items-center mb-4"}>
                <div className="d-flex w-100">
                    <FormControl variant="outlined">
                        <Select
                            labelId="demo-simple-select-autowidth-label"
                            id="demo-simple-select-autowidth"
                            input={<BootstrapInput />}
                            value={searchType}
                            onChange={handleSearchType}
                        >
                            <MenuItem value={0}> {intl.formatMessage({ id: 'Content' })}</MenuItem >
                            <MenuItem value={1}> {intl.formatMessage({ id: 'Image' })}</MenuItem >
                        </Select>
                    </FormControl>
                    <div className='search-open-ai w-100'>
                        <FormattedMessage id={"search"}>
                            {placeholder =>
                                <InputGroup>
                                    <Input type={search?.length > 64 ? "textarea" : "text"} value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder} />
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText className="left">
                                            {search.length !== 0 ? (<i onClick={clearSearch} className="fa-regular fa-rectangle-xmark cursor"></i>) : (<i className="fa-regular fa-rectangle-xmark text-transparent"></i>)}
                                        </InputGroupText>
                                    </InputGroupAddon>

                                </InputGroup>
                            }
                        </FormattedMessage>
                    </div>
                </div>
                <div className={`d-flex justify-content-end ${window.innerWidth < 765 ? "mt-2" : ""}`}>
                <button type="button" className="btn btn-outline-success ml-md-5" onClick={onSearchChange} disabled={requestApi}>
                    <FormattedMessage id="search" />
                </button>
                </div>
            </div>
            {requestApi ? (<div className="loader-line"></div>) : (<></>)}
            <div>
                <div>

                    {(() => {
                        if (searchType === 0) {
                            return (
                                <div>
                                    {dataContent?.textResponse ?
                                        <>
                                            <button type="button" className="btn btn-sm btn-outline-primary"
                                                onClick={() => navigator.clipboard.writeText(`${dataContent?.textResponse}`)}
                                            >
                                                <i className="fa-solid fa-copy"></i>  Copy
                                            </button>
                                            <br />
                                            {dataContent?.textResponse}
                                        </>
                                        : ""}
                                </div>
                            )
                        } else if (searchType === 1) {
                            return (
                                <>
                                    {dataImg?.imageUrl ?
                                        (
                                            <div className="">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(dataImg?.imageUrl, "img")}>Dowload</button>
                                                <br />
                                                <img src={dataImg?.imageUrl} alt="" className="w-100" />
                                            </div>
                                        ) : (<></>)
                                    }
                                </>
                            )
                        }
                    })()}
                </div>

            </div>

        </div> */}
    </>
  );
};

export default OpenAiSearchView;
