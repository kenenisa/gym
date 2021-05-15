import React, { useRef, useState } from "react";
import { View, TextInput } from "react-native";
import useColorScheme from '../hooks/useColorScheme';
import Colors from "../constants/Colors";


// interface InputProps {
//     placeholder:string;
//     onChange:any;
//     value:string;
// }
function Input(props: {
  placeholder: string;
  onChange: any;
  value: string;
  numeric: boolean;
  autoFocus: boolean;
  inputBlur: boolean;
  password?:boolean;
  email?:boolean
}) {
  const colorScheme = useColorScheme();

  const { placeholder, onChange, value, numeric, autoFocus,inputBlur } = props;
  const handleName = (text: string) => {
    onChange(text);
  };
  const inputRef = useRef(null);
  if(inputRef && inputBlur){
    inputRef.current.blur();
  }
  const c = Colors[colorScheme];
  return (
    <TextInput
      style={{
        height: 50,
        width: "80%",
        backgroundColor: c.inputBg,
        borderColor: c.inputBorder,
        color: "black",
        borderWidth: 1,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 7,
        marginBottom: 20,
      }}
      onChangeText={handleName}
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      keyboardType={props.email? 'email-address' :numeric ? "number-pad" : "default"}
      ref={inputRef}
      secureTextEntry={props.password}
    />
  );
}
export default Input;
