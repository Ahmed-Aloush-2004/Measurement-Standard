import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export default function ScreenHeader({ title, subtitle, showBack = true }: Props) {
  const router = useRouter();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: "#2B2D5C" }}
    >
      <View className="flex-row items-center px-4 py-4">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            className="px-1"
          >
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text
            className="text-lg"
            style={{ color: "#FFFFFF", fontWeight: "900", textAlign: "right" }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="text-xs mt-1"
              style={{ color: "#C7D2FE", fontWeight: "600", textAlign: "right" }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}