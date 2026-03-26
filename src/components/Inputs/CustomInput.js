import React from "react";
import { Input } from "native-base";
import { InputWrapper } from "./InputWrapper";
import DropdownComponent from "./DropdownComponent";
import colors from "../../constants/Colors";
import { RadioComponent } from "./RadioComponent";
import { useIntl } from "react-intl";
import { CustomDateInputComponent } from "./DateInputComponent";

const CustomInput = ({
  label,
  optional,
  name,
  type,
  value,
  onChange,
  onfocus,
  onBlur,
  data,
  placeholder,
  validationMessage,
  disabled,
  defaultValue,
  textAreaProps,
  radioProps,
  dropdownProps,
  dateCustomProps,
  customWrapperStyles,
}) => {
  const intl = useIntl();

  const renderInputType = () => {
    switch (type) {
      case "text":
        return (
          <Input
            size={"lg"}
            _focus
            w="100%"
            type="text"
            placeholder={
              placeholder ? intl.formatMessage({ id: placeholder }) : ""
            }
            value={value}
            onChangeText={(e) => onChange(e, name)}
            my={1}
            style={{ height: 40, backgroundColor: colors.white, fontSize:14, zIndex:9 }}
            isDisabled={disabled}
            onFocus={onfocus}
            onBlur={onBlur}
          />
        );
        case "textarea":
          return (
            <Input
              size={"lg"}
              _focus
              w="100%"
              type="text"
              placeholder={
                placeholder ? intl.formatMessage({ id: placeholder }) : ""
              }
              value={value}
              onChangeText={(e) => onChange(e, name)}
              my={1}
              style={[{ height: 130, backgroundColor: colors.white, fontSize:14, zIndex:9 }, textAreaProps]}
              isDisabled={disabled}
              onFocus={onfocus}
              onBlur={onBlur}
            />
          );

      case "number":
        return (
          <Input
            size={"lg"}
            _focus
            w="100%"
            type="text"
            keyboardType="numeric"
            placeholder={
              placeholder ? intl.formatMessage({ id: placeholder }) : ""
            }
            value={value}
            onChangeText={(e) => onChange(e, name)}
            my={1}
            style={{ height: 40, backgroundColor: colors.white, fontSize:14, zIndex:9  }}
            isDisabled={disabled}
          />
        );

      case "dropdown":
        return (
          <DropdownComponent
            name={name}
            value={value}
            items={data}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            defaultValue={defaultValue}
            dropdownProps={dropdownProps}
          />
        );

      case "radio":
        return (
          <RadioComponent
            name={name}
            value={value}
            items={data}
            onChange={onChange}
            radioProps={radioProps}
          />
        );

      case "date":
        return (
          <CustomDateInputComponent
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            dateCustomProps={dateCustomProps}
          />
        );

      default:
        return (
          <Input
            size={"lg"}
            _focus
            w="100%"
            type="text"
            placeholder={
              placeholder ? intl.formatMessage({ id: placeholder }) : ""
            }
            
            value={value}
            onChangeText={onChange}
            my={3}
            style={{ height: 40, backgroundColor: colors.white, fontSize:14, zIndex:9  }}
            isDisabled={disabled}
          />
          
        );
    }
  };

  return (
    <InputWrapper
      customWrapperStyles={customWrapperStyles}
      label={label}
      error={validationMessage}
      optional={optional}
    >
      {renderInputType()}
    </InputWrapper>
  );
};

export default CustomInput;
