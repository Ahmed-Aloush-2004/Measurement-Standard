import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
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

  const load = useCallback(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

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
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
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
            </View>
          )}
        />
      )}
    </View>
  );
}