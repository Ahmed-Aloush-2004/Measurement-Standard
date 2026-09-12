
// src/app/profile/edit.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
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
  verifyCurrentPassword,
  changeUserPassword,
  updateUserProfile,
} from "../../store/usersSlice";
import Avatar from "../../components/Avatar";
import ScreenHeader from "../../components/ScreenHeader";

export default function EditProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { profile, isUpdatingImage } = useSelector(
    (state: RootState) => state.users
  );

  // --------------------------------------------------
  // Refs
  // --------------------------------------------------

  const scrollViewRef = useRef<ScrollView>(null);

  const currentPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // --------------------------------------------------
  // Keyboard State
  // --------------------------------------------------

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // --------------------------------------------------
  // Username Edit States
  // --------------------------------------------------

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // --------------------------------------------------
  // Password Change States
  // --------------------------------------------------

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // --------------------------------------------------
  // Fetch Profile
  // --------------------------------------------------

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // --------------------------------------------------
  // Keyboard Handling
  // --------------------------------------------------

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios"
        ? "keyboardWillShow"
        : "keyboardDidShow";

    const keyboardHideEvent =
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide";

    const keyboardShowListener = Keyboard.addListener(
      keyboardShowEvent,
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardHideListener = Keyboard.addListener(
      keyboardHideEvent,
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // --------------------------------------------------
  // Image
  // --------------------------------------------------

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "الإذن مطلوب",
        "يرجى السماح بالوصول للصور لاختيار صورة شخصية"
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

    if (
      !result.canceled &&
      result.assets?.[0]
    ) {
      const asset = result.assets[0];

      const uriParts = asset.uri.split(".");
      const fileType =
        uriParts[uriParts.length - 1];

      dispatch(
        updateProfileImage({
          uri: asset.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        })
      );
    }
  };

  const removeImage = () => {
    Alert.alert(
      "حذف الصورة",
      "هل تريد بالتأكيد حذف صورتك الشخصية؟",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف",
          style: "destructive",
          onPress: () =>
            dispatch(deleteProfileImage()),
        },
      ]
    );
  };

  // --------------------------------------------------
  // Update Username
  // --------------------------------------------------

  const handleUpdateName = async () => {
    if (
      !editNameValue.trim() ||
      editNameValue.length < 3
    ) {
      Alert.alert(
        "خطأ",
        "الاسم يجب أن يكون 3 أحرف على الأقل"
      );

      return;
    }

    setIsUpdatingName(true);

    try {
      const res = await dispatch(
        updateUserProfile({
          username: editNameValue,
        })
      ).unwrap();

      Alert.alert(
        "نجاح",
        res.message ||
          "تم تحديث الملف الشخصي بنجاح"
      );

      setIsEditingName(false);

      Keyboard.dismiss();

      dispatch(fetchProfile());
    } catch (err: any) {
      Alert.alert(
        "خطأ",
        err || "فشل تحديث الاسم"
      );
    } finally {
      setIsUpdatingName(false);
    }
  };

  // --------------------------------------------------
  // Verify Current Password
  // --------------------------------------------------

  const handleVerifyPassword = async () => {
    if (!currentPassword.trim()) {
      setPasswordError(
        "يرجى إدخال كلمة المرور الحالية"
      );

      return;
    }

    setIsVerifying(true);
    setPasswordError("");

    try {
      await dispatch(
        verifyCurrentPassword({
          password: currentPassword,
        })
      ).unwrap();

      setIsPasswordVerified(true);

      Keyboard.dismiss();
    } catch (err: any) {
      setPasswordError(
        err || "كلمة المرور غير صحيحة"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // --------------------------------------------------
  // Change Password
  // --------------------------------------------------

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError(
        "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "كلمات المرور الجديدة غير متطابقة"
      );

      return;
    }

    setIsChanging(true);
    setPasswordError("");

    try {
      await dispatch(
        changeUserPassword({
          currentPassword,
          newPassword,
        })
      ).unwrap();

      Keyboard.dismiss();

      Alert.alert(
        "نجاح",
        "تم تغيير كلمة المرور بنجاح"
      );

      setIsPasswordVerified(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err ||
          "حدث خطأ أثناء تغيير كلمة المرور"
      );
    } finally {
      setIsChanging(false);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
      }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScreenHeader title="تعديل الملف الشخصي" />

      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          padding: 24,

          /*
           * Normal screen:
           * small bottom padding.
           *
           * Keyboard opened:
           * large bottom padding so the user can
           * scroll the focused password input above
           * the keyboard.
           */
          paddingBottom: keyboardVisible
            ? 350
            : 24,

          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* Profile Image Section */}
        {/* ================================================= */}

        <View className="items-center pt-2 mb-8">
          <View className="w-[120px] h-[120px]">
            <Avatar
              uri={profile?.profile_picture}
              name={profile?.username}
              size={120}
            />

            {isUpdatingImage && (
              <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-full">
                <ActivityIndicator color="white" />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={pickImage}
            disabled={isUpdatingImage}
            className="flex-row items-center bg-[#2B2D5C] px-6 py-3 rounded-full mt-5 shadow-sm"
          >
            <Feather
              name="camera"
              size={16}
              color="white"
            />

            <Text className="text-white font-bold text-sm mr-2">
              تغيير الصورة
            </Text>
          </TouchableOpacity>

          {profile?.profile_picture ? (
            <TouchableOpacity
              onPress={removeImage}
              className="mt-4 flex-row items-center bg-rose-50 px-4 py-2 rounded-full border border-rose-100"
            >
              <Feather
                name="trash-2"
                size={16}
                color="#F43F5E"
              />

              <Text className="text-rose-500 font-bold text-sm ml-2">
                حذف الصورة الحالية
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ================================================= */}
        {/* Account Info Section */}
        {/* ================================================= */}

        <View className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">

          {/* USERNAME */}

          {isEditingName ? (
            <View className="flex-row items-center justify-between px-5 py-2 border-b border-gray-50">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={handleUpdateName}
                  disabled={isUpdatingName}
                  className="bg-emerald-500 p-2 rounded-full mr-2"
                >
                  {isUpdatingName ? (
                    <ActivityIndicator
                      size="small"
                      color="white"
                    />
                  ) : (
                    <Feather
                      name="check"
                      size={16}
                      color="white"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsEditingName(false);
                    Keyboard.dismiss();
                  }}
                  disabled={isUpdatingName}
                  className="bg-rose-500 p-2 rounded-full"
                >
                  <Feather
                    name="x"
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={{
                  flex: 1,
                  textAlign: "right",
                  color: "#2B2D5C",
                  fontWeight: "600",
                  fontSize: 14,
                  marginRight: 12,
                }}
                value={editNameValue}
                onChangeText={setEditNameValue}
                placeholder="أدخل الاسم الجديد"
                autoFocus
              />

              <View className="flex-row items-center shrink-0">
                <Text className="text-[#94A3B8] text-xs font-bold ml-2">
                  الاسم
                </Text>

                <Feather
                  name="user"
                  size={14}
                  color="#CBD5E1"
                />
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-50">
              <TouchableOpacity
                onPress={() => {
                  setEditNameValue(
                    profile?.username || ""
                  );

                  setIsEditingName(true);
                }}
              >
                <Feather
                  name="edit-2"
                  size={16}
                  color="#2B2D5C"
                />
              </TouchableOpacity>

              <Text className="text-[#2B2D5C] font-extrabold text-sm ml-3 flex-1 text-right mr-3">
                {profile?.username}
              </Text>

              <View className="flex-row items-center shrink-0">
                <Text className="text-[#94A3B8] text-xs font-bold ml-2">
                  الاسم
                </Text>

                <Feather
                  name="user"
                  size={14}
                  color="#CBD5E1"
                />
              </View>
            </View>
          )}

          {/* EMAIL */}

          <View className="flex-row items-center justify-between px-5 py-4">
            <Text
              className="flex-1 text-[#2B2D5C] font-extrabold text-sm mr-3"
              style={{
                textAlign: "left",
                direction: "ltr",
              }}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {profile?.email}
            </Text>

            <View className="flex-row items-center shrink-0">
              <Text className="text-[#94A3B8] text-xs font-bold ml-2">
                البريد الإلكتروني
              </Text>

              <Feather
                name="mail"
                size={14}
                color="#CBD5E1"
              />
            </View>
          </View>
        </View>

        {/* Support text */}

        <Text className="text-[#94A3B8] text-xs font-medium text-center mb-8">
          لتعديل البريد الإلكتروني تواصل مع الدعم الفني حالياً
        </Text>

        {/* ================================================= */}
        {/* Security / Password Section */}
        {/* ================================================= */}

        <View className="w-full bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">

          {/* Header */}

          <View className="flex-row items-center justify-end mb-4">
            <Text className="text-[#2B2D5C] font-extrabold text-base mr-2">
              تغيير كلمةالمرور
            </Text>

            <Feather
              name="lock"
              size={18}
              color="#2B2D5C"
            />
          </View>

          {/* Error */}

          {passwordError ? (
            <View className="bg-rose-50 p-3 rounded-lg mb-4">
              <Text className="text-rose-600 text-xs font-bold text-right">
                {passwordError}
              </Text>
            </View>
          ) : null}

          {/* ================================================= */}
          {/* STEP 1 */}
          {/* ================================================= */}

          {!isPasswordVerified ? (
            <View>

              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">

                {/* Eye */}

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={isVerifying}
                  className="p-1"
                >
                  <Feather
                    name={
                      showPassword
                        ? "eye-off"
                        : "eye"
                    }
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                {/* Current Password */}

                <TextInput
                  ref={currentPasswordRef}
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: "#2B2D5C",
                    fontWeight: "600",
                    fontSize: 14,
                    marginLeft: 12,
                    minHeight: 24,
                  }}
                  placeholder="أدخل كلمة المرور الحالية"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={currentPassword}
                  editable={!isVerifying}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    setPasswordError("");
                  }}
                  onFocus={() => {
                    setKeyboardVisible(true);
                  }}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />

                {isVerifying && (
                  <ActivityIndicator
                    size="small"
                    color="#2B2D5C"
                    style={{
                      marginLeft: 8,
                    }}
                  />
                )}
              </View>

              {/* Verify */}

              <TouchableOpacity
                onPress={handleVerifyPassword}
                disabled={
                  isVerifying ||
                  !currentPassword
                }
                className={`items-center py-3 rounded-xl ${
                  currentPassword
                    ? "bg-[#2B2D5C]"
                    : "bg-gray-300"
                }`}
              >
                {isVerifying ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    التحقق للمتابعة
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (

            /* ================================================= */
            /* STEP 2 */
            /* ================================================= */

            <View>

              {/* Success message */}

              <View className="flex-row items-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
                <Feather
                  name="check-circle"
                  size={18}
                  color="#059669"
                />

                <Text className="flex-1 text-right text-emerald-700 font-bold text-sm ml-2">
                  تم التحقق. أدخل كلمة المرور الجديدة.
                </Text>
              </View>

              {/* ================================================= */}
              {/* New Password */}
              {/* ================================================= */}

              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={isChanging}
                  className="p-1"
                >
                  <Feather
                    name={
                      showPassword
                        ? "eye-off"
                        : "eye"
                    }
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <TextInput
                  ref={newPasswordRef}
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: "#2B2D5C",
                    fontWeight: "600",
                    fontSize: 14,
                    marginLeft: 12,
                    minHeight: 24,
                  }}
                  placeholder="كلمة المرور الجديدة"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  editable={!isChanging}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setPasswordError("");
                  }}
                  onFocus={() => {
                    setKeyboardVisible(true);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    confirmPasswordRef.current?.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>

              {/* ================================================= */}
              {/* Confirm Password */}
              {/* ================================================= */}

              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">

                <Feather
                  name="lock"
                  size={18}
                  color="#94A3B8"
                />

                <TextInput
                  ref={confirmPasswordRef}
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: "#2B2D5C",
                    fontWeight: "600",
                    fontSize: 14,
                    marginLeft: 12,
                    minHeight: 24,
                  }}
                  placeholder="تأكيد كلمة المرور الجديدة"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  editable={!isChanging}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setPasswordError("");
                  }}
                  onFocus={() => {
                    setKeyboardVisible(true);
                  }}
                  returnKeyType="done"
                />
              </View>

              {/* ================================================= */}
              {/* Buttons */}
              {/* ================================================= */}

              <View className="flex-row items-center justify-between mt-2">

                <TouchableOpacity
                  onPress={() => {
                    setIsPasswordVerified(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");

                    Keyboard.dismiss();
                  }}
                  className="px-4 py-3"
                  disabled={isChanging}
                >
                  <Text className="text-[#94A3B8] font-bold text-sm">
                    إلغاء
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={
                    isChanging ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className={`flex-1 ml-4 items-center py-3 rounded-xl ${
                    newPassword &&
                    confirmPassword
                      ? "bg-[#059669]"
                      : "bg-gray-300"
                  }`}
                >
                  {isChanging ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-sm">
                      تأكيد التغيير
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

