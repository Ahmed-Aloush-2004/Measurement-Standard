// src/app/profile/edit.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../store/store";
import {
  fetchProfile,
  updateProfileImage,
  deleteProfileImage,
} from "../../store/usersSlice";
import Avatar from "../../components/Avatar";
import ScreenHeader from "../../components/ScreenHeader";

export default function EditProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isUpdatingImage } = useSelector(
    (state: RootState) => state.users,
  );

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("الإذن مطلوب", "يرجى السماح بالوصول للصور لاختيار صورة شخصية");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      dispatch(
        updateProfileImage({
          uri: asset.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        }),
      );
    }
  };

  const removeImage = () => {
    Alert.alert("حذف الصورة", "هل تريد حذف الصورة الشخصية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => dispatch(deleteProfileImage()),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="تعديل الملف الشخصي" />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* الصورة الشخصية */}
        <View className="items-center pt-2 mb-8">
          <View className="w-[120px] h-[120px]">
            <Avatar uri={profile?.profile_picture} name={profile?.username} size={120} />
            {isUpdatingImage && (
              <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-full">
                <ActivityIndicator color="white" />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={pickImage}
            disabled={isUpdatingImage}
            className="flex-row items-center bg-[#2B2D5C] px-6 py-3 rounded-full mt-5"
          >
            <Feather name="camera" size={16} color="white" />
            <Text className="text-white font-bold text-sm mr-2">تغيير الصورة</Text>
          </TouchableOpacity>

          {profile?.profile_picture ? (
            <TouchableOpacity onPress={removeImage} className="mt-3">
              <Text className="text-rose-500 font-bold text-sm">
                حذف الصورة الحالية
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* بيانات الحساب */}
        <View className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-[#2B2D5C] font-extrabold text-sm ml-3">
              {profile?.username}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[#94A3B8] text-xs font-bold ml-2">الاسم</Text>
              <Feather name="user" size={14} color="#CBD5E1" />
            </View>
          </View>

          <View className="flex-row items-center justify-between px-5 py-4">
            <Text
              className="text-[#2B2D5C] font-extrabold text-sm ml-3"
              style={{ textAlign: "left", direction: "ltr" }}
            >
              {profile?.email}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[#94A3B8] text-xs font-bold ml-2">
                البريد الإلكتروني
              </Text>
              <Feather name="mail" size={14} color="#CBD5E1" />
            </View>
          </View>
        </View>

        <Text className="text-[#94A3B8] text-xs font-semibold text-center mt-4 leading-5">
          لتعديل الاسم أو البريد الإلكتروني تواصل مع الدعم الفني حالياً
        </Text>
      </ScrollView>
    </View>
  );
}