import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchExamTypes } from "../store/sectionsSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

export default function StepScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { examTypes, isLoading, error } = useSelector(
    (state: RootState) => state.sections,
  );

  const load = useCallback(() => {
    dispatch(fetchExamTypes());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const stepTypes = examTypes.filter((e) =>
    e.name?.toLowerCase().includes("step"),
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="STEP" subtitle="تدريب على اختبار STEP" />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : stepTypes.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title="لا توجد اختبارات STEP حالياً"
          subtitle="سيتم إضافة اختبارات STEP قريباً"
        />
      ) : (
        <FlatList
          data={stepTypes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
              onPress={() =>
                router.push({
                  pathname: "/quiz",
                  params: {
                    examTypeId: item.id,
                    title: item.name,
                  },
                })
              }
            >
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                  <Feather name="clipboard" size={18} color="#168FD4" />
                </View>
                <View className="flex-1 mr-3">
                  <Text className="text-[#2B2D5C] font-extrabold text-sm" style={{ textAlign: "right" }}>
                    {item.name}
                  </Text>
                </View>
                <Feather name="chevron-left" size={18} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}