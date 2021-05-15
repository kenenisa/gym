import React, { useState } from "react";
import { Alert, Button, StyleSheet, ActivityIndicator } from "react-native";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import Input from "../../components/Input";
import { Text, View } from "../../components/Themed";
import * as firebase from "firebase";
import useColorScheme from "../../hooks/useColorScheme";
import Colors from "../../constants/Colors";

function LoginScreen(props: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const cs = useColorScheme();
  const c = Colors[cs];
  const handleLogin = () => {
    setLoading(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(
        () => {setLoading(false);},
        (err) => {
          Alert.alert('Error',err.message);
          setLoading(false);
        }
      );
  };
  return (
    <View style={s.container}>
      <Text style={s.title}>Login</Text>
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
      <View style={s.btn}>
        {loading ? (
          <ActivityIndicator color={c.text} size={34}/>
        ) : (
          <Button title="Login" onPress={handleLogin} />
        )}
      </View>
      <View style={s.createBtn}>
        <TouchableNativeFeedback
          style={s.createTouch}
          onPress={() => props.navigation.navigate("SignUp")}
        >
          <Text>Create Account</Text>
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
    width: 130,
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
export default LoginScreen;
