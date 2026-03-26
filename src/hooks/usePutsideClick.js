import { useEffect } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

export function useOutsideClick(ref, onOutsideClick) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    };
    handleClickOutside()

    const dismissKeyboard = () => {
      Keyboard.dismiss();
      onOutsideClick();
    };

    const subscription = Keyboard.addListener("keyboardDidHide", dismissKeyboard);

    return () => {
      subscription.remove();
    };
  }, [ref, onOutsideClick]);
}
