import React, { useState, useRef, useContext } from "react";
import { Alert, Button, StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import Input from "../components/Input";
import PhoneInput from "react-native-phone-number-input";
import refContext from "../hooks/refContext";
import authContext from "../hooks/authContext";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import internetContext from "../hooks/internetContext";

export default function RegisterScreen(props: { navigation: any; route: any }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [aero, setAero] = useState(false);
  const [weight, setWeight] = useState(false);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  const refParent: { ref: any } = useContext(refContext);
  const user: { email?: string } = useContext(authContext);
  const { internet } = useContext(internetContext);

  const colorScheme = useColorScheme();
  const c = Colors[colorScheme];

  const handleAdd = () => {
    if (internet) {
      if (name !== "" && formattedValue !== "" && (aero || weight)) {
        setAdding(true);
        const subscription: string[] = [];

        if (aero) subscription.push("aerobics");
        if (weight) subscription.push("weights");

        Promise.all([
          refParent.ref.add({
            title: name,
            phone: formattedValue,
            id: Math.random(),
            user: user.email,
            subscription,
          }),
        ])
          .then((e) => {
            setName("");
            setValue("");
            setFormattedValue("");
            setAero(false);
            setWeight(false);
            props.navigation.navigate("Payment", {
              title: name,
              phone: formattedValue,
              id: e[0].id,
              subscription: subscription,
              c,
            });
            setAdding(false);
          })
          .catch(() => {
            Alert.alert("Error", "Unable to register user!");
          });
      } else {
        setError(true);
      }
    }else{
      Alert.alert("No internet!", "User can't be added without an internet connection.");
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Add user</Text>
      <View
        style={s.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {error && (
        <Text style={s.error}>Fill all fields and choose a subscription</Text>
      )}
      <Input
        onChange={(e: string) => setName(e)}
        placeholder="Name"
        value={name}
        numeric={false}
        autoFocus={true}
        inputBlur={false}
      />
      <PhoneInput
        ref={phoneInput}
        defaultValue={value}
        value={value}
        defaultCode="ET"
        layout="first"
        onChangeText={(text) => {
          setValue(text);
        }}
        onChangeFormattedText={(text) => {
          setFormattedValue(text);
        }}
        withDarkTheme
        // withShadow
        // autoFocus
      />
      <View style={s.sub}>
        <Text style={s.subTitle}>Subscription</Text>
        <View style={s.btns}>
          <TouchableHighlight style={s.aero} onPress={() => setAero(!aero)}>
            <View style={s.flexSide}>
              <Ionicons
                name={aero ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={c.text}
              />
              <Text style={s.subText}>Aerobics</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={s.weight}
            onPress={() => setWeight(!weight)}
          >
            <View style={s.flexSide}>
              <Ionicons
                name={weight ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={c.text}
              />
              <Text style={s.subText}>Weights</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
      <View style={s.btn}>
        <Button
          title={adding ? "Adding..." : "Add"}
          color={adding ? "gray" : undefined}
          onPress={() => (!adding ? handleAdd() : "")}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  btn: {
    width: 90,
    alignSelf: "flex-end",
    marginTop: 30,
    marginRight: 40,
  },
  error: {
    color: "white",
    backgroundColor: "red",
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 5,
  },
  sub: {
    height: 40,
    width: "80%",
    color: "black",
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginTop: 20,
    justifyContent: "center",
    flexDirection: "row",
  },
  subTitle: {
    fontSize: 15,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    width: 80,
    flex: 1,
    fontWeight: "bold",
    marginTop: 3,
  },
  btns: {
    flex: 2.2,
    flexDirection: "row",
    justifyContent: "center",
  },
  aero: {
    width: 105,
    height: "100%",
    fontSize: 18,
  },
  weight: {
    width: 105,
    height: "100%",
    fontSize: 18,
  },
  flexSide: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 2.2,
  },
  subText: {
    fontSize: 17,
    marginLeft: 5,
  },
});
