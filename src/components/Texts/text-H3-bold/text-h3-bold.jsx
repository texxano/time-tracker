import React from "react";
import { Text } from "react-native";
import styles from "./text-h3-bold.style";

export const TextH3Bold = ({ text, customStyles }) => (
  <Text style={[styles.text, customStyles]}>{text}</Text>
);
