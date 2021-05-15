import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet } from "react-native";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import Input from "../../components/Input";
import { Text, View } from "../../components/Themed";
import * as firebase from "firebase";
import useColorScheme from "../../hooks/useColorScheme";
import Colors from "../../constants/Colors";

function SignUpScreen(props: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const cs = useColorScheme();
  const c = Colors[cs];
  const handleSignUp = () => {
    if (passwordConfirm !== password) {
      Alert.alert('Error',"Password Confirmation Doesn't match with the password");
      return;
    }
    setLoading(true);
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(
        () => {
          setLoading(false);
        },
        (err) => {
          Alert.alert('Error',err.message);
          setLoading(false);
        }
      );
  };
  return (
    <View style={s.container}>
      <Text style={s.title}>Sign in</Text>
      <View
        style={s.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Input
        onChange={(e: string) => setEmail(e)}
        placeholder="Email"
        value={email}
        numeric={false}
        autoFocus={true}
        inputBlur={false}
        email={true}
      />
      <Input
        onChange={(e: string) => setPassword(e)}
        placeholder="Password"
        value={password}
        numeric={false}
        autoFocus={false}
        inputBlur={false}
        password={true}
      />
      <Input
        onChange={(e: string) => setPasswordConfirm(e)}
        placeholder="Password confirm"
        value={passwordConfirm}
        numeric={false}
        autoFocus={false}
        inputBlur={false}
        password={true}
      />
      <View style={s.btn}>
        {loading ? (
          <ActivityIndicator color={c.text} size={34} />
        ) : (
          <Button title="SignUp" onPress={handleSignUp} />
        )}
      </View>
      <View style={s.createBtn}>
        <TouchableNativeFeedback
          style={s.createTouch}
          onPress={() => props.navigation.navigate("Login")}
        >
          <Text>Already have an Account</Text>
        </TouchableNativeFeedback>
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
  createBtn: {
    width: 190,
    alignSelf: "flex-start",
    marginTop: -37,
    marginLeft: 40,
    height: 30,
  },
  createTouch: {
    padding: 8,
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
});
export default SignUpScreen;
