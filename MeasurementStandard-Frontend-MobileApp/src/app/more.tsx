import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { logout } from "../store/authSlice";
import ScreenHeader from "../components/ScreenHeader";

interface MoreItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
}

function MoreItem({ icon, label, onPress, color = "#2B2D5C" }: MoreItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3 border border-gray-100"
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}10` }}>
        {icon}
      </View>
      <Text className="flex-1 text-[#2B2D5C] font-bold text-sm text-right mr-3">
        {label}
      </Text>
      <Feather name="chevron-left" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من حسابك؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="المزيد" />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20 }}>
        {/* معلومات المستخدم */}
        <View className="bg-white rounded-2xl p-4 mb-5 border border-gray-100">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-[#2B2D5C] items-center justify-center">
              <Feather name="user" size={20} color="white" />
            </View>
            <View className="flex-1 mr-3">
              <Text className="text-[#2B2D5C] font-extrabold text-sm" style={{ textAlign: "right" }}>
                {user?.username || "مستخدم"}
              </Text>
              <Text className="text-[#94A3B8] text-xs font-semibold" style={{ textAlign: "right", direction: "ltr" }}>
                {user?.email || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* عناصر القائمة */}
        <MoreItem
          icon={<Feather name="user" size={18} color="#2B2D5C" />}
          label="تعديل الملف الشخصي"
          onPress={() => router.push("/profile/edit")}
        />

        <MoreItem
          icon={<Feather name="star" size={18} color="#F59E0B" />}
          label="المفضلة"
          onPress={() => router.push("/favorites")}
          color="#F59E0B"
        />

        <MoreItem
          icon={<Feather name="file-text" size={18} color="#3B82F6" />}
          label="اختباراتي"
          onPress={() => router.push("/tests")}
          color="#3B82F6"
        />

        <MoreItem
          icon={<Feather name="bar-chart-2" size={18} color="#10B981" />}
          label=" نتيجتي وتقدمي"
          onPress={() => router.push("/progress")}
          color="#10B981"
        />

        <MoreItem
          icon={<Feather name="alert-circle" size={18} color="#EF4444" />}
          label="مراجعة أخطائي"
          onPress={() => router.push("/mistakes")}
          color="#EF4444"
        />

        <MoreItem
          icon={<Feather name="bell" size={18} color="#8B5CF6" />}
          label="الإشعارات"
          onPress={() => router.push("/notifications")}
          color="#8B5CF6"
        />

        {/* تسجيل الخروج */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="flex-row items-center justify-center bg-rose-50 rounded-2xl px-4 py-4 mt-6 border border-rose-100"
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text className="text-rose-500 font-bold text-sm mr-2">تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}