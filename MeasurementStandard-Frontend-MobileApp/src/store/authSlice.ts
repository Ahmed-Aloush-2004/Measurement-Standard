// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getErrorMessage } from '../api/client';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  isBootstrapping: boolean;
  hasBootstrapped: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  isBootstrapping: true,
  hasBootstrapped: false,
};

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return null;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await apiClient.get('/users/profile');
      return { access_token: token, user: res.data };
    } catch {
      await AsyncStorage.removeItem('access_token');
      return null;
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      await AsyncStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, 'فشل تسجيل الدخول'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);

            // console.log('------------------------------------------');
            // console.log('Registration formData:', formData);
            // console.log('------------------------------------------');


      // لا نضع Content-Type يدوياً هنا (يضبطه الـ interceptor تلقائياً)
      const response = await apiClient.post('/auth/register', formData);

            // console.log('------------------------------------------');
            // console.log('Registration response:', response.data);
            // console.log('------------------------------------------');

      await AsyncStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, 'فشل إنشاء الحساب'));
    }
  }
);

export const googleLoginMobile = createAsyncThunk(
  'auth/googleMobile',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/google/verify', { token });
      await AsyncStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, 'فشل المصادقة عبر جوجل'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    },
  },
  extraReducers: (builder) => {
    builder
      // bootstrap
      .addCase(bootstrapAuth.pending, (state) => { state.isBootstrapping = true; })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isBootstrapping = false;
        state.hasBootstrapped = true;
        if (action.payload) {
          state.accessToken = action.payload.access_token;
          state.user = action.payload.user;
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isBootstrapping = false;
        state.hasBootstrapped = true;
      });

    const handleAuthPending = (state: AuthState) => { state.isLoading = true; state.error = null; };
    const handleAuthFulfilled = (state: AuthState, action: any) => {
      state.isLoading = false;
      state.accessToken = action.payload.access_token;
    };
    const handleAuthRejected = (state: AuthState, action: any) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    builder.addCase(loginUser.pending, handleAuthPending)
           .addCase(loginUser.fulfilled, handleAuthFulfilled)
           .addCase(loginUser.rejected, handleAuthRejected);

    builder.addCase(registerUser.pending, handleAuthPending)
           .addCase(registerUser.fulfilled, handleAuthFulfilled)
           .addCase(registerUser.rejected, handleAuthRejected);

    builder.addCase(googleLoginMobile.pending, handleAuthPending)
           .addCase(googleLoginMobile.fulfilled, handleAuthFulfilled)
           .addCase(googleLoginMobile.rejected, handleAuthRejected);
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
