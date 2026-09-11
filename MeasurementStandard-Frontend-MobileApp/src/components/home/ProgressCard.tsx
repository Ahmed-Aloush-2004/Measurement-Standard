import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProgressCardProps {
  progress: number;
  level: string;
  onDetailsPress?: () => void;
}

export default function ProgressCard({
  progress,
  level,
  onDetailsPress,
}: ProgressCardProps) {
  const safeProgress = Math.min(
    Math.max(progress, 0),
    100
  );

  return (
    <View className="mx-5 mt-5 rounded-[16px] bg-[#EAF8F6] px-5 py-4">
      {/* Top information */}
      <View className="flex-row justify-between">
        {/* Level */}
        <View className="items-start">
          <Text className="text-[#8B9997] text-[10px] font-semibold">
            مستواك الحالي
          </Text>

          <Text className="text-[#161616] text-[17px] font-black mt-1">
            {level}
          </Text>
        </View>

        {/* Progress */}
        <View className="items-end">
          <Text className="text-[#8B9997] text-[10px] font-semibold">
            التقدم العام
          </Text>

          <Text className="text-[#161616] text-[18px] font-black mt-1">
            {safeProgress}%
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-[9px] rounded-full bg-[#DCE4E3] mt-4 overflow-hidden">
        <View
          className="h-full rounded-full bg-[#21B8A7]"
          style={{
            width: `${safeProgress}%`,
          }}
        />
      </View>

      {/* Details */}
      <TouchableOpacity
        onPress={onDetailsPress}
        activeOpacity={0.7}
        className="items-center mt-3"
      >
        <Text className="text-[#219D91] text-[10px] font-bold">
          عرض التفاصيل ←
        </Text>
      </TouchableOpacity>
    </View>
  );
}