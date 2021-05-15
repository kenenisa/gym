import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Notifications } from "expo";
import { View, Text } from "../components/Themed";
import Input from "../components/Input";
import {
  FlatList,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import refContext from "../hooks/refContext";
import AsyncStorage from "@react-native-community/async-storage";
import internetContext from "../hooks/internetContext";
interface RefProps {
  ref: any;
}
export default function HomeScreen(props: { navigation: any; route: any }) {
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [DATA, setData] = useState([]);
  const [ready, setReady] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [unpaidCount, setUnpaidCount] = useState([]);
  const [notified, setNotified] = useState(false);
  const refParent: RefProps = useContext(refContext);
  const cs = useColorScheme();
  const c = Colors[cs];
  useEffect(() => {
    setUnpaidCount([]);
  }, []);
  useEffect(() => {
    const unpaidAmount = unpaidCount.filter((e) => e).length;
    if (
      unpaidCount.length === originalData.length &&
      !notified &&
      unpaidAmount
    ) {
      setNotified(true);
      Notifications.presentLocalNotificationAsync({
        title: "Alert",
        body: `Found ${unpaidAmount} expired subscriptions go check them out!`,
        ios: {
          sound: true,
        },
        android: {
          sound: true,
          vibrate: false,
        },
      });
    }
  }, [props.route.name, unpaidCount.length]);
  const changeUnpaidCount = (val: any) => {
    setUnpaidCount(val);
  };

  useEffect(() => {
    if (originalData.length && ready) {
      setData(
        originalData.sort((a: any, b: any) => {
          if (a && b && a.title && b.title) {
            var x = a.title.toLowerCase();
            var y = b.title.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
          }
          return 0;
        })
      );
    }
  }, [originalData.length, ready, props.route.name]);
  useEffect(() => {
    AsyncStorage.getItem("users").then((e: any) => {
      if (e) {
        setOriginalData(JSON.parse(e));
        setReady(true);
      }
    });
  }, []);
  // AsyncStorage.setItem("users", JSON.stringify([]));

  useEffect(() => {
    if (originalData.length) {
      AsyncStorage.setItem("users", JSON.stringify(originalData));
    }
  }, [originalData.length]);
  const appendUsers = useCallback(
    (users: any[]) => {
      setOriginalData((prev: any) =>
        prev.filter((e: any) => !users.find((r) => r.id === e.id)).concat(users)
      );
    },
    [originalData]
  );
  useEffect(() => {
    const unsubscribe = refParent.ref.onSnapshot((query: any) => {
      const users = query
        .docChanges()
        .filter((e: { type: string }) => e.type === "added")
        .map((e: { doc: any }) => {
          const user = e.doc.data();
          return { ...user, id: e.doc.id };
        });
      if (users.length) {
        appendUsers(users);
      } else {
        setEmpty(true);
      }
    });
    return unsubscribe;
  }, []);
  const handleSearch = (text: string) => {
    setSearch(text);

    setData(
      originalData
        .filter(
          (e: any) =>
            e.title.toLowerCase().search(text.toLowerCase()) + 1 ||
            e.phone.search(text) + 1
        )
        .sort((a: any, b: any) => {
          if (a && b && a.title && b.title) {
            var x = a.title.toLowerCase();
            var y = b.title.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
          }
          return 0;
        })
    );
  };

  const renderItem = (value: { item: any }) => (
    <Item
      title={value.item.title}
      key={`${value.item.id}`}
      id={value.item.id}
      phone={value.item.phone}
      subscription={value.item.subscription}
      setUnpaidCount={changeUnpaidCount}
      unpaidCount={unpaidCount}
      navigation={props.navigation}
    />
  );

  return (
    <View style={s.con}>
      <View style={s.inputCon}>
        <Input
          placeholder="Search"
          value={search}
          onChange={handleSearch}
          numeric={false}
          autoFocus={false}
          inputBlur={false}
        />
      </View>
      <View style={s.list}>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View style={{ justifyContent: "center", flexDirection: "row" }}>
              {!empty && <ActivityIndicator color={c.text} size={30} />}
              <Text style={{ fontSize: 20, marginLeft: 10 }}>
                {empty ? "No users found!" : "loading..."}
              </Text>
            </View>
          )}
          // keyExtractor={(item) => item.key}
        />
      </View>
      <View style={s.fabCon}>
        <TouchableWithoutFeedback
          onPress={() => props.navigation.navigate("Register")}
        >
          <View style={s.fab}>
            <Ionicons name="add" size={35} color="white" />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}
