import React from "react";
import { FormattedMessage } from 'react-intl';
import { Text, View, ActivityIndicator } from 'react-native';

// Components
import FormatDateTime from "../../../components/FormatDateTime";
import TotalWorkTimeTrack from "./TotalWorkTimeTrack";
import ModalMoreTimeTracks from "./ModalMoreTimeTracks";
// Components

import { styles } from "../TimeTracks.Styles"

const ItemTimeTracks = ({ data, userId }) => {

  return (
    <View style={data?.isTracking ? styles.box : styles.boxTrack}>
      <View>
        <View style={styles.boxtitle}>
          <View style={styles.boxtitle}>
            <Text style={{ fontSize: 16, paddingBottom: 5 }}>
              <FormatDateTime datevalue={data?.start} type={0} />
            </Text>
          </View>
          {data?.isTracking ? (
            <View>
              <View style={styles.boxtitle}>
                <ActivityIndicator size="small" color="#28a745" />
                <Text style={{ fontSize: 16, color: "#28a745", paddingRight: 10, paddingLeft: 5 }}>
                  <FormattedMessage id="projects.form.status.progress" />
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ fontSize: 16 }}>- <FormatDateTime datevalue={data?.stop} type={2} /></Text>
          )}
        </View>
        {data?.description && <View style={{}}>
          <Text style={{ fontSize: 16, }}>{data?.description}</Text>
        </View>}

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10 }}>
          <View style={styles.boxtitle}>
            <Text style={{ fontSize: 16, }}><FormattedMessage id="Total" />:</Text>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              <TotalWorkTimeTrack startDate={data?.start} stopDate={data?.stop || new Date()} />
            </Text>
          </View>
          {!userId ? (
            <>
              {data?.isTracking ? (<></>) : (
                <View>
                  <ModalMoreTimeTracks data={data} />
                </View>
              )
              }
            </>
          ) : <></>}
        </View>
      </View>
    </View>
  )
}

export default ItemTimeTracks
