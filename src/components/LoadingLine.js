import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSelector } from "react-redux";

const windowWidth = Dimensions.get("window").width;

const LoaderLine = () => {
  const state = useSelector((state) => state);
  const requestRefreshToken = state.requestToken.requestRefreshToken;
  const animValue = new Animated.Value(0);
  useEffect(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => animValue.setValue(0));
  }, [ requestRefreshToken]);
  

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.line,
          {
            transform: [
              {
                translateX: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, windowWidth],
                }),
              },
              {
                scaleX: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 9,
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    top: 0,
    height: 5,
    width: '30%',
    backgroundColor: '#111',
    borderRadius: 9,
  },
});

export default LoaderLine;
