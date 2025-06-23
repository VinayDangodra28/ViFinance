import { createSlice } from '@reduxjs/toolkit';

const initialState = JSON.parse(localStorage.getItem('darkMode')) || false;

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      const newState = !state;
      localStorage.setItem('darkMode', JSON.stringify(newState));
      return newState;
    },
  },
});

export const { toggleDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
