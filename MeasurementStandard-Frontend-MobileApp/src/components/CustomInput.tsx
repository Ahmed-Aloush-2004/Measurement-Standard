

import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface CustomInputProps extends TextInputProps {
  iconName: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
}

export default function CustomInput({
  iconName,
  isPassword = false,
  ...props
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        height: 56,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderColor: isFocused ? "#2F2C5A" : "#E5E7EB",
      }}
    >
      <Feather
        name={iconName}
        size={20}
        color={isFocused ? "#2F2C5A" : "#9CA3AF"}
      />

      <TextInput
        style={{
          flex: 1,
          textAlign: "right",
          fontSize: 16,
          color: "#2F2C5A",
          marginHorizontal: 12,
          fontWeight: "600",
        }}
        placeholderTextColor="#9CA3AF"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={isSecure}
        {...props}
      />

      {isPassword && (
        <TouchableOpacity onPress={() => setIsSecure((prev) => !prev)}>
          <Feather
            name={isSecure ? "eye-off" : "eye"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}