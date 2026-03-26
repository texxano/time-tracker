import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/Colors";
import { FormattedMessage } from "react-intl";

export const InputWrapper = ({ label, error, optional, children,customWrapperStyles }) => {

  return (
    <View style={[styles.inputWrapper,customWrapperStyles]}>
      {label ? 
          <View style={styles.label}>
          <Text>
            <FormattedMessage id={label} />
            {optional && <FormattedMessage  id={optional} />}
          </Text>
        </View>
        : null
      }
  
      {children}
      {error ? (
        <View style={styles.validationMessage}>
          <Text style={{ color: colors.error_100, fontSize: 11 }}>
            <FormattedMessage id={error} />
          </Text>
        </View>
      )
    : null
    }
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: "100%",
    height: 85,
    position: "relative",
    marginBottom: 5,
  },
  label: {
    marginLeft: 5,
  },
  validationMessage: {
    position: "absolute",
    left: 5,
    bottom: -2,
    fontSize: 13,
  },
});
