
// import React, { useEffect } from "react";
// import {
//   ScrollView,
// } from "react-native";

// import { Stack, useRouter } from "expo-router";
// import {
//   SafeAreaView,
// } from "react-native-safe-area-context";

// import { useDispatch, useSelector } from "react-redux";

// import { AppDispatch, RootState } from "../store/store";
// import { fetchProfile } from "../store/usersSlice";

// import HomeHeader from "../components/home/HomeHeader";
// import GreetingSection from "../components/home/GreetingSection";
// import ProgressCard from "../components/home/ProgressCard";
// import CategoryGrid from "../components/home/CategoryGrid";
// import HomeBottomBar from "../components/home/HomeBottomBar";

// export default function HomeScreen() {
//   const router = useRouter();

//   const dispatch = useDispatch<AppDispatch>();

//   const { profile } = useSelector(
//     (state: RootState) => state.users
//   );

//   const { user } = useSelector(
//     (state: RootState) => state.auth
//   );

//   useEffect(() => {
//     dispatch(fetchProfile());
//   }, [dispatch]);

//   const displayName =
//     profile?.username ||
//     user?.username ||
//     "مستخدم";

//   return (
//     <SafeAreaView
//       edges={["top", "left", "right", "bottom"]}
//       className="flex-1 bg-white"
//     >
//       <Stack.Screen
//         options={{
//           headerShown: false,
//         }}
//       />

//       {/* Header */}
//       <HomeHeader
//         onNotificationPress={() => {
//           router.push("/notifications");
//         }}
//         onMenuPress={() => {
//           router.push("/more");
//         }}
//       />

//       {/* Content */}
//       <ScrollView
//         className="flex-1 bg-white"
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{
//           paddingBottom: 20,
//         }}
//       >
//         {/* Greeting */}
//         <GreetingSection
//           name={displayName}
//           // Replace with your real image:
//           // avatar={require("../assets/images/avatar.png")}
//           avatar={profile?.profile_picture || require("@/assets/images/avatar.png")}
          
//         />

//         {/* Progress */}
//         <ProgressCard
//           progress={62}
//           level="متوسط"
//           onDetailsPress={() => {
//             router.push("/progress");
//           }}
//         />

//         {/* Categories */}
//         <CategoryGrid
//           onVerbalPress={() => {
//             router.push("/verbal");
//           }}
//           onQuantitativePress={() => {
//             router.push("/quantitative");
//           }}
//           onAchievementPress={() => {
//             router.push("/achievement");
//           }}
//           onStepPress={() => {
//             router.push("/step");
//           }}
//           onTestsPress={() => {
//             router.push("/tests");
//           }}
//           onProgressPress={() => {
//             router.push("/progress");
//           }}
//         />
//       </ScrollView>

//       {/* Bottom Navigation */}
//       <HomeBottomBar
//         activeTab="home"
//         onNavigate={(route) => {
//           router.push(route as any);
//         }}
//       />
//     </SafeAreaView>
//   );
// }





import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchProfile } from "../store/usersSlice";
import { fetchProgress } from "../store/userProgressSlice";

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

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProfile());
      dispatch(fetchProgress());
    }, [dispatch]),
  );

  const displayName = profile?.username || user?.username || "مستخدم";

  const overall = Number(progress?.overall_score ?? 0);
  const level =
    overall >= 75 ? "متقدم" : overall >= 50 ? "متوسط" : "مبتدئ";

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-white"
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <HomeHeader
        onNotificationPress={() => {
          router.push("/notifications");
        }}
        onMenuPress={() => {
          router.push("/more");
        }}
      />

      {/* Content */}
      <ScrollView
        className="flex-1 bg-white"
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      >
        {/* Greeting */}
        <GreetingSection
          name={displayName}
          avatar={profile?.profile_picture || require("@/assets/images/avatar.png")}
        />

        {/* Progress */}
        <ProgressCard
          progress={overall}
          level={level}
          onDetailsPress={() => {
            router.push("/progress");
          }}
        />

        {/* Categories */}
        <CategoryGrid
          onVerbalPress={() => {
            router.push("/verbal");
          }}
          onQuantitativePress={() => {
            router.push("/quantitative");
          }}
          onAchievementPress={() => {
            router.push("/achievement");
          }}
          onStepPress={() => {
            router.push("/step");
          }}
          onTestsPress={() => {
            router.push("/tests");
          }}
          onProgressPress={() => {
            router.push("/progress");
          }}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <HomeBottomBar
        activeTab="home"
        onNavigate={(route) => {
          router.push(route as any);
        }}
      />
    </SafeAreaView>
  );
}