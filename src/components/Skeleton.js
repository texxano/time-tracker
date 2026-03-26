import React from "react";
import { View } from "react-native";
// import SkeletonLoading from 'expo-skeleton-loading'
import PropTypes from "prop-types"


const SkeletonFeed = ({ length, height }) => {
  return (
    <>
      {/* {Array(length)
        .fill(1)
        .map((_, i) => (
          <SkeletonLoading background={"#adadad"} highlight={"#ffffff"}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 100, height: 100, backgroundColor: "#adadad", borderRadius: 10 }} />
  
            <View style={{ flex:1, marginLeft: 10 }}>
                <View style={{ backgroundColor: "#adadad", width: "50%", height: 10, marginBottom: 3, borderRadius: 5 }} />
                <View style={{ backgroundColor: "#adadad", width: '20%', height: 8, borderRadius: 5 }} />
                <View style={{ backgroundColor: "#adadad", width: '15%', height: 8, borderRadius: 5, marginTop: 3 }} />
            </View>
          </View>
      </SkeletonLoading>
        ))} */}
    </>
  );
};
SkeletonFeed.propTypes = {
  length: PropTypes.number
}
export default SkeletonFeed;
