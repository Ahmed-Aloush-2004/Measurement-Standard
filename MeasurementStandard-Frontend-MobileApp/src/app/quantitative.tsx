import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchSections } from "../store/sectionsSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

export default function QuantitativeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { sections, isLoading, error } = useSelector(
    (state: RootState) => state.sections,
  );

  const load = useCallback(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const quantSections = sections.filter((s) =>
    s.name?.toLowerCase().includes("كمي") || s.name?.toLowerCase().includes("quantit"),
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="القدرات الكمية" subtitle="تدريبات الحساب والتحليل المنطقي" />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : quantSections.length === 0 ? (
        <EmptyState
          icon="pie-chart"
          title="لا توجد تدريبات كمية حالياً"
          subtitle="سيتم إضافة تدريبات القدرات الكمية قريباً"
        />
      ) : (
        <FlatList
          data={quantSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-xl bg-teal-50 items-center justify-center">
                  <Feather name="hash" size={18} color="#20B7A5" />
                </View>
                <View className="flex-1 mr-3">
                  <Text className="text-[#2B2D5C] font-extrabold text-sm" style={{ textAlign: "right" }}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text className="text-[#94A3B8] text-xs font-semibold mt-1" style={{ textAlign: "right" }}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}