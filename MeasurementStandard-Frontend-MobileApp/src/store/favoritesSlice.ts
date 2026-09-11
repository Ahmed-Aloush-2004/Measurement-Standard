import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

interface FavoriteItem {
  id: string;
  question: { id: string; content: string; choices?: any[]; section?: any };
}

interface State {
  items: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = { items: [], isLoading: false, error: null };

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/favorites");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل جلب المفضلة");
    }
  },
);

export const addFavorite = createAsyncThunk(
  "favorites/add",
  async (questionId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/favorites", { questionId });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل إضافة المفضلة");
    }
  },
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async (questionId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/favorites/${questionId}`);
      return questionId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل حذف المفضلة");
    }
  },
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchFavorites.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; })
      .addCase(fetchFavorites.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
      .addCase(addFavorite.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(removeFavorite.fulfilled, (s, a) => { s.items = s.items.filter((f) => f.question.id !== a.payload); });
  },
});

export default favoritesSlice.reducer;
