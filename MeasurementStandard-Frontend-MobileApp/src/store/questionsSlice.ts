import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, getErrorMessage } from "../api/client";

export interface QuizChoice {
  id: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  content: string;
  explanation?: string;
  choices: QuizChoice[];
  section?: { id: string; name: string } | null;
}

interface FetchParams {
  examTypeId?: string;
  sectionId?: string;
  limit?: number;
}

interface State {
  questions: QuizQuestion[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = { questions: [], isLoading: false, error: null };

export const fetchQuizQuestions = createAsyncThunk(
  "quizQuestions/fetch",
  async ({ examTypeId, sectionId, limit = 10 }: FetchParams, { rejectWithValue }) => {
    try {
      const params: Record<string, any> = { random: "true", limit:30 };
      if (examTypeId) params.examTypeId = examTypeId;
      if (sectionId) params.sectionId = sectionId;
      const res = await apiClient.get("/questions", { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "فشل جلب الأسئلة"));
    }
  },
);

const questionsSlice = createSlice({
  name: "quizQuestions",
  initialState,
  reducers: {
    resetQuiz: (state) => {
      state.questions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizQuestions.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchQuizQuestions.fulfilled, (s, a) => { s.isLoading = false; s.questions = a.payload; })
      .addCase(fetchQuizQuestions.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { resetQuiz } = questionsSlice.actions;
export default questionsSlice.reducer;