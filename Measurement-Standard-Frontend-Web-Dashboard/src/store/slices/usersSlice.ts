import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { axiosClient } from '../../api/axiosClient';
import type { Role, UserProfile } from '../../types';

interface UsersState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  searchTerm: '',
};

export const fetchUsers = createAsyncThunk<UserProfile[], void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/users');
      return response.data;
    } catch (err: any) {
      return rejectWithValue('فشل جلب قائمة المستخدمين');
    }
  }
);

export const updateUserRole = createAsyncThunk<
  { userId: string; newRole: Role },
  { userId: string; newRole: Role },
  { rejectValue: string }
>(
  'users/updateUserRole',
  async ({ userId, newRole }, { rejectWithValue }) => {
    try {
      await axiosClient.patch(`/users/${userId}/role`, { role: newRole });
      return { userId, newRole };
    } catch (err: any) {
      return rejectWithValue('فشل تعديل الصلاحية');
    }
  }
);

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/users/${userId}`);
      return userId;
    } catch (err: any) {
      return rejectWithValue('فشل حذف المستخدم');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'حدث خطأ غير متوقع';
      })
      // Update Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, newRole } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.role = newRole;
        }
      })
      .addCase(updateUserRole.rejected, (_, action) => {
        alert(action.payload);
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (_, action) => {
        alert(action.payload);
      });
  },
});

export const { setSearchTerm } = usersSlice.actions;
export default usersSlice.reducer;