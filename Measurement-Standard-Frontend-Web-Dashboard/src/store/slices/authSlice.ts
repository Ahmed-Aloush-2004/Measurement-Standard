
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { axiosClient } from '../../api/axiosClient';
import type { UserProfile } from '../../types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/users/profile');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'فشل جلب ملف المستخدم');
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials: any, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/auth/login', credentials);
    const { access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    await dispatch(fetchProfile());
    return access_token;
  } catch (err: any) {
    localStorage.removeItem('access_token');
    return rejectWithValue(typeof err === 'string' ? err : err.response?.data?.message || 'بيانات الدخول غير صحيحة');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

