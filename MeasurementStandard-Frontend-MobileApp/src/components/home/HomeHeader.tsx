import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Feather,
  Ionicons,
} from "@expo/vector-icons";

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export default function HomeHeader({
  onNotificationPress,
  onMenuPress,
}: HomeHeaderProps) {
  return (
    <View className="h-[62px] bg-[#30266F] flex-row items-center justify-between px-5 rounded-b-[18px]">
      {/* Notification */}
      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        className="w-10 h-10 items-center justify-center"
      >
        <Ionicons
          name="notifications-outline"
          size={22}
          color="#FFFFFF"
        />

        {/* Notification dot */}
        <View className="absolute top-[8px] right-[8px] w-[6px] h-[6px] rounded-full bg-[#25B7A9]" />
      </TouchableOpacity>

      {/* Logo */}
      <View className="flex-row items-center">
        <Text className="text-[#25B7A9] text-[20px] font-black">
          +
        </Text>

        <Text className="text-white text-[19px] font-black mr-1">
          معيار قياس
        </Text>
      </View>

      {/* Menu */}
      <TouchableOpacity
        onPress={onMenuPress}
        activeOpacity={0.7}
        className="w-10 h-10 items-center justify-center"
      >
        <Feather
          name="menu"
          size={25}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
}