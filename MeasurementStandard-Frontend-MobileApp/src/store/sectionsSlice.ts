import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

export interface Section {
  id: string;
  name: string;
  description?: string;
}

export interface ExamType {
  id: string;
  name: string;
}

interface State {
  sections: Section[];
  examTypes: ExamType[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = { sections: [], examTypes: [], isLoading: false, error: null };

export const fetchSections = createAsyncThunk(
  "sections/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/sections");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب الأقسام");
    }
  },
);

export const fetchExamTypes = createAsyncThunk(
  "examTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/exam-types");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب أنواع الاختبارات");
    }
  },
);

const sectionsSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchSections.fulfilled, (s, a) => { s.isLoading = false; s.sections = a.payload; })
      .addCase(fetchSections.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
      .addCase(fetchExamTypes.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchExamTypes.fulfilled, (s, a) => { s.isLoading = false; s.examTypes = a.payload; })
      .addCase(fetchExamTypes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export default sectionsSlice.reducer;