// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userResponsesReducer from './userResponsesSlice';
import favoritesReducer from './favoritesSlice';
import notificationsReducer from './notificationsSlice';
import userProgressReducer from './userProgressSlice';
import testSessionsReducer from './testSessionsSlice';
import usersReducer from './usersSlice';
import sectionsReducer from './sectionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userResponses: userResponsesReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    userProgress: userProgressReducer,
    testSessions: testSessionsReducer,
    users: usersReducer,
    sections: sectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
