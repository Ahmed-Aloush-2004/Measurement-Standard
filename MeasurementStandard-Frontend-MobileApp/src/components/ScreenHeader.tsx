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
    <SafeAreaView edges={["top"]} className="bg-[#2B2D5C]">
      <View className="flex-row items-center px-4 py-4">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            className="px-1"
          >
            <Feather name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-white font-black text-lg text-right">{title}</Text>
          {subtitle ? (
            <Text className="text-indigo-200 text-xs font-semibold mt-1 text-right">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}