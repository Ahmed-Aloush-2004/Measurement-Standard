
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../api/axiosClient';

export interface SendNotificationPayload {
  user_email?: string;
  title: string;
  message: string;
  type?: string;
  url?: string;
  data?: Record<string, any>;
  expiresAt?: string;
}

interface NotificationsState {
  sending: boolean;
  successMessage: string | null;
  error: string | null;
}

const initialState: NotificationsState = {
  sending: false,
  successMessage: null,
  error: null,
};

// Send to all users or a specific user based on payload contents
export const createNotification = createAsyncThunk(
  'notifications/create',
  async (payload: SendNotificationPayload, { rejectWithValue }) => {
    try {
      // If payload has userId -> POST /notifications
      // If broadcast to all -> POST /notifications/all-user
      const endpoint = payload.user_email ? '/notifications' : '/notifications/all-user';
      const response = await axiosClient.post(endpoint, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل في إرسال الإشعار'
      );
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationState: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNotification.pending, (state) => {
        state.sending = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createNotification.fulfilled, (state) => {
        state.sending = false;
        state.successMessage = 'تم إرسال الإشعار بنجاح';
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotificationState } = notificationsSlice.actions;
export default notificationsSlice.reducer;