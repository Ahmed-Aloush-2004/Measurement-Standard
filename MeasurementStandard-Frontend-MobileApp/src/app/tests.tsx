import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { Stack } from "expo-router";
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

  const load = useCallback(() => {
    dispatch(fetchMyTestSessions());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

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
          renderItem={({ item }) => {
            const pct = item.total_questions > 0
              ? Math.round((item.score / item.total_questions) * 100)
              : 0;
            return (
              <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#2B2D5C] font-extrabold text-sm">
                    {item.examType?.name || "اختبار عام"}
                  </Text>
                  <Text className="text-[#94A3B8] text-xs font-semibold">
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