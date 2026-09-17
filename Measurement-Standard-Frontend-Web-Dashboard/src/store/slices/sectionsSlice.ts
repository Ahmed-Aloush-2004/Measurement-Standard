

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../api/axiosClient';
import type { Section } from '../../types';

export const fetchSections = createAsyncThunk('sections/fetchAll', async (examTypeId?: string) => {
  const response = await axiosClient.get('/sections', { params: { examTypeId } });
  return response.data;
});

export const createSection = createAsyncThunk(
  'sections/create',
  async ({ name, examTypeId }: { name: string; examTypeId: string }) => {
    const response = await axiosClient.post('/sections', { name, examTypeId });
    return response.data;
  }
);

export const updateSection = createAsyncThunk(
  'sections/update',
  async ({ id, name }: { id: string; name: string }) => {
    const response = await axiosClient.patch(`/sections/${id}`, { name });
    return response.data;
  }
);

export const deleteSection = createAsyncThunk('sections/delete', async (id: string) => {
  await axiosClient.delete(`/sections/${id}`);
  return id;
});

const sectionsSlice = createSlice({
  name: 'sections',
  initialState: { data: [] as Section[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => { state.loading = true; })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createSection.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateSection.fulfilled, (state, action) => {
        const index = state.data.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.data = state.data.filter((s) => s.id !== action.payload);
      });
  },
});

export default sectionsSlice.reducer;