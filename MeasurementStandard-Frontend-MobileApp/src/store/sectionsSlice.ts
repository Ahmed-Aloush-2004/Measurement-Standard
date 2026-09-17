// // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// // import { apiClient } from "../api/client";

// // export interface Section {
// //   id: string;
// //   name: string;
// //   description?: string;
// //   examType?: { id: string; name: string } | null;
// // }

// // export interface ExamType {
// //   id: string;
// //   name: string;
// // }

// // interface State {
// //   sections: Section[];
// //   examTypes: ExamType[];
// //   isLoading: boolean;
// //   error: string | null;
// // }

// // const initialState: State = { sections: [], examTypes: [], isLoading: false, error: null };

// // export const fetchSections = createAsyncThunk(
// //   "sections/fetchAll",
// //   async (_, { rejectWithValue }) => {
// //     try {
// //       const res = await apiClient.get("/sections");
// //       return res.data;
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "فشل جلب الأقسام");
// //     }
// //   },
// // );

// // export const fetchExamTypes = createAsyncThunk(
// //   "examTypes/fetchAll",
// //   async (_, { rejectWithValue }) => {
// //     try {
// //       const res = await apiClient.get("/exam-types");
// //       return res.data;
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "فشل جلب أنواع الاختبارات");
// //     }
// //   },
// // );

// // const sectionsSlice = createSlice({
// //   name: "sections",
// //   initialState,
// //   reducers: {},
// //   extraReducers: (builder) => {
// //     builder
// //       .addCase(fetchSections.pending, (s) => { s.isLoading = true; s.error = null; })
// //       .addCase(fetchSections.fulfilled, (s, a) => { s.isLoading = false; s.sections = a.payload; })
// //       .addCase(fetchSections.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
// //       .addCase(fetchExamTypes.pending, (s) => { s.isLoading = true; s.error = null; })
// //       .addCase(fetchExamTypes.fulfilled, (s, a) => { s.isLoading = false; s.examTypes = a.payload; })
// //       .addCase(fetchExamTypes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
// //   },
// // });

// // export default sectionsSlice.reducer;









// import {
//   createAsyncThunk,
//   createSlice,
// } from '@reduxjs/toolkit';

// import { apiClient } from '../api/client';

// // ============================================================
// // TYPES
// // ============================================================

// export interface ExamType {
//   id: string;
//   name: string;
// }

// export interface Section {
//   id: string;
//   name: string;

//   examType?: ExamType | null;
// }

// interface State {
//   sections: Section[];

//   examTypes: ExamType[];

//   isLoading: boolean;

//   error: string | null;
// }

// const initialState: State = {
//   sections: [],

//   examTypes: [],

//   isLoading: false,

//   error: null,
// };

// // ============================================================
// // FETCH ALL EXAM TYPES
// // ============================================================

// export const fetchExamTypes =
//   createAsyncThunk<
//     ExamType[],
//     void,
//     {
//       rejectValue: string;
//     }
//   >(
//     'sections/fetchExamTypes',

//     async (_, { rejectWithValue }) => {
//       try {
//         const response =
//           await apiClient.get(
//             '/exam-types',
//           );

//         return response.data;
//       } catch (error: any) {
//         return rejectWithValue(
//           error.response?.data?.message ??
//             'فشل جلب أنواع الاختبارات',
//         );
//       }
//     },
//   );

// // ============================================================
// // FETCH ALL SECTIONS
// // ============================================================

// export const fetchSections =
//   createAsyncThunk<
//     Section[],
//     void,
//     {
//       rejectValue: string;
//     }
//   >(
//     'sections/fetchAll',

//     async (_, { rejectWithValue }) => {
//       try {
//         const response =
//           await apiClient.get(
//             '/sections',
//           );

//         return response.data;
//       } catch (error: any) {
//         return rejectWithValue(
//           error.response?.data?.message ??
//             'فشل جلب الأقسام',
//         );
//       }
//     },
//   );

// // ============================================================
// // FETCH SECTIONS FOR ONE EXAM TYPE
// // ============================================================

// export const fetchSectionsByExamType =
//   createAsyncThunk<
//     Section[],
//     string,
//     {
//       rejectValue: string;
//     }
//   >(
//     'sections/fetchByExamType',

//     async (
//       examTypeId,
//       { rejectWithValue },
//     ) => {
//       try {
//         const response =
//           await apiClient.get(
//             `/sections/exam-type/${examTypeId}`,
//           );

//         return response.data;
//       } catch (error: any) {
//         return rejectWithValue(
//           error.response?.data?.message ??
//             'فشل جلب أقسام الاختبار',
//         );
//       }
//     },
//   );

// // ============================================================
// // SLICE
// // ============================================================

// const sectionsSlice =
//   createSlice({
//     name: 'sections',

//     initialState,

//     reducers: {
//       clearSections: (state) => {
//         state.sections = [];
//         state.error = null;
//       },
//     },

//     extraReducers: (
//       builder,
//     ) => {
//       builder

//         // ------------------------------------------------------
//         // EXAM TYPES
//         // ------------------------------------------------------

//         .addCase(
//           fetchExamTypes.pending,
//           (state) => {
//             state.isLoading = true;
//             state.error = null;
//           },
//         )

//         .addCase(
//           fetchExamTypes.fulfilled,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.examTypes =
//               action.payload;
//           },
//         )

//         .addCase(
//           fetchExamTypes.rejected,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.error =
//               action.payload ??
//               'فشل جلب أنواع الاختبارات';
//           },
//         )

//         // ------------------------------------------------------
//         // ALL SECTIONS
//         // ------------------------------------------------------

//         .addCase(
//           fetchSections.pending,
//           (state) => {
//             state.isLoading = true;
//             state.error = null;
//           },
//         )

//         .addCase(
//           fetchSections.fulfilled,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.sections =
//               action.payload;
//           },
//         )

//         .addCase(
//           fetchSections.rejected,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.error =
//               action.payload ??
//               'فشل جلب الأقسام';
//           },
//         )

//         // ------------------------------------------------------
//         // SECTIONS BY EXAM TYPE
//         // ------------------------------------------------------

//         .addCase(
//           fetchSectionsByExamType.pending,
//           (state) => {
//             state.isLoading = true;
//             state.error = null;
//           },
//         )

//         .addCase(
//           fetchSectionsByExamType.fulfilled,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.sections =
//               action.payload;
//           },
//         )

//         .addCase(
//           fetchSectionsByExamType.rejected,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.error =
//               action.payload ??
//               'فشل جلب أقسام الاختبار';
//           },
//         );
//     },
//   });

// export const {
//   clearSections,
// } = sectionsSlice.actions;

// export default sectionsSlice.reducer;






import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../api/client";

export interface QuestionSummary {
  id: string;
  content: string;
}

export interface Section {
  id: string;
  name: string;
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