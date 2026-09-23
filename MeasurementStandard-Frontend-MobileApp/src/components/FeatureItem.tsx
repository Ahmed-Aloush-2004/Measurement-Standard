

// src/components/FeatureItem.tsx
import { View, Text } from "react-native";
import React from "react";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
}

export default function FeatureItem({ icon, title }: FeatureItemProps) {
  return (
    <View className="flex-1 items-center justify-start gap-y-3">
      <View className="w-12 h-12 items-center justify-center">
        {icon}
      </View>
      <Text className="text-[#64748B] text-[13px] sm:text-sm font-extrabold text-center">
        {title} 
      </Text>
    </View>
  );
}
