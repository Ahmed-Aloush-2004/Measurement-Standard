// import {
//   createAsyncThunk,
//   createSlice,
// } from '@reduxjs/toolkit';

// import {
//   apiClient,
//   getErrorMessage,
// } from '../api/client';

// // ============================================================
// // TYPES
// // ============================================================

// export interface QuizChoice {
//   id: string;
//   content: string;
// }

// export interface QuizExamType {
//   id: string;
//   name: string;
// }

// export interface QuizSection {
//   id: string;
//   name: string;

//   examType?: QuizExamType | null;
// }

// export interface QuizQuestion {
//   id: string;

//   content: string;

//   explanation?: string | null;

//   section?: QuizSection | null;

//   choices: QuizChoice[];
// }

// interface FetchParams {
//   examTypeId?: string;

//   sectionId?: string;

//   limit?: number;

//   random?: boolean;
// }

// interface State {
//   questions: QuizQuestion[];

//   isLoading: boolean;

//   error: string | null;
// }

// const initialState: State = {
//   questions: [],

//   isLoading: false,

//   error: null,
// };

// // ============================================================
// // FETCH QUESTIONS
// // ============================================================

// export const fetchQuizQuestions =
//   createAsyncThunk<
//     QuizQuestion[],
//     FetchParams,
//     {
//       rejectValue: string;
//     }
//   >(
//     'quizQuestions/fetch',

//     async (
//       {
//         examTypeId,
//         sectionId,
//         limit = 10,
//         random = true,
//       },
//       {
//         rejectWithValue,
//       },
//     ) => {
//       try {
//         const params: Record<
//           string,
//           string | number
//         > = {
//           limit,

//           random: String(random),
//         };

//         if (examTypeId) {
//           params.examTypeId =
//             examTypeId;
//         }

//         if (sectionId) {
//           params.sectionId =
//             sectionId;
//         }

//         const response =
//           await apiClient.get(
//             '/questions',
//             {
//               params,
//             },
//           );

//         return response.data;
//       } catch (error: any) {
//         return rejectWithValue(
//           getErrorMessage(
//             error,
//             'فشل جلب الأسئلة',
//           ),
//         );
//       }
//     },
//   );

// // ============================================================
// // SLICE
// // ============================================================

// const questionsSlice =
//   createSlice({
//     name: 'quizQuestions',

//     initialState,

//     reducers: {
//       resetQuiz: (state) => {
//         state.questions = [];

//         state.error = null;
//       },
//     },

//     extraReducers: (
//       builder,
//     ) => {
//       builder

//         .addCase(
//           fetchQuizQuestions.pending,
//           (state) => {
//             state.isLoading = true;

//             state.error = null;
//           },
//         )

//         .addCase(
//           fetchQuizQuestions.fulfilled,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.questions =
//               action.payload;
//           },
//         )

//         .addCase(
//           fetchQuizQuestions.rejected,
//           (
//             state,
//             action,
//           ) => {
//             state.isLoading = false;

//             state.error =
//               action.payload ??
//               'فشل جلب الأسئلة';
//           },
//         );
//     },
//   });

// export const {
//   resetQuiz,
// } = questionsSlice.actions;

// export default questionsSlice.reducer;



import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, getErrorMessage } from '../api/client';

export interface QuizChoice {
  id: string;
  content: string;
}

export interface QuizExamType {
  id: string;
  name: string;
}

export interface QuizSection {
  id: string;
  name: string;
  examType?: QuizExamType | null;
}

export interface QuizQuestion {
  id: string;
  content: string;
  explanation?: string | null;
  section?: QuizSection | null;
  choices: QuizChoice[];
}

interface FetchParams {
  examTypeId?: string;
  sectionId?: string;
  limit?: number;
  random?: boolean;
}

interface State {
  questions: QuizQuestion[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  questions: [],
  isLoading: false,
  error: null,
};

export const fetchQuizQuestions = createAsyncThunk<
  QuizQuestion[],
  FetchParams,
  { rejectValue: string }
>(
  'quizQuestions/fetch',
  async ({ examTypeId, sectionId, limit = 10, random = true }, { rejectWithValue }) => {
    try {
      const params: Record<string, string | number> = {
        limit,
        random: String(random),
      };

      if (examTypeId) params.examTypeId = examTypeId;
      if (sectionId) params.sectionId = sectionId;

      const response = await apiClient.get('/questions', { params });

      // FIX: Extract `data` array from response object { data: [...], meta: {...} }
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, 'فشل جلب الأسئلة'));
    }
  }
);

const questionsSlice = createSlice({
  name: 'quizQuestions',
  initialState,
  reducers: {
    resetQuiz: (state) => {
      state.questions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuizQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'فشل جلب الأسئلة';
      });
  },
});

export const { resetQuiz } = questionsSlice.actions;
export default questionsSlice.reducer;