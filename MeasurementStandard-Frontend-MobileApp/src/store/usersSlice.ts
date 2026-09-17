import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, getErrorMessage } from "../api/client";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at?: string;
  profile_picture?: string | null;
}

interface State {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdatingImage: boolean;
  error: string | null;
}

const initialState: State = { profile: null, isLoading: false, isUpdatingImage: false, error: null };

export const fetchProfile = createAsyncThunk(
  "users/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/users/profile");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "فشل جلب الملف الشخصي"));
    }
  },
);

export const updateProfileImage = createAsyncThunk(
  "users/updateImage",
  async (image: { uri: string; name: string; type: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", image as any);
      
      // لا نضع Content-Type يدوياً هنا (يضبطه الـ interceptor تلقائياً)
      const res = await apiClient.patch("/users/profile/image", formData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "فشل تحديث الصورة"));
    }
  },
);

export const deleteProfileImage = createAsyncThunk(
  "users/deleteImage",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete("/users/profile/image");
      return null;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "فشل حذف الصورة"));
    }
  },
);



export const verifyCurrentPassword = createAsyncThunk(
  "users/verifyPassword",
  async (data: { password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/verify-password", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "كلمة المرور الحالية غير صحيحة"));
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "users/changePassword",
  async (data: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch("/auth/change-password", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "فشل تغيير كلمة المرور"));
    }
  }
);




export const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async (data: { username: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch("/users/profile", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "فشل تحديث الاسم"));
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.isLoading = false; s.profile = a.payload; })
      .addCase(fetchProfile.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
      .addCase(updateProfileImage.pending, (s) => { s.isUpdatingImage = true; })
      .addCase(updateProfileImage.fulfilled, (s, a) => { s.isUpdatingImage = false; s.profile = a.payload; })
      .addCase(updateProfileImage.rejected, (s, a) => { s.isUpdatingImage = false; s.error = a.payload as string; })
      .addCase(deleteProfileImage.fulfilled, (s, a) => {
        if (s.profile) s.profile.profile_picture = null;
      });
  },
});

export default usersSlice.reducer;
