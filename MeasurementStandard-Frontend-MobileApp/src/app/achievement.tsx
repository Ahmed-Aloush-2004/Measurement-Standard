import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchExamTypes } from "../store/sectionsSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

export default function AchievementScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { examTypes, isLoading, error } = useSelector(
    (state: RootState) => state.sections,
  );

  const load = useCallback(() => {
    dispatch(fetchExamTypes());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const achievementTypes = examTypes.filter((e) =>
    e.name?.toLowerCase().includes("تحصيلي") || e.name?.toLowerCase().includes("achiev"),
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="التحصيلي" subtitle="اختبارات التحصيل العلمي" />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : achievementTypes.length === 0 ? (
        <EmptyState
          icon="book"
          title="لا توجد اختبارات تحصيلية حالياً"
          subtitle="سيتم إضافة اختبارات التحصيلي قريباً"
        />
      ) : (
        <FlatList
          data={achievementTypes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                  <Feather name="book" size={18} color="#F28A3C" />
                </View>
                <View className="flex-1 mr-3">
                  <Text className="text-[#2B2D5C] font-extrabold text-sm" style={{ textAlign: "right" }}>
                    {item.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}