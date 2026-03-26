import React from "react";
import { View, Text } from "react-native";
import { Radio } from "native-base";
import { FormattedMessage } from "react-intl";
import { globalStyles } from "../../asset/style/globalStyles";

export const RadioComponent = ({
  name,
  value,
  items,
  onChange,
  radioProps
}) => {
  return (
    <View>
      <Radio.Group
        name={name}
        value={value}
        onChange={(val) => onChange(val, name)}
      >
        <View style={globalStyles.bottomProjectReport}>
          {items.map((el) => (
            <View
              key={el.value}
              style={{ flexDirection: radioProps?.direction || "row", paddingRight: 10 }}
            >
              <Radio
                value={el.value}
                colorScheme={radioProps?.colorScheme || "coolGray"}
                my={1}
              >
                <Text>
                  <FormattedMessage id={el.msg} />
                </Text>
              </Radio>
            </View>
          ))}
        </View>
      </Radio.Group>
    </View>
  );
};
