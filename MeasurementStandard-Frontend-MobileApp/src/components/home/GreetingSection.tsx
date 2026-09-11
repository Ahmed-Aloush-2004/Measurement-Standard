import React from "react";
import { Image, Text, View } from "react-native";

interface GreetingSectionProps {
  name: string;
  avatar?: any;
}

export default function GreetingSection({
  name,
  avatar,
}: GreetingSectionProps) {
  
  // التحقق من نوع الصورة لتحديد طريقة العرض المناسبة
  const imageSource = typeof avatar === 'string' ? { uri: avatar } : avatar;

  return (
    <View className="mt-5 px-5 flex-row items-center justify-end">
      {/* Text */}
      <View className="flex-1 items-end mr-4">
        <Text className="text-[#8C8C96] text-[11px] font-semibold">
          مرحباً بك 👋
        </Text>

        <Text
          numberOfLines={1}
          className="text-[#171717] text-[18px] font-black mt-1 text-right"
        >
          {name}
        </Text>

        <Text className="text-[#55555F] text-[11px] font-medium mt-1 text-right">
          جاهز اليوم لتحقيق إنجاز جديد؟
        </Text>
      </View>

      {/* Avatar */}
      <View className="w-[78px] h-[78px] rounded-full bg-[#F1F1F1] items-center justify-center overflow-hidden">
        {avatar ? (
          <Image
            source={imageSource}
            className="w-[74px] h-[74px] rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-4xl">👨🏻‍💻</Text>
        )}
      </View>
    </View>
  );
}