// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// استبدل هذا بعنوان IP الخاص بجهازك في الشبكة المحلية (مثل: 192.168.1.x)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  // منع تعليق الطلبات لفترة طويلة (إظهار الخطأ بعد 20 ثانية كحد أقصى)
  timeout: 20000,
});

// اعتراض الطلبات: حقن التوكن تلقائياً وضبط Content-Type بشكل صحيح
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const data = config.data as any;
  const isFormData =
    typeof FormData !== 'undefined' &&
    (data instanceof FormData || Array.isArray(data?._parts));

  if (isFormData) {
    // مهم جداً: عند إرسال FormData لا نضبط Content-Type يدوياً
    // حتى يضيف React Native الـ boundary تلقائياً والعكس يسبب تعليق الطلب
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// دالة مساعدة لاستخراج رسالة خطأ واضحة من أي استجابة فاشلة
export function getErrorMessage(error: any, fallback = 'حدث خطأ غير متوقع') {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) {
    return typeof serverMessage === 'string' ? serverMessage : fallback;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'انتهت مهلة الاتصال بالخادم، حاول مرة أخرى';
  }
  if (error?.message === 'Network Error') {
    return 'تعذر الاتصال بالخادم، تأكد من أنك متصل بالشبكة';
  }

  return fallback;
}