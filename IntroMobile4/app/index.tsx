"use dom"
import { Text, View } from "react-native";
import Home from "./home";
import { Link } from "expo-router";

const Index = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/home">Home</Link>
    </View>
  );
}

export default Index;