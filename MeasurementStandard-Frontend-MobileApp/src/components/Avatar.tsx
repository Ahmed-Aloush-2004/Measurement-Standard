import React from "react";
import { View, Text, Image } from "react-native";

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
}

export default function Avatar({ uri, name, size = 80 }: Props) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#2B2D5C",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: size * 0.38, fontWeight: "800" }}>
        {initials}
      </Text>
    </View>
  );
}
