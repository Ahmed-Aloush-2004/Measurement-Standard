
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../api/axiosClient';
import type { Question } from '../../types';

interface FetchParams {
  page?: number;
  limit?: number;
  examTypeId?: string;
  sectionId?: string;
  order?: 'ASC' | 'DESC';
}

export interface CreateQuestionPayload {
  content: string;
  explanation?: string;
  sectionId: string;
  choices?: { content: string; is_correct: boolean }[];
}

export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (params: FetchParams) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined)
  );
  const response = await axiosClient.get('/questions', { params: cleanParams });
  return response.data;
});

export const createQuestion = createAsyncThunk('questions/create', async (data: CreateQuestionPayload) => {
  const response = await axiosClient.post('/questions', data);
  return response.data;
});

export const updateQuestion = createAsyncThunk('questions/update', async ({ id, data }: { id: string; data: Partial<Question> }) => {
  const response = await axiosClient.patch(`/questions/${id}`, data);
  return response.data;
});

export const deleteQuestion = createAsyncThunk('questions/delete', async (id: string) => {
  await axiosClient.delete(`/questions/${id}`);
  return id;
});

const questionsSlice = createSlice({
  name: 'questions',
  initialState: {
    items: [] as Question[],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        const rawData = action.payload.data ?? action.payload.items ?? action.payload;
        const meta = action.payload.meta;

        state.items = Array.isArray(rawData) ? rawData : [];
        state.total = meta?.total ?? action.payload.total ?? state.items.length;
        state.page = meta?.page ?? action.payload.page ?? 1;
        state.totalPages = meta?.totalPages ?? action.payload.totalPages ?? 1;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.items.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export default questionsSlice.reducer;