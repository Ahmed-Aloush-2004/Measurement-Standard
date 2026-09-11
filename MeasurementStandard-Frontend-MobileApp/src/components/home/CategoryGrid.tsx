import React from "react";
import {
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import {
  Text,
  View,
} from "react-native";

import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  onVerbalPress: () => void;
  onQuantitativePress: () => void;
  onAchievementPress: () => void;
  onStepPress: () => void;
  onTestsPress: () => void;
  onProgressPress: () => void;
}

export default function CategoryGrid({
  onVerbalPress,
  onQuantitativePress,
  onAchievementPress,
  onStepPress,
  onTestsPress,
  onProgressPress,
}: CategoryGridProps) {
  return (
    <View className="px-5 mt-4">
      {/* Section title */}
      <View className="flex-row items-center justify-end mb-3">
        <Text className="text-[#202020] text-[13px] font-black">
          الأقسام الرئيسية
        </Text>

        <Ionicons
          name="grid-outline"
          size={13}
          color="#5E6392"
          style={{ marginRight: 5 }}
        />
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-2">
        {/* Verbal */}
        <CategoryCard
          title="القدرات اللفظية"
          subtitle="+30 سؤال تدريبي"
          backgroundColor="#F0E7FF"
          buttonColor="#7641D8"
          icon={
            <MaterialCommunityIcons
              name="brain"
              size={32}
              color="#7540D5"
            />
          }
          onPress={onVerbalPress}
        />

        {/* Quantitative */}
        <CategoryCard
          title="القدرات الكمية"
          subtitle="+30 سؤال تدريبي"
          backgroundColor="#E4F8F4"
          buttonColor="#20B7A5"
          icon={
            <MaterialCommunityIcons
              name="calculator-variant"
              size={32}
              color="#20B7A5"
            />
          }
          onPress={onQuantitativePress}
        />

        {/* Achievement */}
        <CategoryCard
          title="التحصيلي"
          subtitle="جميع مواد التحصيلي"
          backgroundColor="#FFF0E5"
          buttonColor="#F28A3C"
          icon={
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={32}
              color="#F08035"
            />
          }
          onPress={onAchievementPress}
        />

        {/* STEP */}
        <CategoryCard
          title="STEP"
          subtitle="تدرب على اختبار STEP"
          backgroundColor="#E7F4FD"
          buttonColor="#168FD4"
          icon={
            <View className="w-[35px] h-[35px] rounded-full bg-[#168FD4] items-center justify-center">
              <Text className="text-white text-[9px] font-black">
                STEP
              </Text>
            </View>
          }
          onPress={onStepPress}
        />

        {/* Practice tests */}
        <CategoryCard
          title="اختبارات تجريبية"
          subtitle="اختبارات شاملة محاكية"
          backgroundColor="#FFF8DC"
          buttonColor="#E9C52C"
          icon={
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={32}
              color="#E5BF2A"
            />
          }
          onPress={onTestsPress}
        />

        {/* Progress */}
        <CategoryCard
          title="نتيجتي وتقدمي"
          subtitle="تابع مستوياتك وتحليلك"
          backgroundColor="#FFECEF"
          buttonColor="#E85D87"
          icon={
            <Ionicons
              name="stats-chart"
              size={32}
              color="#E85D87"
            />
          }
          onPress={onProgressPress}
        />
      </View>
    </View>
  );
}