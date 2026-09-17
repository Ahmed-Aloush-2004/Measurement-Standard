import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import examTypesReducer from './slices/examTypesSlice';
import sectionsReducer from './slices/sectionsSlice';
import questionsReducer from './slices/questionsSlice';
import notificationsReducer from './slices/notificationsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    examTypes: examTypesReducer,
    sections: sectionsReducer,
    questions: questionsReducer,
    notifications:notificationsReducer,
    users:usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;