

import React, { useMemo } from "react";
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
  unreadCount, // Falls back to the store count when not supplied
}: HomeHeaderProps) {

  const { items: notifications } = useSelector((state: RootState) => state.notifications);

  // Count unread from the store, but let an explicit prop win.
  const storeUnreadCount = useMemo(
    () => notifications?.filter((n) => !n.is_read).length || 0,
    [notifications],
  );
  const effectiveUnreadCount = unreadCount ?? storeUnreadCount;


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
        {effectiveUnreadCount > 0 && (
          <View className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] rounded-full bg-red-500 items-center justify-center px-[3px] border border-[#30266F]">
            <Text className="text-white text-[9px] font-bold text-center">
              {effectiveUnreadCount > 99 ? "99+" : effectiveUnreadCount}
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