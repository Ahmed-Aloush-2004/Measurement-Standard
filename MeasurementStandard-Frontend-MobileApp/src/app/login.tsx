// // src/app/login.tsx
// import React, { useState, useEffect } from "react";
// import { 
//   View, Text, TouchableOpacity, KeyboardAvoidingView, 
//   Platform, ScrollView, TouchableWithoutFeedback, Keyboard 
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter, Stack } from "expo-router";
// import { Feather } from "@expo/vector-icons";
// import Checkbox from "expo-checkbox";
// import * as Google from "expo-auth-session/providers/google";

// import CustomInput from "../components/CustomInput";
// import GoogleAuthButton from "../components/GoogleAuthButton";

// export default function AuthScreen() {
//   const router = useRouter();
  
//   // حالة للتبديل بين "تسجيل دخول" (login) و "إنشاء حساب" (register)
//   const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
//   const [rememberMe, setRememberMe] = useState(false);

//   // إعدادات مصادقة Google (استبدل القيم بمعرفاتك من Google Cloud Console)
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
//     iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
//     androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
//   });

//   // معالجة نتيجة تسجيل الدخول بجوجل
//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
//       // هنا تقوم بإرسال authentication.accessToken إلى الباك إند (NestJS)
//       console.log('Google Auth Token:', authentication?.accessToken);
//       // router.replace('/home');
//     }
//   }, [response]);

//   const handleSubmit = () => {
//     // منطق إرسال البيانات للباك إند بناءً على authMode
//     console.log(`تم طلب: ${authMode}`);
//     // محاكاة تسجيل الدخول الناجح
//     // router.replace("/home"); 
//   };

//   return (
//     <KeyboardAvoidingView 
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       className="flex-1 bg-[#232255]"
//     >
//       <Stack.Screen options={{ headerShown: false }} />
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View className="flex-1">
          
//           {/* 1. الهيدر العلوي (الأزرق الداكن) */}
//           <SafeAreaView edges={['top']} className="px-6 pt-4 pb-8">
//             <TouchableOpacity onPress={() => router.back()} className="mb-4 self-end">
//               <Feather name="arrow-right" size={24} color="white" />
//             </TouchableOpacity>
            
//             <View className="items-center mt-2">
//               <Text className="text-white text-lg font-bold mb-1">مرحباً بك في</Text>
//               <View className="flex-row items-center justify-center mb-2">
//                 <Text className="text-4xl font-black text-white tracking-wide">معيار قياس</Text>
//                 <Text className="text-4xl font-black text-[#1CB5A3]">+</Text>
//               </View>
//               <Text className="text-indigo-200 text-sm font-semibold">سجّل للدخول للمتابعة</Text>
//             </View>
//           </SafeAreaView>

//           {/* 2. البطاقة البيضاء المنحنية (المحتوى الرئيسي) */}
//           <ScrollView 
//             className="flex-1 bg-white rounded-t-[40px] px-6 pt-8"
//             showsVerticalScrollIndicator={false}
//             bounces={false}
//           >
//             {/* التبديل بين الدخول والتسجيل (Toggle) */}
//             <View className="flex-row bg-gray-100 rounded-2xl p-1 mb-8">
//               <TouchableOpacity 
//                 onPress={() => setAuthMode('register')}
//                 className={`flex-1 items-center justify-center py-3 rounded-xl ${authMode === 'register' ? 'bg-[#232255] shadow-sm' : ''}`}
//               >
//                 <Text className={`font-bold ${authMode === 'register' ? 'text-white' : 'text-gray-500'}`}>
//                   إنشاء حساب
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 onPress={() => setAuthMode('login')}
//                 className={`flex-1 items-center justify-center py-3 rounded-xl ${authMode === 'login' ? 'bg-[#232255] shadow-sm' : ''}`}
//               >
//                 <Text className={`font-bold ${authMode === 'login' ? 'text-white' : 'text-gray-500'}`}>
//                   تسجيل دخول
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* حقول الإدخال */}
//             {authMode === 'register' && (
//               <CustomInput 
//                 iconName="user" 
//                 placeholder="الاسم الكامل" 
//                 autoCapitalize="words"
//               />
//             )}
            
//             <CustomInput 
//               iconName="mail" 
//               placeholder="البريد الإلكتروني أو رقم الجوال" 
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />
            
//             <CustomInput 
//               iconName="lock" 
//               placeholder="كلمة المرور" 
//               isPassword 
//             />

//             {/* خيارات تذكرني ونسيان كلمة المرور (تظهر فقط في تسجيل الدخول) */}
//             {authMode === 'login' && (
//               <View className="flex-row justify-between items-center mb-8 px-1">
//                 <View className="flex-row-reverse items-center">
//                   <Checkbox 
//                     value={rememberMe} 
//                     onValueChange={setRememberMe}
//                     color={rememberMe ? '#232255' : undefined}
//                     className="w-5 h-5 rounded"
//                   />
//                   <Text className="text-gray-600 font-bold ml-2 text-sm">تذكرني</Text>
//                 </View>
//                 <TouchableOpacity>
//                   <Text className="text-blue-600 font-bold text-sm">نسيت كلمة المرور؟</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* زر الإرسال الرئيسي */}
//             <TouchableOpacity 
//               onPress={handleSubmit}
//               className={`w-full bg-[#232255] rounded-2xl py-4 items-center justify-center shadow-lg active:opacity-85 ${authMode === 'register' ? 'mt-4' : ''}`}
//             >
//               <Text className="text-white font-black text-base tracking-wide">
//                 {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
//               </Text>
//             </TouchableOpacity>

