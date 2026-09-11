// src/app/notifications.tsx
import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchNotifications, markNotificationAsRead } from "../store/notificationsSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export default function NotificationsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.notifications,
  );

  const load = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="الإشعارات" />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon="bell" title="لا توجد إشعارات حالياً" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                !item.is_read && dispatch(markNotificationAsRead(item.id))
              }
              activeOpacity={0.85}
              className={`flex-row items-start rounded-2xl p-4 mb-3 border ${
                item.is_read
                  ? "bg-white border-gray-100"
                  : "bg-[#EEF2FF] border-[#C7D2FE]"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ml-3 ${
                  item.is_read ? "bg-[#F1F5F9]" : "bg-[#2B2D5C]"
                }`}
              >
                <Feather
                  name="bell"
                  size={16}
                  color={item.is_read ? "#94A3B8" : "white"}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#2B2D5C] font-extrabold text-sm">
                    {item.title}
                  </Text>
                  {!item.is_read && (
                    <View className="w-2 h-2 rounded-full bg-[#25B7A9]" />
                  )}
                </View>
                <Text className="text-[#475569] text-xs font-semibold mt-1 leading-5 text-right">
                  {item.message}
                </Text>
                <Text className="text-[#94A3B8] text-[11px] font-semibold mt-1">
                  {timeAgo(item.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}