function Item(props: {
  title: string;
  phone: string;
  navigation: any;
  id: any;
  subscription: string[];
  setUnpaidCount: any;
  unpaidCount: any[];
}) {
  const refParent: RefProps = useContext(refContext);
  const [unpaid, setUnpaid] = useState(false);
  const [color] = useState(
    `rgb(${rand(100, 170)},${rand(100, 170)},${rand(100, 170)})`
  );
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme];
  const { internet } = useContext(internetContext);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (internet) {
      refParent.ref
        .doc(props.id)
        .collection("payment")
        .orderBy("date", "desc")
        .limit(1)
        .get()
        .then((e: any) => {
          setShown(true);
          let newArray = props.unpaidCount;
          if (e.size === 0) {
            if (shown) {
              newArray.push(0);
            } else {
              setUnpaid(true);
              newArray.push(1);
            }
          } else {
            e.forEach((doc: any) => {
              if (doc.data().time.to < new Date().getTime()) {
                setUnpaid(true);
                newArray.push(1);
              } else {
                setUnpaid(false);
                newArray.push(0);
              }
            });
          }
          props.setUnpaidCount(newArray);
        });
    }
  }, [internet]);
  function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  function capitalize(str: string) {
    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return "error";
  }
  function fistLetter(str: string) {
    if (str) {
      return str.charAt(0).toUpperCase();
    }
    return "*";
  }

  return (
    <TouchableNativeFeedback
      onPress={() =>
        props.navigation.navigate("Payment", {
          title: props.title,
          phone: props.phone,
          id: props.id,
          subscription: props.subscription,
          c,
        })
      }
    >
      <View style={s.itemCon}>
        <View style={s.avatar}>
          <View style={[s.a, { backgroundColor: color }]}>
            <Text style={s.placeholder}>{fistLetter(props.title)}</Text>
          </View>
        </View>
        <View style={s.text}>
          <Text style={s.title}>{capitalize(props.title)}</Text>
          <Text style={s.phone}>{props.phone}</Text>
        </View>
        <View style={s.right}>
          {unpaid ? (
            <View style={s.rightBack}>
              <Text style={{ color: "#ddd" }}>Unpaid</Text>
            </View>
          ) : (
            <React.Fragment></React.Fragment>
          )}
        </View>
      </View>
    </TouchableNativeFeedback>
  );
}

const s = StyleSheet.create({
  con: {
    minHeight: "90%",
  },
  inputCon: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  list: {
    height: "90%",
  },
  itemCon: {
    height: 90,
    // marginBottom: 10,
    // width:'90%',
    // marginLeft:'10%'
    flexDirection: "row",
    borderBottomColor: "rgba(150,150,150,0.4)",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  avatar: {
    height: "100%",
    flex: 1,
  },
  a: {
    width: "85%",
    height: "85%",
    marginLeft: 10,
    borderRadius: 50,
    justifyContent: "center",
  },
  text: {
    height: "100%",
    flex: 4,
    paddingLeft: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },
  phone: {},
  placeholder: {
    fontSize: 25,
    alignSelf: "center",
  },
  fab: {
    width: 65,
    height: 65,
    backgroundColor: "rgb(50,150,200)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    // position: "absolute",
    // bottom: 120,
    // right: 30,
    alignSelf: "flex-end",
    // marginLeft: 20,
    margin: 30,
    elevation: 4,
  },
  fabCon: {
    justifyContent: "flex-end",
    flex: 1,
    backgroundColor: "rgba(0,0,0,0)",
    width: 110,
    marginTop: -50,
    alignSelf: "flex-end",
  },
  right: {
    alignSelf: "center",
    marginRight: 10,
    width: 60,
  },
  rightBack: {
    backgroundColor: "rgb(170,30,30)",
    padding: 5,
    borderRadius: 7,
  },
});
