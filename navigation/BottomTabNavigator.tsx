// import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";

// import useColorScheme from '../hooks/useColorScheme';
import { RouteList } from "../types";
//
import firebase from "firebase";
import "firebase/firestore";
//
import HomeScreen from "../screens/HomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import PaymentScreen from "../screens/PaymentScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";

import refContext from "../hooks/refContext";
import { Text, View } from "../components/Themed";
import authContext from "../hooks/authContext";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import internetContext from "../hooks/internetContext";

const Route = createStackNavigator<RouteList>();

const firebaseConfig = {
  apiKey: "AIzaSyAOjiOONiVPsrYN8q6-je1m3VEy6BOOz8w",
  authDomain: "gyms-975b7.firebaseapp.com",
  databaseURL: "https://gyms-975b7-default-rtdb.firebaseio.com",
  projectId: "gyms-975b7",
  storageBucket: "gyms-975b7.appspot.com",
  messagingSenderId: "314774869944",
  appId: "1:314774869944:web:82884c5c335e81622ea14d",
};
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const ref = db.collection("users");

export default function BottomTabNavigator() {
  const [authState, setAuthState] = React.useState("not");
  const [user, setUser] = React.useState({});
  const [internet, setInternet] = React.useState(false);
  const [network, setNetwork] = React.useState(false);
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme];
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((e) => {
      if (e) {
        setUser(e);
        setAuthState("ready");
      } else {
        setAuthState("login");
      }
    });
  }, []);
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // console.log({state});
      setInternet(!!state.isInternetReachable);
      setNetwork(state.isConnected);
    });
    return unsubscribe;
  }, []);
  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      `Are you sure you want to sign out?`,
      [
        {
          text: "cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          onPress: () => {
            firebase.auth().signOut();
          },
        },
      ],
      { cancelable: true }
    );
  };
  if (authState !== "not") {
    if (authState === "ready") {
      return (
        <refContext.Provider value={{ ref }}>
          <authContext.Provider value={user}>
            <internetContext.Provider value={{ internet }}>
              {!internet && (
                <View
                  style={[
                    s.net,
                    {
                      borderColor: network
                        ? "rgb(210,170,100)"
                        : "rgb(200,100,100)",
                    },
                  ]}
                >
                  {network ? (
                    <Text style={s.text}>Connecting...</Text>
                  ) : (
                    <Text style={s.text}>Internet not reachable</Text>
                  )}
                </View>
              )}
              <Route.Navigator initialRouteName="Home">
                <Route.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    headerRight: () => (
                      <Ionicons
                        color={c.text}
                        name="log-out-outline"
                        size={32}
                        style={{ marginRight: 10 }}
                        onPress={handleSignOut}
                      />
                    ),
                  }}
                />
                <Route.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{}}
                />
                <Route.Screen
                  name="Payment"
                  component={PaymentScreen}
                  options={{}}
                />
              </Route.Navigator>
            </internetContext.Provider>
          </authContext.Provider>
        </refContext.Provider>
      );
    } else if (authState === "login") {
      return (
        <Route.Navigator initialRouteName="Login">
          <Route.Screen name="Login" component={LoginScreen} options={{}} />
          <Route.Screen name="SignUp" component={SignUpScreen} options={{}} />
        </Route.Navigator>
      );
    }
  } else {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={c.text} size={30} />
        <Text style={{ fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }
}
const s = StyleSheet.create({
  net: {
    marginTop: 50,
    position: "absolute",
    right:50,
    zIndex: 1,
    // backgroundColor: "red",
    paddingHorizontal: 7,
    paddingVertical: 5,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
  },
});
