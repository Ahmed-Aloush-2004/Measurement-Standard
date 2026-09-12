import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchQuizQuestions } from "../store/questionsSlice";
import { apiClient, getErrorMessage } from "../api/client";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, ErrorState, EmptyState } from "../components/StateViews";

interface SubmitAnswer {
  questionId: string;
  selectedChoiceId: string;
}

interface SessionResult {
  id: string;
  score: number;
  total_questions: number;
  score_pct: number;
  correct_count: number;
  examType?: { id: string; name: string } | null;
  created_at: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams<{
    examTypeId?: string;
    sectionId?: string;
    title?: string;
    limit?: string;
  }>();

  const title = params.title || "اختبار";
  const examTypeId = params.examTypeId || "";
  const sectionId = params.sectionId || "";
  const limit = params.limit ? Number(params.limit) : 10;

  const { questions, isLoading, error } = useSelector(
    (state: RootState) => state.quizQuestions,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    dispatch(fetchQuizQuestions({ examTypeId: examTypeId || undefined, sectionId: sectionId || undefined, limit }));
  }, [dispatch, examTypeId, sectionId, limit]);

  const answeredList: SubmitAnswer[] = useMemo(
    () =>
      questions
        .map((q) => ({ questionId: q.id, selectedChoiceId: selected[q.id] }))
        .filter((a) => a.selectedChoiceId),
    [questions, selected],
  );

  const isLast = currentIndex >= questions.length - 1;
  const answeredCount = answeredList.length;

  const handleSelect = (choiceId: string) => {
    if (!questions[currentIndex]) return;
    setSelected((prev) => ({ ...prev, [questions[currentIndex].id]: choiceId }));
  };

  const restart = () => {
    setSelected({});
    setCurrentIndex(0);
    setResult(null);
    setSubmitError(null);
    dispatch(fetchQuizQuestions({ examTypeId: examTypeId || undefined, sectionId: sectionId || undefined, limit }));
  };

  const handleSubmit = async () => {
    if (!examTypeId) {
      setSubmitError("نوع الاختبار غير معروف، عد وحاول مجدداً");
      return;
    }
    if (answeredList.length !== questions.length) {
      setSubmitError(`لم تتم الإجابة على ${questions.length - answeredList.length} سؤال - أجب عنها ثم أرسل`);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiClient.post("/test-sessions", {
        examTypeId,
        answers: answeredList,
      });
      setResult(res.data);
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, "فشل إرسال الاختبار"));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const pct = result.score_pct;
    return (
      <View className="flex-1 bg-[#F8FAFC]">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="نتيجة الاختبار" />
        <View className="flex-1 items-center justify-center px-8">
          <View
            className={`w-32 h-32 rounded-full items-center justify-center mb-6 ${
              pct >= 70 ? "bg-emerald-50" : pct >= 40 ? "bg-amber-50" : "bg-rose-50"
            }`}
          >
            <Text
              className={`text-4xl font-black ${
                pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-rose-600"
              }`}
            >
              {Math.round(pct)}%
            </Text>
          </View>
          <Text className="text-[#2B2D5C] font-extrabold text-2xl mb-2">اختبار منتهى ببنجاح</Text>
          <Text className="text-[#64748B] text-sm font-semibold text-center mb-8">
            أجبت بشكل صحيح على {result.correct_count} من {result.total_questions} أسئلة
          </Text>

          <View className="flex-row items-center justify-center mb-10">
            <View className="items-center bg-white rounded-2xl px-8 py-4 border border-gray-100 mr-3">
              <Text className="text-[#2B2D5C] font-black text-xl">{result.correct_count}</Text>
              <Text className="text-[#94A3B8] text-xs font-semibold mt-1">إجابات صحيحة</Text>
            </View>
            <View className="items-center bg-white rounded-2xl px-8 py-4 border border-gray-100">
              <Text className="text-[#2B2D5C] font-black text-xl">{result.total_questions - result.correct_count}</Text>
              <Text className="text-[#94A3B8] text-xs font-semibold mt-1">إجابات خاطئة</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={restart}
            className="bg-[#2B2D5C] w-full py-4 rounded-2xl items-center mb-3"
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-base">إعادة الاختبار</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/tests")}
            className="bg-white border border-[#2B2D5C] w-full py-4 rounded-2xl items-center"
            activeOpacity={0.85}
          >
            <Text className="text-[#2B2D5C] font-bold text-base">سجل الاختبارات</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[currentIndex];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={title} />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={() =>
          dispatch(fetchQuizQuestions({ examTypeId: examTypeId || undefined, sectionId: sectionId || undefined, limit }))
        } />
      ) : questions.length === 0 ? (
        <EmptyState icon="book-open" title="لا توجد أسئلة بعد" subtitle="لم يتم إضافة أسئلة لهذا القسم بعد" />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Feather name="check-circle" size={14} color="#10B981" />
              <Text className="text-[#059669] text-xs font-bold mr-1">
                {answeredCount}/{questions.length} أجبت
              </Text>
            </View>
            <Text className="text-[#94A3B8] text-xs font-semibold">
              سؤال {currentIndex + 1} من {questions.length}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
            <Text className="text-[#2B2D5C] font-extrabold text-lg leading-7" style={{ textAlign: "right" }}>
              {question.content}
            </Text>
          </View>

          <View>
            {question.choices.map((choice, idx) => {
              const isSelected = selected[question.id] === choice.id;
              return (
                <TouchableOpacity
                  key={choice.id}
                  onPress={() => handleSelect(choice.id)}
                  activeOpacity={0.85}
                  className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
                    isSelected
                      ? "bg-[#2B2D5C] border-[#2B2D5C]"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isSelected ? "bg-white/20" : "bg-[#F1F5F9]"
                    }`}
                  >
                    <Text className={`text-sm font-black ${isSelected ? "text-white" : "text-[#94A3B8]"}`}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 font-bold text-base ${isSelected ? "text-white" : "text-[#2B2D5C]"}`}
                    style={{ textAlign: "right" }}
                  >
                    {choice.content}
                  </Text>
                  {isSelected ? <Feather name="check-circle" size={18} color="white" /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {submitError ? (
            <Text className="text-rose-600 text-sm font-bold text-center mt-2 mb-2">{submitError}</Text>
          ) : null}

          <View className="flex-row items-center mt-4" style={{ flexDirection: "row-reverse" }}>
            {!isLast ? (
              <TouchableOpacity
                onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="flex-1 bg-[#2B2D5C] py-4 rounded-2xl items-center"
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold text-base">التالي</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#10B981] py-4 rounded-2xl items-center"
                activeOpacity={0.85}
              >
                {submitting ? (
                  <Text className="text-white font-bold text-base">جارٍ الإرسال...</Text>
                ) : (
                  <Text className="text-white font-bold text-base">إنهاء الاختبار</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {currentIndex > 0 ? (
            <TouchableOpacity
              onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="py-3 items-center mt-2"
              activeOpacity={0.7}
            >
              <Text className="text-[#64748B] font-bold text-sm">السابق</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}