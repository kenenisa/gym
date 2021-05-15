import React, { useState, useEffect, useContext, useCallback } from "react";
import { StyleSheet, Linking, Alert, Button } from "react-native";

import { Text, View } from "../components/Themed";
import {
  FlatList,
  TouchableNativeFeedback,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import refContext from "../hooks/refContext";
import authContext from "../hooks/authContext";
import AsyncStorage from "@react-native-community/async-storage";
import internetContext from "../hooks/internetContext";
//
const weightsPrice = 600;
const aerobicsPrice = 300;
export default function PaymentScreen(props: { route: any }) {
  const [payments, setPayments] = useState([]);
  const [empty, setEmpty] = useState(false);
  const parentRef: { ref: any } = useContext(refContext);
  const { internet } = useContext(internetContext);

  const paymentRef = parentRef.ref
    .doc(props.route.params.id)
    .collection("payment");
  const c = props.route.params.c;
  const user: { email?: string } = useContext(authContext);

  const renderItem = (value: { item: any }) => (
    <Item
      time={value.item.time}
      sub={value.item.sub}
      key={value.item.id}
      user={value.item.user}
      c={c}
    />
  );
  const reducer = () => {
    let total = 0;
    payments.forEach((e: { sub: string }) => {
      total += e.sub === "weights" ? weightsPrice : aerobicsPrice;
    });
    return total;
  };
  const dateReducer = () => {
    const pay: { time: any } = payments[0];
    const lastPay: { time: any } = payments[payments.length - 1];
    const first = pay.time.to;
    const second = lastPay.time.from;
    return Math.round((first - second) / 1000 / 60 / 60 / 24);
  };

  const handleAdd = (sub: string) => {
    if (internet) {
      Alert.alert(
        "Confirm Payment",
        `Are you sure you want to add this payment to this users profile?`,
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              const date = new Date().getTime();

              const newItem: {
                time: { from: number; to: number };
                id: number;
                user?: string;
                sub: string;
                date: number;
              } = {
                time: { from: date, to: date + 1000 * 60 * 60 * 24 * 30 },
                id: Math.random(),
                user: user.email,
                sub,
                date,
              };
              Promise.all([paymentRef.add(newItem)]);
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert(
        "No internet!",
        "Payment can't be added without an internet connection."
      );
    }
  };
  const handleNextAdd = (sub: string) => {
    if (internet) {
      Alert.alert(
        "Already Exists",
        "This months payment already exists, but you can add for next Month!",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Next Month",
            onPress: () => {
              const pay: any = payments.filter((p: any) => p.sub == sub)[0];
              const date = new Date().getTime();
              if (pay.time.to < date + 1000 * 60 * 60 * 24 * 30) {
                const newItem: {
                  time: { from: number; to: number };
                  id: number;
                  user?: string;
                  sub: string;
                } = {
                  time: {
                    from: date + 1000 * 60 * 60 * 24 * 30,
                    to: date + 1000 * 60 * 60 * 24 * 30 * 2,
                  },
                  id: Math.random(),
                  user: user.email,
                  sub,
                };
                Promise.all([paymentRef.add(newItem)]);
              } else {
                Alert.alert("Sorry", "Next Months payment already exists too");
              }
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert(
        "No internet!",
        "Payment can't be added without an internet connection."
      );
    }
  };
  useEffect(() => {
    if (payments.length) {
      setPayments(payments.sort((a: any, b: any) => b.time.from - a.time.from));
    }
  }, [payments.length]);
  useEffect(() => {
    AsyncStorage.getItem(props.route.params.id).then((e: any) => {
      if (e) {
        setPayments(JSON.parse(e));
      }
    });
  }, []);
  // AsyncStorage.setItem(props.route.params.id, JSON.stringify([]));

  useEffect(() => {
    if (payments.length) {
      AsyncStorage.setItem(props.route.params.id, JSON.stringify(payments));
    }
  }, [payments.length]);
  const appendPayment = useCallback(
    (pay: any[]) => {
      setPayments((prev: any) =>
        prev.filter((e: any) => !pay.find((r) => r.id === e.id)).concat(pay)
      );
    },
    [payments]
  );
  useEffect(() => {
    const unsubscribe = paymentRef.onSnapshot((query: any) => {
      const pay = query
        .docChanges()
        .filter((e: { type: string }) => e.type === "added")
        .map((e: { doc: any }) => {
          const p = e.doc.data();
          return { ...p, id: e.doc.id };
        });

      if (pay.length) {
        appendPayment(pay);
      } else {
        setEmpty(true);
      }
    });
    return unsubscribe;
  }, []);
  return (
    <View style={s.con}>
      <View style={s.user}>
        <Text style={{ fontSize: 30 }}>{props.route.params.title}</Text>
        <Ionicons
          name="call-outline"
          size={27}
          style={s.callIcon}
          color={c.text}
          onPress={() => Linking.openURL("tel: " + props.route.params.phone)}
        />
      </View>
      <View style={s.total}>
        {payments[0] && (
          <React.Fragment>
            <Text style={{ marginRight: 20 }}>Total</Text>
            <Text style={{ marginRight: 20 }}>{reducer()} ETB</Text>
            <Text>{dateReducer()} Days</Text>
          </React.Fragment>
        )}
      </View>
      <View style={s.input}>
        {props.route.params.subscription.map((sub: string) => {
          const pay: any = payments.filter((p: any) => p.sub == sub)[0];
          let lightUp = true;
          if (pay) {
            if (pay.time.to - new Date().getTime() > 0) {
              lightUp = false;
            }
          }
          return (
            <View style={s.add} key={sub}>
              <Button
                title={`pay ${sub}`}
                color={lightUp ? "rgb(50,150,200)" : "gray"}
                onPress={
                  lightUp ? () => handleAdd(sub) : () => handleNextAdd(sub)
                }
              />
            </View>
          );
        })}
      </View>
      <View style={s.listCon}>
        <FlatList
          data={payments}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <Text style={{ alignSelf: "center" }}>
              {empty ? "No payments found!" : "loading..."}
            </Text>
          )}
          // keyExtractor={(item) => item.key}
        />
      </View>
    </View>
  );
}

function Item(props: { time: any; sub: string; user: string; c: any }) {
  function extractDate(num: number) {
    const date = new Date(num);
    const dateArray = date.toString().split(" ");
    return dateArray[1] + " " + dateArray[2] + ", " + dateArray[3];
  }
  return (
    <View>
      <View style={s.list}>
        <Text style={s.time}>
          {extractDate(props.time.from)} - {extractDate(props.time.to)}
        </Text>
        <Text style={[s.employee, { color: "gray" }]}>
          by {props.user ? props.user : "Unknown"}
        </Text>
        <Text style={s.amount}>
          {props.sub} - {props.sub === "weights" ? weightsPrice : aerobicsPrice}{" "}
          ETB
        </Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  con: {
    paddingHorizontal: 15,
  },
  input: {
    flexDirection: "row",
    paddingTop: 20,
    borderColor: "rgba(150,150,150,0.4)",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    justifyContent: "center",
  },
  add: {
    // width: 70,
    paddingHorizontal: 10,
    marginLeft: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom: 15,
  },
  total: {
    flexDirection: "row",
    marginBottom: 5,
  },
  user: {
    marginVertical: 20,
  },
  listCon: {
    marginTop: 20,
    marginLeft: 30,
    zIndex: 1,
    height: "70%",
  },
  list: {
    marginVertical: 20,
    fontSize: 18,
  },
  time: {
    fontSize: 19,
  },
  amount: {
    color: "rgb(25,150,100)",
  },
  employee: {
    fontSize: 16,
    color: "#ddd",
  },
  callIcon: {
    alignSelf: "flex-end",
    marginTop: -40,
    marginBottom: 10,
  },
});
