

import React, { useCallback, useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchMyTestSessions } from "../store/testSessionsSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export default function TestsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.testSessions,
  );
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchMyTestSessions());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMyTestSessions());
    setRefreshing(false);
  }, [dispatch]);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="الاختبارات" subtitle="سجل اختباراتك ونتائجك" />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="لا توجد اختبارات بعد"
          subtitle="ابدأ اختباراً جديداً لتظهر نتائجك هنا"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2B2D5C" />
          }
          renderItem={({ item }) => {
            const pct = item.total_questions > 0
              ? Math.round((item.score / item.total_questions) * 100)
              : 0;
            return (
              <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                {/* CHANGED: items-start instead of items-center to handle multiline text gracefully */}
                <View className="flex-row items-start justify-between mb-2">
                  {/* CHANGED: Added flex-1 and mr-2 to the title */}
                  <Text className="text-[#2B2D5C] font-extrabold text-sm flex-1 mr-2 text-left">
                    {item.examType?.name || "اختبار عام"}
                  </Text>
                  {/* CHANGED: Added shrink-0 to the date so it never gets pushed off screen */}
                  <Text className="text-[#94A3B8] text-xs font-semibold shrink-0 mt-0.5">
                    {formatDate(item.created_at)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Feather name="check-circle" size={14} color="#059669" />
                    <Text className="text-[#059669] text-xs font-bold ml-1">
                      {item.score}/{item.total_questions}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      pct >= 70 ? "bg-emerald-50" : pct >= 40 ? "bg-amber-50" : "bg-rose-50"
                    }`}
                  >
                    <Text
                      className={`text-xs font-black ${
                        pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-rose-600"
                      }`}
                    >
                      {pct}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}