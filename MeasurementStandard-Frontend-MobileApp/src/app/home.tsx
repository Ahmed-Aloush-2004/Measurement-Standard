


import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchProfile } from "../store/usersSlice";
import { fetchProgress } from "../store/userProgressSlice";
import { fetchExamTypes } from "../store/sectionsSlice";
// Import the notification fetch action
import { fetchNotifications } from "../store/notificationsSlice";

import HomeHeader from "../components/home/HomeHeader";
import GreetingSection from "../components/home/GreetingSection";
import ProgressCard from "../components/home/ProgressCard";
import CategoryGrid from "../components/home/CategoryGrid";
import HomeBottomBar from "../components/home/HomeBottomBar";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { profile } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: progress } = useSelector((state: RootState) => state.userProgress);
  const { examTypes } = useSelector((state: RootState) => state.sections);
  
  // Get notifications from Redux
  const { items: notifications } = useSelector((state: RootState) => state.notifications);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProfile());
      dispatch(fetchProgress());
      dispatch(fetchExamTypes());
      dispatch(fetchNotifications()); // Fetch notifications when screen comes into focus
    }, [dispatch])
  );

  const displayName = profile?.username ?? user?.username ?? "مستخدم";
  const overall = Number(progress?.overall_score ?? 0);
  const level = overall >= 75 ? "متقدم" : overall >= 50 ? "متوسط" : "مبتدئ";

  // Calculate how many notifications are unread
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#ffffff" }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <HomeHeader
        unreadCount={unreadCount} // Pass the count to the header
        onNotificationPress={() => {
          router.push("/notifications");
        }}
        onMenuPress={() => {
          router.push("/more");
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      >
        <GreetingSection 
          name={displayName}
          avatar={
            profile?.profile_picture
          }
        />

        <ProgressCard
          progress={overall}
          level={level}
          onDetailsPress={() => {
            router.push("/progress");
          }}
        />

        <CategoryGrid
          examTypes={examTypes || []}
          onExamPress={(examType) => {
            router.push({
              pathname: "/exam-type",
              params: {
                examTypeId: examType.id,
                title: examType.name,
              },
            });
          }}
          onProgressPress={() => {
            router.push("/progress");
          }}
        />
      </ScrollView>

      <HomeBottomBar
        activeTab="home"
        onNavigate={(route) => {
          router.push(route as any);
        }}
      />
    </SafeAreaView>
  );
}