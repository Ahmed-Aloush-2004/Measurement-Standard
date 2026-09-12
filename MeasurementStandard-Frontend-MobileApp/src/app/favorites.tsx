import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchFavorites, removeFavorite } from "../store/favoritesSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

export default function FavoritesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.favorites,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="المفضلة" subtitle="الأسئلة المحفوظة للمراجعة" />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="star"
          title="لا توجد أسئلة مفضلة"
          subtitle="اضغط على أي سؤال وأضفه للمفضلة لمراجعته لاحقاً"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const isOpen = expandedId === item.id;
            const answer = item.question.choices?.find((c) => c.is_correct);
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
                    onPress={() => dispatch(removeFavorite(item.question.id))}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Feather name="star" size={18} color="#F59E0B" />
                  </TouchableOpacity>
                </View>

                {isOpen && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-end mb-2">
                      <Text className="text-[#2B2D5C] font-extrabold text-xs">
                        الخيارات:
                      </Text>
                    </View>
                    {(item.question.choices ?? []).map((c) => {
                      const isCorrect = !!c.is_correct;
                      return (
                        <View
                          key={c.id}
                          className={`flex-row items-center justify-between px-3 py-2 rounded-xl mb-1 ${
                            isCorrect ? "bg-emerald-50" : "bg-gray-50"
                          }`}
                        >
                          <Text
                            className={`flex-1 text-sm font-semibold ${
                              isCorrect ? "text-emerald-700" : "text-[#64748B]"
                            }`}
                          >
                            {c.content}
                          </Text>
                          {isCorrect && (
                            <Feather name="check-circle" size={16} color="#059669" />
                          )}
                        </View>
                      );
                    })}
                    {answer && (
                      <View className="flex-row items-center mt-2">
                        <Feather name="check-circle" size={14} color="#059669" />
                        <Text className="text-emerald-700 text-xs font-bold ml-1">
                          الإجابة الصحيحة: {answer.content}
                        </Text>
                      </View>
                    )}
                    {item.question.explanation && (
                      <Text className="text-[#64748B] text-xs font-semibold mt-2 leading-5">
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