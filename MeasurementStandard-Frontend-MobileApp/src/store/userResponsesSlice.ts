import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

interface Choice {
  id: string;
  content: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  content: string;
  explanation?: string;
  choices?: Choice[];
}

interface UserResponse {
  id: string;
  is_correct: boolean;
  answered_at: string;
  question: Question;
}

interface State {
  items: UserResponse[];
  mistakes: UserResponse[];
  isLoading: boolean;
  isLoadingMistakes: boolean;
  error: string | null;
}

const initialState: State = {
  items: [],
  mistakes: [],
  isLoading: false,
  isLoadingMistakes: false,
  error: null,
};

export const fetchMyResponses = createAsyncThunk(
  "userResponses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/user-responses");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب الإجابات");
    }
  },
);

export const fetchMistakes = createAsyncThunk(
  "userResponses/fetchMistakes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/user-responses/mistakes");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب الأخطاء");
    }
  },
);

const userResponsesSlice = createSlice({
  name: "userResponses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyResponses.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchMyResponses.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; })
      .addCase(fetchMyResponses.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
      .addCase(fetchMistakes.pending, (s) => { s.isLoadingMistakes = true; s.error = null; })
      .addCase(fetchMistakes.fulfilled, (s, a) => { s.isLoadingMistakes = false; s.mistakes = a.payload; })
      .addCase(fetchMistakes.rejected, (s, a) => { s.isLoadingMistakes = false; s.error = a.payload as string; });
  },
});

export default userResponsesSlice.reducer;
