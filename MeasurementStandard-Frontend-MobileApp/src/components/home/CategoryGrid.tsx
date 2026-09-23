
import React from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { ExamType } from "@/src/store/sectionsSlice";

interface CategoryGridProps {
  examTypes: ExamType[];
  onExamPress: (examType: ExamType) => void;
  onProgressPress: () => void;
}

// Map the visuals directly to the exam code so they never get mixed up
function getExamVisual(code?: string) {
  switch (code) {
    case "STEP":
      return {
        backgroundColor: "#E7F4FD",
        buttonColor: "#168FD4",
        icon: (
          <View className="w-[35px] h-[35px] rounded-full bg-[#168FD4] items-center justify-center">
            <Text className="text-white text-[10px] font-black">STEP</Text>
          </View>
        ),
      };
    case "GENERAL_APTITUDE":
      return {
        backgroundColor: "#E4F8F4",
        buttonColor: "#20B7A5",
        icon: (
          <MaterialCommunityIcons
            name="calculator-variant"
            size={32}
            color="#20B7A5"
          />
        ),
      };
    case "ACHIEVEMENT":
      return {
        backgroundColor: "#FFF0E5",
        buttonColor: "#F28A3C",
        icon: (
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={32}
            color="#F08035"
          />
        ),
      };
    case "PRACTICE":
    default:
      return {
        backgroundColor: "#F0E7FF",
        buttonColor: "#7641D8",
        icon: (
          <MaterialCommunityIcons name="brain" size={32} color="#7540D5" />
        ),
      };
  }
}

export default function CategoryGrid({
  examTypes = [], // Fallback default
  onExamPress,
  onProgressPress,
}: CategoryGridProps) {
  return (
    <View className="px-5 mt-4">
      <View className="flex-row items-center justify-end mb-3">
        <Text className="text-[#202020] text-[13px] font-black">
          الاختبارات الرئيسية
        </Text>

        <Ionicons
          name="grid-outline"
          size={18}
          color="#5E6392"
          style={{ margin:5,marginBottom:10 }}
        />
      </View>

      <View className="flex-row flex-wrap justify-between">
        {examTypes?.map((examType) => {
          // Pass the code instead of the index
          const visual = getExamVisual(examType.code);

          const questionCount =
            examType.sections?.reduce(
              (total, section) => total + (section.questions?.length ?? 0),
              0
            ) ?? 0;

          return (
            <TouchableOpacity
              key={examType.id}
              onPress={() => onExamPress(examType)}
              activeOpacity={0.82}
              // Increased height to 145px and added mb-3 for breathing room
              className="w-[48%] h-[145px] rounded-[14px] px-3 py-4 items-center justify-between mb-3"
              style={{
                backgroundColor: visual.backgroundColor,
              }}
            >
              <View className="h-[35px] items-center justify-center">
                {visual.icon}
              </View>

              <View className="items-center flex-1 justify-center mt-2 mb-2">
                <Text
                  numberOfLines={2}
                  className="text-[#171717] text-[12px] font-black text-center leading-4"
                >
                  {examType.name}
                </Text>

                <Text
                  numberOfLines={1}
                  className="text-[#77777D] text-[9px] font-medium mt-1"
                >
                  {examType.sections?.length ?? 0} أقسام
                  {questionCount > 0 ? ` • ${questionCount} سؤال` : ""}
                </Text>
              </View>

              <View
                className="px-4 h-[25px] rounded-[7px] items-center justify-center w-[80%]"
                style={{
                  backgroundColor: visual.buttonColor,
                }}
              >
                <Text className="text-white text-[10px] font-bold">
                  ابدأ الآن
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={onProgressPress}
          activeOpacity={0.82}
          // Matched height to 145px
          className="w-[48%] h-[145px] rounded-[14px] px-3 py-4 items-center justify-between bg-[#FFECEF] mb-3"
        >
          <View className="h-[35px] items-center justify-center">
            <Ionicons name="stats-chart" size={32} color="#E85D87" />
          </View>

          <View className="items-center flex-1 justify-center mt-2 mb-2">
            <Text className="text-[#171717] text-[13px] font-black text-center">
              نتيجتي وتقدمي
            </Text>

            <Text className="text-[#77777D] text-[9px] font-medium mt-1 text-center">
              تابع مستوياتك وتحليلك
            </Text>
          </View>

          <View className="px-4 h-[25px] rounded-[7px] bg-[#E85D87] items-center justify-center w-[80%]">
            <Text className="text-white text-[10px] font-bold">عرض</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}