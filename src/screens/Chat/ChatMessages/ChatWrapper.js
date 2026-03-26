import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IntlProvider } from "react-intl";
import { useSelector } from "react-redux";
import { languageObject } from "../../../translations";

export default function Wrapper({ children, style, ...props }) {
  const language = useSelector((state) => state.translation);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading for a brief moment to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <IntlProvider
        locale={language?.locale || "en"}
        messages={languageObject[language?.locale || "en"]}
        defaultLocale="en"
      >
        <SafeAreaView style={[styles.wrapper, styles.loadingContainer, style]} {...props} edges={['top', 'bottom']}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </SafeAreaView>
      </IntlProvider>
    );
  }

  return (
    <IntlProvider
      locale={language?.locale || "en"}
      messages={languageObject[language?.locale || "en"]}
      defaultLocale="en"
    >
      <SafeAreaView style={[styles.wrapper, style]} {...props} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </IntlProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
}); 