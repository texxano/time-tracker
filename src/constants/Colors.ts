const Colors = {
  // Base colors
  white: "#FFFFFF",
  black: "#000000",

  // Error colors
  error_100: "#dc3545",
  error_200: "#f76d81",

  // Gray colors
  gray_60: "#f4f3f4",
  gray_70: "#ebf0f3",
  gray_80: "#EFF1EE",
  gray_100: "#dee2e6",
  gray_150: "#d4d4d4",
  gray_200: "#ccc",
  gray_300: "#7d7d7d",
  gray_400: "#6c757d",
  gray_500: "#333",
  gray_600: "#7F7F7F",

  // Warning colors
  warning_90: "#FFFCA1",
  warning_100: "#ffc107",
  warning_200: "#FFD700",
  warning_300: "#FFB000",
  warning_400: "#E1AD01",

  // Success colors
  success_70: "#FCFFF6",
  success_80: "#DAE6D7",
  success_100: "#4CAF50",
  success_200: "#3bb590",

  // Blue colors
  blue_100: "#429cfc",
  blue_200: "#007bff",
  blue_300: "#2196F3",
  blue_400: "#00b0ff",

  // Switch colors
  switchTrackFalse: "#7D7D7D",
  switchTrackTrue: "#429CFC",
  switchThumbActive: "#007BFF",
  switchThumbInactive: "#F4F3F4",
} as const;

export type ColorKey = keyof typeof Colors;

export default Colors;
