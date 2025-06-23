import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './features/accounts/accountsSlice';
import darkModeReducer from './features/darkMode/darkModeSlice';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    darkMode: darkModeReducer,
  },
});

export default store;
