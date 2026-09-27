
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

export interface QuestionSummary {
  id: string;
  content: string;
}

export interface Section {
  id: string;
  name: string;
  // Not persisted in the API yet; screens guard on it, so it stays optional.
  description?: string | null;
  examType?: {
    id: string;
    name: string;
  } | null;
  questions?: QuestionSummary[];
}

export interface ExamType {
  id: string;
  name: string;
  code : string;
  sections: Section[];
}

interface State {
  examTypes: ExamType[];
  sections: Section[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  examTypes: [],
  sections: [],
  isLoading: false,
  error: null,
};

export const fetchExamTypes = createAsyncThunk<
  ExamType[],
  void,
  { rejectValue: string }
>(
  "sections/fetchExamTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/exam-types");

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ??
          "فشل جلب أنواع الاختبارات",
      );
    }
  },
);

export const fetchSections = createAsyncThunk<
  Section[],
  void,
  { rejectValue: string }
>(
  "sections/fetchSections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/sections");

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ??
          "فشل جلب الأقسام",
      );
    }
  },
);

const sectionsSlice = createSlice({
  name: "sections",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Exam types
      .addCase(fetchExamTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(
        fetchExamTypes.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.examTypes = action.payload;

          state.sections = action.payload.flatMap(
            (examType) =>
              examType.sections.map((section) => ({
                ...section,
                examType: {
                  id: examType.id,
                  name: examType.name,
                },
              })),
          );
        },
      )

      .addCase(
        fetchExamTypes.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload ??
            "حدث خطأ أثناء جلب الاختبارات";
        },
      )

      // Sections
      .addCase(fetchSections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(
        fetchSections.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.sections = action.payload;
        },
      )

      .addCase(
        fetchSections.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload ??
            "حدث خطأ أثناء جلب الأقسام";
        },
      );
  },
});

export default sectionsSlice.reducer;