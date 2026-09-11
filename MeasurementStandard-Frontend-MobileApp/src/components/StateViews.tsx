import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

export function LoadingView() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#2B2D5C" />
      <Text className="text-[#94A3B8] text-sm font-semibold mt-3">جاري التحميل...</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = "inbox", title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-16 h-16 rounded-2xl bg-[#F1F5F9] items-center justify-center mb-4">
        <Feather name={icon as any} size={28} color="#CBD5E1" />
      </View>
      <Text className="text-[#2B2D5C] font-extrabold text-base text-center mb-1">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-[#94A3B8] text-sm font-semibold text-center leading-5">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-4">
        <Feather name="alert-circle" size={28} color="#EF4444" />
      </View>
      <Text className="text-[#2B2D5C] font-extrabold text-base text-center mb-1">
        حدث خطأ
      </Text>
      <Text className="text-[#94A3B8] text-sm font-semibold text-center leading-5 mb-4">
        {message}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-[#2B2D5C] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold text-sm">إعادة المحاولة</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
