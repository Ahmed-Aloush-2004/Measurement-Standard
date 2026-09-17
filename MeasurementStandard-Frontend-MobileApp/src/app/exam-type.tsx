// import React, {
//   useCallback,
//   useEffect,
// } from "react";

// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
// } from "react-native";

// import {
//   Stack,
//   useLocalSearchParams,
//   useRouter,
// } from "expo-router";

// import {
//   Feather,
// } from "@expo/vector-icons";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import {
//   AppDispatch,
//   RootState,
// } from "../store/store";

// import {
//   fetchExamTypes,
// } from "../store/sectionsSlice";

// import ScreenHeader from "../components/ScreenHeader";

// import {
//   LoadingView,
//   EmptyState,
//   ErrorState,
// } from "../components/StateViews";

// export default function ExamTypeScreen() {
//   const router = useRouter();

//   const dispatch =
//     useDispatch<AppDispatch>();

//   const params =
//     useLocalSearchParams<{
//       examTypeId?: string;
//       title?: string;
//     }>();

//   const {
//     examTypes,
//     isLoading,
//     error,
//   } = useSelector(
//     (state: RootState) =>
//       state.sections,
//   );

//   const load = useCallback(() => {
//     dispatch(fetchExamTypes());
//   }, [dispatch]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const examType =
//     examTypes.find(
//       (item) =>
//         item.id ===
//         params.examTypeId,
//     );

//   const sections =
//     examType?.sections ?? [];

//   return (
//     <View className="flex-1 bg-[#F8FAFC]">
//       <Stack.Screen
//         options={{
//           headerShown: false,
//         }}
//       />

//       <ScreenHeader
//         title={
//           examType?.name ??
//           params.title ??
//           "الاختبار"
//         }
//         subtitle="اختر القسم الذي تريد التدرب عليه"
//       />

//       {isLoading ? (
//         <LoadingView />
//       ) : error ? (
//         <ErrorState
//           message={error}
//           onRetry={load}
//         />
//       ) : sections.length === 0 ? (
//         <EmptyState
//           icon="book-open"
//           title="لا توجد أقسام"
//           subtitle="لا توجد أقسام متاحة لهذا الاختبار حالياً"
//         />
//       ) : (
//         <FlatList
//           data={sections}
//           keyExtractor={(item) =>
//             item.id
//           }
//           contentContainerStyle={{
//             padding: 20,
//           }}
//           renderItem={({
//             item,
//           }) => {
//             const questionCount = item.questions?.length ?? 0;

//             return (
//               <TouchableOpacity
//                 activeOpacity={0.85}
//                 className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
//                 onPress={() => {
//                   router.push({
//                     pathname:
//                       "/quiz",
//                     params: {
//                       examTypeId:
//                         examType?.id ??
//                         params.examTypeId ??
//                         "",
//                       sectionId:
//                         item.id,
//                       title:
//                         item.name,
//                     },
//                   });
//                 }}
//               >
//                 <View className="flex-row items-center justify-between">
//                   <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
//                     <Feather
//                       name="book-open"
//                       size={18}
//                       color="#7641D8"
//                     />
//                   </View>

//                   <View className="flex-1 mr-3">
//                     <Text
//                       className="text-[#2B2D5C] font-extrabold text-sm"
//                       style={{
//                         textAlign:
//                           "right",
//                       }}
//                     >
//                       {item.name}
//                     </Text>

//                     <Text
//                       className="text-[#94A3B8] text-xs font-semibold mt-1"
//                       style={{
//                         textAlign:
//                           "right",
//                       }}
//                     >
//                       {questionCount} سؤال متاح
//                     </Text>
//                   </View>

//                   <Feather
//                     name="chevron-left"
//                     size={18}
//                     color="#CBD5E1"
//                   />
//                 </View>
//               </TouchableOpacity>
//             );
//           }}
//         />
//       )}
//     </View>
//   );
// }





import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store/store";
import { fetchExamTypes } from "../store/sectionsSlice";
import ScreenHeader from "../components/ScreenHeader";
import { LoadingView, EmptyState, ErrorState } from "../components/StateViews";

export default function ExamTypeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const params = useLocalSearchParams<{
    examTypeId?: string;
    title?: string;
  }>();

  const { examTypes, isLoading, error } = useSelector(
    (state: RootState) => state.sections
  );

  const load = useCallback(() => {
    dispatch(fetchExamTypes());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const examType = examTypes.find((item) => item.id === params.examTypeId);
  const sections = examType?.sections ?? [];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScreenHeader
        title={examType?.name ?? params.title ?? "الاختبار"}
        subtitle="اختر القسم الذي تريد التدرب عليه"
      />

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="book-open"
          title="لا توجد أقسام"
          subtitle="لا توجد أقسام متاحة لهذا الاختبار حالياً"
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 20,
          }}
          renderItem={({ item }) => {
            // Check for backend count variable, fallback to length, otherwise undefined
            const count =
              (item as any).questionCount ??
              (item as any)._count?.questions ??
              item.questions?.length;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                onPress={() => {
                  router.push({
                    pathname: "/quiz",
                    params: {
                      examTypeId: examType?.id ?? params.examTypeId ?? "",
                      sectionId: item.id,
                      title: item.name,
                    },
                  });
                }}
              >
                {/* Changed to flex-row-reverse for correct RTL alignment */}
                <View className="flex-row-reverse items-center justify-between">
                  <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                    <Feather name="book-open" size={18} color="#7641D8" />
                  </View>

                  <View className="flex-1 mr-3 ml-3">
                    <Text
                      className="text-[#2B2D5C] font-extrabold text-sm"
                      style={{ textAlign: "right" }}
                    >
                      {item.name}
                    </Text>

                    <Text
                      className="text-[#94A3B8] text-xs font-semibold mt-1"
                      style={{ textAlign: "right" }}
                    >
                      {count && count > 0
                        ? `${count} سؤال متاح`
                        : "أسئلة متاحة للتدرب"}
                    </Text>
                  </View>

                  <Feather name="chevron-left" size={18} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}