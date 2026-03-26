import React from 'react'
import { View, useWindowDimensions, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import HeaderInfo from './components/HeaderInfo';
import AppContainerClean from '../../components/AppContainerClean';

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const Presentation = (route) => {
  const location = route.navigation.state.params.location;
  return (
    <AppContainerClean location={location} >
      <HeaderInfo location={location} locationActive={"Presentation"} />
      <WebView source={{ uri: 'https://texxano-tst.azurewebsites.net/landing-page' }}
        style={styles.container}
      />

    </AppContainerClean>
  )
}
const { width } = useWindowDimensions

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: windowHeight / 1.7,
    zIndex: 999
  },
});
export default Presentation
