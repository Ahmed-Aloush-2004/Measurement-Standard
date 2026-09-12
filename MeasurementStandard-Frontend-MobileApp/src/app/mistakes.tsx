// src/app/mistakes.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchMistakes } from "../store/userResponsesSlice";
import { addFavorite, removeFavorite } from "../store/favoritesSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

export default function MistakesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { mistakes, isLoadingMistakes, error } = useSelector(
    
    (state: RootState) => state.userResponses,
  );
  const favoriteItems = useSelector(
    (state: RootState) => state.favorites.items,
  );
  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((f) => f.question.id)),
    [favoriteItems],
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    dispatch(fetchMistakes());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);


  console.log('mistake set : ', new Set(mistakes.map((mistake)=> mistake.id)).size);
  console.log('------------------------------------------');
  console.log('Mistakes state:', { mistakes: mistakes.length, set_mistake: [new Set(mistakes.map((mistake)=> mistake.id))].length });
  console.log('------------------------------------------');  

 
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="مراجعة أخطائي" subtitle="راجع الأسئلة التي أخطأت بها لتتقنها" />

      {isLoadingMistakes ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : mistakes.length === 0 ? (
        <EmptyState
          icon="smile"
          title="لا توجد أخطاء مسجلة 🎉"
          subtitle="أداؤك ممتاز حتى الآن، استمر في التدريب"
        />
      ) : (
        <FlatList
          data={mistakes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const isOpen = expandedId === item.id;
            const isFavorite = favoriteIds.has(item.question.id);
            const correctChoice = item.question.choices?.find((c) => c.is_correct);
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setExpandedId(isOpen ? null : item.id)}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
              >
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 text-[#2B2D5C] font-bold text-sm leading-6 text-right ml-2">
                    {item.question.content}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      isFavorite
                        ? dispatch(removeFavorite(item.question.id))
                        : dispatch(addFavorite(item.question.id))
                    }
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Feather
                      name="star"
                      size={18}
                      color={isFavorite ? "#F59E0B" : "#CBD5E1"}
                    />
                  </TouchableOpacity>
                </View>

                {isOpen && correctChoice && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center justify-between px-3 py-2 rounded-xl mb-2 bg-emerald-50">
                      <Text className="text-emerald-700 text-sm font-semibold">
                        {correctChoice.content}
                      </Text>
                      <Feather name="check-circle" size={16} color="#059669" />
                    </View>
                    {item.question.explanation && (
                      <Text className="text-[#64748B] text-xs font-semibold mt-1 leading-5">
                        💡 {item.question.explanation}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}