//             {/* الخط الفاصل "أو" */}
//             <View className="flex-row items-center my-6">
//               <View className="flex-1 h-[1px] bg-gray-200" />
//               <Text className="mx-4 text-gray-400 font-bold text-sm">أو</Text>
//               <View className="flex-1 h-[1px] bg-gray-200" />
//             </View>

//             {/* زر جوجل */}
//             <GoogleAuthButton 
//               onPress={() => promptAsync()} 
//               disabled={!request}
//             />

//             {/* الشروط والأحكام */}
//             <Text className="text-center text-gray-400 text-xs font-semibold mt-4 mb-10 leading-5">
//               بالدخول أنت توافق على <Text className="text-blue-500 font-bold">الشروط والأحكام وسياسة الخصوصية</Text>
//             </Text>
            
//           </ScrollView>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }





// src/app/login.tsx
import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import * as Google from "expo-auth-session/providers/google";
import { useDispatch, useSelector } from "react-redux";

import CustomInput from "../components/CustomInput";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { loginUser, registerUser, googleLoginMobile } from "../store/authSlice";
import { AppDispatch, RootState } from "../store/store";

export default function AuthScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // قم بإلغاء التعليق إذا كنت تختبر على آيفون
    responseType: 'id_token', // ضروري للباك إند
  });

  // مراقبة نجاح تسجيل الدخول للتحويل للصفحة الرئيسية
  // (يتم التحويل تلقائياً عبر AuthGate عند توفر التوكن)

  // إظهار تنبيه في حال وجود خطأ من الباك إند
  useEffect(() => {
    if (error) Alert.alert("تنبيه", error);
  }, [error]);

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      // إرسال التوكن للباك إند للتحقق منه
      dispatch(googleLoginMobile(response.authentication.accessToken));
    }
  }, [response, dispatch]);

  const handleSubmit = () => {
    if (!email || !password || (authMode === 'register' && !fullName)) {
      Alert.alert("تنبيه", "يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (authMode === 'login') {
      dispatch(loginUser({ email, password }));
    } else {
      dispatch(registerUser({ username: fullName, email, password }));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#232255]"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          
          <SafeAreaView edges={['top']} className="px-6 pt-4 pb-8">
            <TouchableOpacity onPress={() => router.back()} className="mb-4 self-end">
              <Feather name="arrow-right" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="items-center mt-2">
              <Text className="text-white text-lg font-bold mb-1">مرحباً بك في</Text>
              <View className="flex-row items-center justify-center mb-2">
                <Text className="text-4xl font-black text-white tracking-wide">معيار قياس</Text>
                <Text className="text-4xl font-black text-[#1CB5A3]">+</Text>
              </View>
              <Text className="text-indigo-200 text-sm font-semibold">سجّل للدخول للمتابعة</Text>
            </View>
          </SafeAreaView>

          <ScrollView 
            className="flex-1 bg-white rounded-t-[40px] px-6 pt-8"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View className="flex-row bg-gray-100 rounded-2xl p-1 mb-8">
              <TouchableOpacity 
                onPress={() => setAuthMode('register')}
                className={`flex-1 items-center justify-center py-3 rounded-xl ${authMode === 'register' ? 'bg-[#232255] shadow-sm' : ''}`}
              >
                <Text className={`font-bold ${authMode === 'register' ? 'text-white' : 'text-gray-500'}`}>إنشاء حساب</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setAuthMode('login')}
                className={`flex-1 items-center justify-center py-3 rounded-xl ${authMode === 'login' ? 'bg-[#232255] shadow-sm' : ''}`}
              >
                <Text className={`font-bold ${authMode === 'login' ? 'text-white' : 'text-gray-500'}`}>تسجيل دخول</Text>
              </TouchableOpacity>
            </View>

            {authMode === 'register' && (
              <CustomInput 
                iconName="user" 
                placeholder="الاسم الكامل" 
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            )}
            
            <CustomInput 
              iconName="mail" 
              placeholder="البريد الإلكتروني" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            
            <CustomInput 
              iconName="lock" 
              placeholder="كلمة المرور" 
              isPassword 
              value={password}
              onChangeText={setPassword}
            />

            {authMode === 'login' && (
              <View className="flex-row justify-between items-center mb-8 px-1">
                <View className="flex-row-reverse items-center">
                  <Checkbox 
                    value={rememberMe} 
                    onValueChange={setRememberMe}
                    color={rememberMe ? '#232255' : undefined}
                    className="w-5 h-5 rounded"
                  />
                  <Text className="text-gray-600 font-bold ml-2 text-sm">تذكرني</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-bold text-sm">نسيت كلمة المرور؟</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-[#232255] rounded-2xl py-4 items-center justify-center shadow-lg active:opacity-85 ${authMode === 'register' ? 'mt-4' : ''}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-base tracking-wide">
                  {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-400 font-bold text-sm">أو</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <GoogleAuthButton 
              onPress={() => promptAsync()} 
              disabled={!request || isLoading}
            />

            <Text className="text-center text-gray-400 text-xs font-semibold mt-4 mb-10 leading-5">
              بالدخول أنت توافق على <Text className="text-blue-500 font-bold">الشروط والأحكام وسياسة الخصوصية</Text>
            </Text>
            
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}