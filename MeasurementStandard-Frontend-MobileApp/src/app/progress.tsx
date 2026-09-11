// src/app/progress.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchProgress } from "../store/userProgressSlice";
import { fetchMyTestSessions } from "../store/testSessionsSlice";
import { fetchMyResponses } from "../store/userResponsesSlice";
import ScreenHeader from "../components/ScreenHeader";
import ProgressBar from "../components/ProgressBar";
import { LoadingView } from "../components/StateViews";
import { paletteFor } from "../theme/colors";

export default function ProgressScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: progress, isLoading } = useSelector(
    (state: RootState) => state.userProgress,
  );
  const { items: sessions } = useSelector((state: RootState) => state.testSessions);
  const { items: responses } = useSelector((state: RootState) => state.userResponses);

  useEffect(() => {
    dispatch(fetchProgress());
    dispatch(fetchMyTestSessions());
    dispatch(fetchMyResponses());
  }, [dispatch]);

  const byExamType = useMemo(() => {
    const map = new Map<string, { name: string; score: number; total: number }>();
    sessions.forEach((s) => {
      const key = s.examType?.id || "unknown";
      const name = s.examType?.name || "غير محدد";
      const existing = map.get(key) || { name, score: 0, total: 0 };
      existing.score += s.score;
      existing.total += s.total_questions;
      map.set(key, existing);
    });
    return Array.from(map.values());
  }, [sessions]);

  const totalAnswered = responses.length;
  const totalCorrect = responses.filter((r) => r.is_correct).length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  if (isLoading && !progress) {
    return (
      <View className="flex-1 bg-[#F8FAFC]">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="نتيجتي وتقدمي" />
        <LoadingView />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="نتيجتي وتقدمي" subtitle="تحليل أدائك التدريبي" />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20 }}>
        {/* بطاقة الملخص */}
        <View className="bg-[#2B2D5C] rounded-3xl p-5 mb-5">
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-indigo-200 text-xs font-bold">المستوى العام</Text>
              <Text className="text-white font-black text-3xl mt-1">
                {progress?.overall_score ?? 0}%
              </Text>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center">
              <Feather name="award" size={26} color="#25B7A9" />
            </View>
          </View>
          <ProgressBar
            progress={Number(progress?.overall_score ?? 0)}
            color="#25B7A9"
            trackColor="rgba(255,255,255,0.15)"
          />
        </View>

        {/* إحصائيات سريعة */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[31%] bg-white rounded-2xl p-4 items-center border border-gray-100">
            <Text className="text-[#2B2D5C] font-black text-lg">
              {progress?.tests_completed ?? 0}
            </Text>
            <Text className="text-[#94A3B8] text-[11px] font-bold mt-1 text-center">
              اختبار مكتمل
            </Text>
          </View>
          <View className="w-[31%] bg-white rounded-2xl p-4 items-center border border-gray-100">
            <Text className="text-[#2B2D5C] font-black text-lg">{totalAnswered}</Text>
            <Text className="text-[#94A3B8] text-[11px] font-bold mt-1 text-center">
              سؤال محلول
            </Text>
          </View>
          <View className="w-[31%] bg-white rounded-2xl p-4 items-center border border-gray-100">
            <Text className="text-[#2B2D5C] font-black text-lg">{accuracy}%</Text>
            <Text className="text-[#94A3B8] text-[11px] font-bold mt-1 text-center">
              نسبة الدقة
            </Text>
          </View>
        </View>

        {/* الأداء حسب نوع الاختبار */}
        <Text className="text-[#2B2D5C] font-extrabold text-base mb-3">
          الأداء حسب نوع الاختبار
        </Text>

        {byExamType.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center border border-gray-100 mb-6">
            <Feather name="bar-chart-2" size={28} color="#CBD5E1" />
            <Text className="text-[#94A3B8] font-semibold text-sm mt-2 text-center">
              أكمل اختباراً واحداً على الأقل لعرض تحليل الأداء هنا
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            {byExamType.map((item, index) => {
              const pct = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
              const palette = paletteFor(index);
              return (
                <View
                  key={item.name}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ color: palette.label }} className="font-extrabold text-sm">
                      {item.name}
                    </Text>
                    <Text className="text-[#2B2D5C] font-black text-sm">{pct}%</Text>
                  </View>
                  <ProgressBar progress={pct} color={palette.icon} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}