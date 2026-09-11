import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

interface ProgressData {
  id?: string;
  overall_score: number;
  tests_completed: number;
  last_active_date?: string;
}

interface State {
  data: ProgressData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: State = { data: null, isLoading: false, error: null };

export const fetchProgress = createAsyncThunk(
  "userProgress/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/user-progress");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب التقدم");
    }
  },
);

const userProgressSlice = createSlice({
  name: "userProgress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProgress.fulfilled, (s, a) => { s.isLoading = false; s.data = a.payload; })
      .addCase(fetchProgress.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export default userProgressSlice.reducer;
