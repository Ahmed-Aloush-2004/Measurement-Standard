import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface State {
  items: NotificationItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = { items: [], isLoading: false, error: null };

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/notifications");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب الإشعارات");
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل تحديث الإشعار");
    }
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; })
      .addCase(fetchNotifications.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
      .addCase(markNotificationAsRead.fulfilled, (s, a) => {
        const item = s.items.find((n) => n.id === a.payload);
        if (item) item.is_read = true;
      });
  },
});

export default notificationsSlice.reducer;
