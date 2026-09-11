
// src/app/index.tsx
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import FeatureItem from "../components/FeatureItem";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* تأثير النقاط في الزاوية */}
      <View className="absolute top-0 left-0 opacity-10 z-0 mt-2.5 ml-2.5">
        <MaterialCommunityIcons name="dots-grid" size={100}  color="#2B2D5C" />
      </View>

      {/* استخدام ScrollView يضمن عدم انقطاع المحتوى في الشاشات الصغيرة */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* الحاوية الرئيسية للمحتوى (تتوسط الشاشة بمرونة) */}
        <View className="flex-1 justify-center items-center px-6 pt-12 pb-4 z-10 w-full">
          
          {/* منطقة الشعار (متجاوبة) */}
          <View className="items-center mb-6 w-full">
            <Image 
              source={require('@/assets/images/logo.png')} 
              // تحديد عرض مرن (3 أرباع الشاشة كحد أقصى) وارتفاع يتقلص حسب الشاشة
              className="w-3/4 max-w-[280px] h-48 mb-4" 
              resizeMode="contain" // يمنع الصورة من التشوه أو الانفجار خارج الحاوية
            />

            {/* اسم التطبيق */}
            <View className="flex-row items-center justify-center">
              <Text className="text-3xl sm:text-4xl font-extrabold text-[#25B7A9]">
                +
              </Text>
              <Text className="text-3xl sm:text-4xl font-extrabold text-[#2B2D5C] tracking-wide">
                معيار قياس
              </Text>
            </View>

            {/* الشعار اللفظي */}
            <Text className="text-[#64748B] text-sm sm:text-base font-bold mt-2 text-center">
              تدرّب بذكاء... وحقق معيارك
            </Text>
          </View>

          {/* منطقة المميزات (توزيع متساوٍ بفضل flex-row و flex-1) */}
          <View className="flex-row justify-between w-full my-8">
            <FeatureItem
              title="تفوق بثقة"
              icon={<Ionicons name="trophy-outline" size={32} color="#2B2D5C" />}
            />
            <FeatureItem
              title="تقارير دقيقة"
              icon={<Ionicons name="bar-chart-outline" size={32} color="#2B2D5C" />}
            />
            <FeatureItem
              title="تدريب ذكي"
              icon={<Feather name="target" size={32} color="#2B2D5C" />}
            />
          </View>

          {/* زر البداية */}
          <View className="w-full mb-6">
            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="w-full bg-[#2B2D5C] rounded-full py-4 items-center justify-center shadow-lg shadow-indigo-900/20 active:opacity-80"
            >
              <Text className="text-white font-bold text-lg">
                ابدأ رحلتك الآن
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* الرسم التوضيحي في الأسفل (متجاوب ويدفع نفسه للأسفل دائماً) */}
        <View className="w-full h-40 sm:h-52 mt-10 justify-end">
          <Image 
            source={require('@/assets/images/bottom-illustration.png')} 
            className="w-full h-full"
            resizeMode="contain" 
          />
          {/* خلفية جمالية متموجة خفيفة تدمج الصورة مع القاع */}
          <View className="absolute bottom-0 w-full h-1/2 bg-[#EEF2F6] -z-10 rounded-t-[100px]" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}