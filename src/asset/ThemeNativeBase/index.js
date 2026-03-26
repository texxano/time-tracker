import { InputRightAddon, extendTheme } from "native-base";

const theme = extendTheme({
  components: {
    Input: {
      baseStyle: {
        borderColor: "#d6d6d6",
        focusOutlineColor: "#bebebe",
        backgroundColor: "#eeeeee",
        _focus: {
          borderColor: "#ababab",
          //   backgroundColor: "#fff"
          _android: {
            selectionColor: 'unset',
          },
        },
        _hover: {
          borderColor: "#ababab",
          //   backgroundColor: "#fff"
        }
      }
    }
  }
});

export default theme;
