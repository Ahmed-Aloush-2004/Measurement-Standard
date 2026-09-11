// src/components/GoogleAuthButton.tsx

import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export default function GoogleAuthButton({ onPress, disabled }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center justify-center bg-white border border-gray-200 rounded-2xl py-3.5 mb-6 active:opacity-70"
    >
      <Image 
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
        className="w-5 h-5 mr-3" 
      />
      <Text className="text-[#2F2C5A] font-extrabold text-base">
     Google   تسجيل الدخول باستخدام 
      </Text>
    </TouchableOpacity>
  );
}