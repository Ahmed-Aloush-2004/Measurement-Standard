import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

interface ExamType {
  id: string;
  name: string;
}

interface TestSession {
  id: string;
  score: number;
  total_questions: number;
  examType: ExamType | null;
  created_at: string;
}

interface State {
  items: TestSession[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = { items: [], isLoading: false, error: null };

export const fetchMyTestSessions = createAsyncThunk(
  "testSessions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/test-sessions");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب الاختبارات");
    }
  },
);

const testSessionsSlice = createSlice({
  name: "testSessions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTestSessions.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchMyTestSessions.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; })
      .addCase(fetchMyTestSessions.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export default testSessionsSlice.reducer;
