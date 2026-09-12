import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;

  backgroundColor: string;
  buttonColor: string;

  onPress: () => void;
}

export default function CategoryCard({
  title,
  subtitle,
  icon,
  backgroundColor,
  buttonColor,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="w-[48%] h-[124px] rounded-[14px] px-3 py-3 items-center justify-between"
      style={{
        backgroundColor,
      }}
    >
      {/* Icon */}
      <View  className="h-[38px] items-center justify-center">
        {icon}
      </View>

      {/* Text */}
      <View className="items-center">
        <Text
          numberOfLines={1}
          className="text-[#171717] text-[13px] font-black"
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          className="text-[#77777D] text-[9px] font-medium mt-[2px]"
        >
          {subtitle}
        </Text>
      </View>

      {/* Button */}
      <View
        className="px-4 h-[23px] rounded-[7px] items-center justify-center"
        style={{
          backgroundColor: buttonColor,
        }}
      >
        <Text className="text-white text-[9px] font-bold">
          ابدأ الآن
        </Text>
      </View>
    </TouchableOpacity>
  );
}