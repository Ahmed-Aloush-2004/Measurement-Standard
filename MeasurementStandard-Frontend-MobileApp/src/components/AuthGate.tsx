// src/components/AuthGate.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator, Image } from "react-native";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { bootstrapAuth } from "../store/authSlice";
import { Colors } from "../theme/colors";

// المسارات المتاحة بدون تسجيل دخول
const PUBLIC_ROUTES = ["", "login"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const segments = useSegments();
  const navigationReady = useRootNavigationState();
  const { accessToken, isBootstrapping, hasBootstrapped } = useSelector(
    (state: RootState) => state.auth,
  );

  // عند فتح التطبيق: استرجاع التوكن المحفوظ (إن وجد) وبيانات المستخدم
  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // توجيه المستخدم تلقائياً حسب حالة تسجيل الدخول وبعد اكتمال الاسترجاع
  useEffect(() => {
    if (!navigationReady || !hasBootstrapped) return;

    const firstSegment = segments[0] || "";
    const isPublic = PUBLIC_ROUTES.includes(firstSegment);

    if (!accessToken && !isPublic) {
      router.replace("/");
    } else if (accessToken && isPublic) {
      router.replace("/home");
    }
  }, [accessToken, hasBootstrapped, segments, router, navigationReady]);

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 96, height: 96, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  return <>{children}</>;
}