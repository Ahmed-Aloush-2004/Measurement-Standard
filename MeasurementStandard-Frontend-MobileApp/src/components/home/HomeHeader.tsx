

import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  unreadCount?: number; // Added unreadCount prop
}

export default function HomeHeader({
  onNotificationPress,
  onMenuPress,
  unreadCount = 0, // Default to 0
}: HomeHeaderProps) {

  const { items: notifications } = useSelector((state: RootState) => state.notifications);
  useEffect(() => {

    // Calculate how many notifications are unread
    unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  }, [notifications])


  return (
    <View className="h-[62px] bg-[#30266F] flex-row items-center justify-between px-5 rounded-b-[18px]">
      {/* Notification */}
      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        className="w-10 h-10 items-center justify-center relative"
      >
        <Ionicons
          name="notifications-outline"
          size={22}
          color="#FFFFFF"
        />

        {/* Red Notification Badge with Number */}
        {unreadCount > 0 && (
          <View className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] rounded-full bg-red-500 items-center justify-center px-[3px] border border-[#30266F]">
            <Text className="text-white text-[9px] font-bold text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Logo */}
      <View className="flex-row items-center">
        <Text className="text-[#25B7A9] text-[20px] font-black">+</Text>
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
        <Feather name="menu" size={25} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}