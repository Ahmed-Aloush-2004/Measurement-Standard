
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../api/axiosClient';
import type { ExamType } from '../../types';

export const fetchExamTypes = createAsyncThunk('examTypes/fetchAll', async () => {
  const response = await axiosClient.get('/exam-types');
  return response.data;
});

export const updateExamType = createAsyncThunk(
  'examTypes/update',
  async ({ id, name, code }: { id: string; name: string; code: string }) => {
    const response = await axiosClient.patch(`/exam-types/${id}`, { name, code });
    return response.data;
  }
);

export const deleteExamType = createAsyncThunk('examTypes/delete', async (id: string) => {
  await axiosClient.delete(`/exam-types/${id}`);
  return id;
});

const examTypesSlice = createSlice({
  name: 'examTypes',
  initialState: { data: [] as ExamType[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamTypes.pending, (state) => { state.loading = true; })
      .addCase(fetchExamTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateExamType.fulfilled, (state, action) => {
        const index = state.data.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
      })
      .addCase(deleteExamType.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
      });
  },
});

export default examTypesSlice.reducer;