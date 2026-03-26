import React from "react";
import { Text } from "react-native";
import styles from "./text-h1-bold.style";

export const TextH1Bold = ({ text, customStyles }) => (
  <Text style={[styles.text, customStyles]}>{text}</Text>
);
