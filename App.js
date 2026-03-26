import React, { useEffect } from 'react';
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './src/redux/store/store'
import Index from './src/index';
import { initializeAppStateHandler } from './src/utils/appStateHandler';


export default function App() {
  useEffect(() => {
    // Initialize app state handler when app starts
    const cleanup = initializeAppStateHandler();
    
    return () => {
      cleanup();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="default" />
        <Index />
      </PersistGate>
    </Provider>
  )
}
